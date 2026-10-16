#!/usr/bin/env bun
/**
 * agent-digest — the part of an agent session log worth keeping: what you
 * asked, what the agent answered, and what came out of it (PRs, commits).
 *
 * Reads Codex rollouts (~/.codex/sessions/**.jsonl) and Claude Code
 * transcripts (~/.claude/projects/**.jsonl). Drops reasoning, tool calls,
 * tool output, token counts and injected context. Deterministic: the same
 * log always gives the same digest. Never modifies or deletes a log.
 *
 *   agent-digest                       digest everything new or changed
 *   agent-digest <file|dir>...         digest just these
 *   agent-digest --all-replies         keep every agent reply, not only each turn's last
 *   agent-digest --out <dir>           where digests go (default ~/.agent-digests)
 *   agent-digest --force               redo digests that are already current
 *   agent-digest --stdout <file>       print one digest instead of writing it
 *   agent-digest --search <text>       grep the digests (case-insensitive)
 *
 * Output: <out>/<harness>/<YYYY-MM-DD>-<id8>.md per session, and
 * <out>/index.jsonl (one line per session: id, harness, cwd, dates,
 * title, first prompt, turns, PRs, commits, source path and size).
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

type Harness = "codex" | "claude";
type Turn = { at: string; prompt: string; replies: string[] };
type Digest = {
  id: string;
  harness: Harness;
  cwd: string;
  started: string;
  ended: string;
  title: string;
  turns: Turn[];
  prs: string[];
  commits: string[];
  source: string;
  sourceBytes: number;
};

const HOME = homedir();
const DEFAULT_ROOTS = [join(HOME, ".codex", "sessions"), join(HOME, ".claude", "projects")];
const PR_URL = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/g;
// `git commit` prints "[branch abc1234] subject"
const COMMIT_LINE = /\[([\w./-]+) ([0-9a-f]{7,40})\] ([^\n\\"]{1,120})/g;
const MAX_TEXT = 4000;

/* ── What counts as a person's prompt ─────────────────────────────────── */

const INJECTED = [
  /^\s*</, // <environment_context>, <command-name>, <local-command-…>, <system-reminder>, <pasted_content> wrappers handled below
  /^# AGENTS\.md instructions/,
  /^Caveat: The messages below were generated/,
];

function promptText(raw: string): string | null {
  let text = raw.trim();
  if (!text) return null;
  // a paste is the person's words: keep its body, drop the wrapper
  const pasted = text.match(/^<pasted_content[^>]*>([\s\S]*?)<\/pasted_content>([\s\S]*)$/);
  if (pasted) text = `${pasted[1]!.trim()}\n${pasted[2]!.trim()}`.trim();
  else if (INJECTED.some((re) => re.test(text))) return null;
  if (text.startsWith("This session is being continued from a previous conversation")) return "[continued from an earlier context: summary omitted]";
  return clip(text);
}

function clip(text: string): string {
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}\n… [${text.length - MAX_TEXT} more chars]` : text;
}

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((c) => (c && typeof c === "object" && "text" in c && typeof (c as { text: unknown }).text === "string" ? (c as { text: string }).text : ""))
    .filter(Boolean)
    .join("\n");
}

/* ── Reading one log ──────────────────────────────────────────────────── */

async function digestFile(path: string, allReplies: boolean): Promise<Digest | null> {
  const d: Digest = {
    id: basename(path, ".jsonl"),
    harness: "claude",
    cwd: "",
    started: "",
    ended: "",
    title: "",
    turns: [],
    prs: [],
    commits: [],
    source: path,
    sourceBytes: statSync(path).size,
  };
  const prs = new Set<string>();
  const commits = new Map<string, string>();
  let detected: Harness | null = null;
  let turn: Turn | null = null;

  const startTurn = (at: string, prompt: string) => {
    turn = { at, prompt, replies: [] };
    d.turns.push(turn);
  };
  const reply = (text: string) => {
    const t = text.trim();
    if (!t) return;
    if (!turn) startTurn(d.started, "[no prompt recorded]");
    if (allReplies) turn!.replies.push(clip(t));
    else turn!.replies = [clip(t)];
  };
  const scan = (line: string) => {
    for (const m of line.matchAll(PR_URL)) prs.add(m[0]);
    for (const m of line.matchAll(COMMIT_LINE)) if (!commits.has(m[2]!)) commits.set(m[2]!, `${m[2]!.slice(0, 9)} ${m[1]} · ${m[3]!.trim()}`);
  };

  const lines = createInterface({ input: createReadStream(path, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line) continue;
    // cheap prefilter: artifacts can sit in any record, tool output included
    if (line.includes("github.com/") || line.includes("] ")) scan(line);
    let rec: any;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const at: string = rec.timestamp ?? "";
    if (at) {
      if (!d.started) d.started = at;
      d.ended = at;
    }

    // Codex rollout
    if (rec.type === "session_meta") {
      detected = "codex";
      d.harness = "codex";
      d.id = rec.payload?.id ?? d.id;
      d.cwd = rec.payload?.cwd ?? d.cwd;
      continue;
    }
    if (rec.type === "response_item" && rec.payload?.type === "message") {
      detected ??= "codex";
      const role = rec.payload.role;
      const text = textOf(rec.payload.content);
      if (role === "user") {
        const p = promptText(text);
        if (p) startTurn(at, p);
      } else if (role === "assistant") reply(text);
      continue;
    }

    // Claude Code transcript
    if (rec.type === "user" || rec.type === "assistant") {
      detected ??= "claude";
      if (rec.isSidechain) continue; // subagent traffic, not the conversation
      if (!d.cwd && rec.cwd) d.cwd = rec.cwd;
      if (rec.sessionId && d.harness === "claude") d.id = rec.sessionId;
      const content = rec.message?.content;
      if (rec.type === "user") {
        if (rec.isMeta) continue;
        if (Array.isArray(content) && content.some((c: any) => c?.type === "tool_result")) continue;
        const p = promptText(textOf(content));
        if (p) startTurn(at, p);
      } else {
        reply(textOf(Array.isArray(content) ? content.filter((c: any) => c?.type === "text") : content));
      }
      continue;
    }
    if (rec.type === "pr-link" && rec.prUrl) prs.add(rec.prUrl);
    if (rec.type === "custom-title" && rec.customTitle) d.title = rec.customTitle;
    if (rec.type === "summary" && rec.summary && !d.title) d.title = rec.summary;
  }
  if (!detected || d.turns.length === 0) return null;
  d.prs = [...prs].sort();
  d.commits = [...commits.values()];
  return d;
}

/* ── Writing ──────────────────────────────────────────────────────────── */

function toMarkdown(d: Digest): string {
  const out: string[] = [];
  out.push(`# ${d.title || d.turns[0]!.prompt.split("\n")[0]!.slice(0, 80)}`);
  out.push("");
  out.push(`- harness: ${d.harness}`);
  out.push(`- session: ${d.id}`);
  if (d.cwd) out.push(`- cwd: ${d.cwd}`);
  out.push(`- when: ${d.started} → ${d.ended}`);
  out.push(`- source: ${d.source} (${mb(d.sourceBytes)})`);
  if (d.prs.length) out.push(`- PRs: ${d.prs.join(" ")}`);
  out.push("");
  if (d.commits.length) {
    out.push("## Commits", "");
    for (const c of d.commits) out.push(`- ${c}`);
    out.push("");
  }
  out.push("## Conversation", "");
  for (const t of d.turns) {
    out.push(`### ${t.at.slice(0, 16).replace("T", " ")}`, "");
    out.push(quote(t.prompt), "");
    for (const r of t.replies) out.push(r, "");
  }
  return out.join("\n");
}

const quote = (s: string) => s.split("\n").map((l) => `> ${l}`).join("\n");
const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

function digestPath(outDir: string, d: Digest): string {
  const day = (d.started || "0000-00-00").slice(0, 10);
  return join(outDir, d.harness, `${day}-${d.id.slice(0, 8)}.md`);
}

function* walk(path: string): Generator<string> {
  if (!existsSync(path)) return;
  const st = statSync(path);
  if (st.isFile()) {
    if (path.endsWith(".jsonl")) yield path;
    return;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const p = join(path, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith(".jsonl")) yield p;
  }
}

/* ── Main ─────────────────────────────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const i = args.indexOf(name);
    if (i < 0) return false;
    args.splice(i, 1);
    return true;
  };
  const opt = (name: string) => {
    const i = args.indexOf(name);
    if (i < 0) return null;
    const v = args[i + 1] ?? null;
    args.splice(i, 2);
    return v;
  };
  if (flag("--help") || flag("-h")) {
    console.log(readFileSync(import.meta.path, "utf8").split("*/")[0]!.replace(/^#!.*\n\/\*\*?/, "").replace(/^ \* ?/gm, ""));
    return;
  }
  const allReplies = flag("--all-replies");
  const force = flag("--force");
  const outDir = resolve(opt("--out") ?? join(HOME, ".agent-digests"));
  const stdoutFile = opt("--stdout");
  const search = opt("--search");

  if (search) {
    const needle = search.toLowerCase();
    for (const f of walkMd(outDir)) {
      const lines = readFileSync(f, "utf8").split("\n");
      lines.forEach((l, i) => {
        if (l.toLowerCase().includes(needle)) console.log(`${f}:${i + 1}: ${l.slice(0, 200)}`);
      });
    }
    return;
  }

  if (stdoutFile) {
    const d = await digestFile(resolve(stdoutFile), allReplies);
    if (!d) return void console.error("no conversation found in that log");
    process.stdout.write(toMarkdown(d));
    return;
  }

  const roots = args.length ? args.map((a) => resolve(a)) : DEFAULT_ROOTS;
  const indexPath = join(outDir, "index.jsonl");
  const index = new Map<string, Record<string, unknown>>();
  if (existsSync(indexPath)) {
    for (const l of readFileSync(indexPath, "utf8").split("\n")) {
      if (!l) continue;
      try {
        const r = JSON.parse(l);
        index.set(r.source, r);
      } catch {}
    }
  }

  let done = 0, skipped = 0, empty = 0, inBytes = 0, outBytes = 0;
  for (const root of roots) {
    for (const file of walk(root)) {
      const st = statSync(file);
      const prev = index.get(file);
      if (!force && prev && prev.sourceBytes === st.size && prev.sourceMtime === st.mtimeMs && existsSync(String(prev.digest))) {
        skipped++;
        continue;
      }
      const d = await digestFile(file, allReplies);
      if (!d) {
        empty++;
        continue;
      }
      const md = toMarkdown(d);
      const target = digestPath(outDir, d);
      mkdirSync(join(outDir, d.harness), { recursive: true });
      writeFileSync(target, md);
      index.set(file, {
        id: d.id,
        harness: d.harness,
        cwd: d.cwd,
        started: d.started,
        ended: d.ended,
        title: d.title,
        firstPrompt: d.turns[0]!.prompt.slice(0, 200),
        turns: d.turns.length,
        prs: d.prs,
        commits: d.commits.length,
        source: file,
        sourceBytes: st.size,
        sourceMtime: st.mtimeMs,
        digest: target,
        digestBytes: Buffer.byteLength(md),
      });
      done++;
      inBytes += st.size;
      outBytes += Buffer.byteLength(md);
      if (done % 50 === 0) console.error(`… ${done} digested`);
    }
  }
  mkdirSync(outDir, { recursive: true });
  const rows = [...index.values()].sort((a, b) => String(a.started).localeCompare(String(b.started)));
  writeFileSync(indexPath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log(
    `${done} digested (${mb(inBytes)} → ${mb(outBytes)}), ${skipped} already current, ${empty} with no conversation. ${rows.length} sessions in ${indexPath}`,
  );
}

function* walkMd(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMd(p);
    else if (entry.name.endsWith(".md")) yield p;
  }
}

await main();
