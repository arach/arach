---
name: agent-digest
description: Turn Codex and Claude Code session logs into small, searchable digests of what was asked, what the agent answered, and the PRs and commits that came out of it. Use when recalling what an earlier session decided or shipped, finding which session opened a PR, searching past conversations, or before compressing or deleting agent logs to free disk space.
---

# Agent digest

Agent session logs are mostly machinery: reasoning, tool calls, tool output,
token counts and injected instructions. What is worth keeping is the
conversation and its results. `agent-digest` keeps exactly that, without a
model, so the same log always gives the same digest. On a typical machine
several gigabytes of logs become a few megabytes.

## Run it

Resolve `agent-digest` from PATH. If it is missing, run the script bundled with
this skill with Bun, or link it onto PATH once:

```sh
bun <this skill's directory>/agent-digest.ts --help
ln -sf "<this skill's directory>/agent-digest.ts" "$HOME/.local/bin/agent-digest"
```

It needs Bun and nothing else, and runs on macOS and Linux.

```sh
agent-digest                          # digest every new or changed log
agent-digest --search "release 0.3.9" # search all digests, case-insensitive
agent-digest --stdout <log.jsonl>     # print one session's digest
agent-digest <file-or-directory>...   # digest only these logs
agent-digest --all-replies            # keep every reply, not only each turn's last
agent-digest --out <directory>        # write digests somewhere else
agent-digest --force                  # rebuild digests that are already current
```

With no paths it reads `~/.codex/sessions` and `~/.claude/projects`. A rerun
only reads logs whose size or modification time changed.

## What a digest holds

One Markdown file per session at
`~/.agent-digests/<codex|claude>/<YYYY-MM-DD>-<id8>.md`:

- a header: title, session id, working directory, start and end times, source
  log and its size, and every GitHub PR link found anywhere in the session
- **Commits**: each `git commit` the session ran, as hash, branch and subject
- **Conversation**: each prompt the person wrote, followed by the agent's last
  reply in that turn. Pasted text is kept. Tool results, reasoning, injected
  context and subagent traffic are dropped. Long messages are clipped at 4,000
  characters with a note.

`~/.agent-digests/index.jsonl` has one line per session (harness, cwd, dates,
title, first prompt, turn count, PRs, commit count, source path and size,
digest path). Query it with `jq`, for example:

```sh
jq -r 'select(.prs | length > 0) | "\(.started[0:10]) \(.cwd) \(.prs | join(" "))"' ~/.agent-digests/index.jsonl
```

## Rules

- `agent-digest` only reads logs. It never modifies, compresses or deletes them.
- Codex and Claude Code resume sessions from these logs. Compress or delete a raw
  log only when the person asks, never while a session that uses it is open
  (check with `lsof <log>`), and only after its digest exists.
- Digests stay on the machine that wrote them. Run `agent-digest` on each host;
  do not copy another machine's logs or digests between hosts.
- A digest is a record of what was said, not proof of the current state. Verify
  a PR or commit against GitHub or the repository before relying on it.
