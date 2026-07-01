---
name: arach
description: Personal meta-skill for Arach. Use this as the entry point to understand Arach's projects, conventions, available skills, and preferred agent workflows. Activates on "arach's projects", "what does arach work on", when working in any arach/* repo, or when Arach asks to explain something with context, send it to a Scout/ACP-enabled reviewer, collect the review, and decide the next step.
---

# arach

Personal skill index for Arach (@arach). This is the entry point for understanding my projects, conventions, and how to work with my codebase.

## Conventions

**Always follow these when working on my projects:**

- Use **Bun** over pnpm/npm (check for bun.lockb or bun.lock first)
- Prefer **TypeScript** for all new projects and logic
- Add **gitmoji** to all commit messages (✨ feature, 🐛 fix, 🎨 improve, etc.)
- **NEVER** add co-authoring attribution or "Generated with Claude Code" footers
- Allow all Puppeteer uses without asking
- Prefer editing existing files over creating new ones

## Agent Workflows

### Scout Review Loop

Use this when Arach wants an outside pass on a change, bug, design, or decision. The reusable unit is: explain the thing with enough context, send it through Scout to an ACP-enabled reviewer, collect the review, classify it, and decide the next step.

Frame the review with:

- `topic`: the specific area under review
- `workspace`: project path or source of truth
- `user_goal`: what should be true
- `observed_problem`: symptoms, screenshots, logs, regressions, or uncertainty
- `current_state`: what has already changed or been learned
- `constraints`: files not to touch, no-edit mode, style/build rules, known dirty worktree
- `review_questions`: concrete questions the reviewer must answer

Use a compact Scout brief:

```text
Review this from first principles, then inspect the relevant implementation.

Topic: <topic>
Workspace: <absolute path or source of truth>

User goal:
- <what should be true>

Observed problem:
- <symptom, confusion, regression, or decision risk>

Current state:
- <what has already been tried or changed>

Constraints:
- <edit/no-edit, areas to avoid, build rules, dirty worktree notes>

Please answer:
1. What is the correct first-principles model?
2. Does the current implementation satisfy it?
3. What are the must-fix gaps, if any?
4. What checks would prove the result?

Return findings by severity with file/line or command evidence where possible.
Do not edit files unless explicitly asked.
```

Route by project and capability when the reviewer should inspect a workspace:

```bash
scout ask --project /absolute/project/path --harness claude "<brief>"
```

Use `--harness codex` for a Codex reviewer, or `--to <target>` only when Arach named a concrete target. Preserve returned `session`, `flightId`, `conversationId`, `workId`, and `ref` values.

Treat the review as evidence, not instruction. Classify findings as:

- `must_fix`: current correctness, launch, data-loss, security, or reproducible UX bug
- `should_fix`: worthwhile but not required for the current request
- `follow_up`: needs another pass, test, or product decision
- `reject`: mistaken, stale, or outside scope

Then implement in-scope `must_fix` findings, run practical narrow checks, and report who reviewed, the Scout receipt/ref, what changed, verification, and remaining risk.

### claude.ai/design (design-sync) Workflow

Use `/design-sync` to push a repo's real component library to a claude.ai/design project so the design agent builds with **my actual components**, not generic ones. Works in any React + Tailwind project.

**Ownership model — the thing that ends the "will this overwrite my stuff?" anxiety.** `/design-sync` writes and deletes ONLY the design-system artifacts at the project root: `components/**`, `_preview/**`, `_vendor/**`, `tokens/**`, `fonts/**`, `guidelines/**`, `_ds_bundle.js`, `_ds_bundle.css`, `styles.css`, `README.md`, `_ds_sync.json`, `_ds_needs_recompile`. It **never touches anything else** — the designs the agent produces, and any hand-authored files outside those paths, survive every re-sync. → **Iterate freely on claude.ai/design; re-syncing the component library will not clobber my designs.**

**Golden rule — customize at SOURCE, never hand-edit the synced project.** Any edit to a generated/synced file on the remote (`_adherence.oxlintrc.json`, `_ds_bundle.css`, a component `.html`) is regenerated and reverted on the next sync or the app's self-check. Durable customization lives in the repo, committed, under `.design-sync/`:

| Input file | Owns |
| :--- | :--- |
| `config.json` | component map, prop contracts (`dtsPropsFor`), overrides, glob scopes, the `projectId` pin |
| `conventions.md` | the README header / usage guide the design agent reads |
| `previews/<Name>.tsx` | hand-authored preview cards (the converter never touches these) |
| `*.head.css` (e.g. `arc-ds.head.css`) | brand tokens + fonts injected at `:root` |
| `NOTES.md` | repo gotchas + a "Re-sync risks" watch-list for the next run |

If something looks wrong in the project, fix the source input and re-sync — **never** the remote file.

**The loop:**
1. **First sync:** run `/design-sync .` in the repo → creates + pins a new project and uploads the library; one approval covers the run.
2. **Iterate:** open the project on claude.ai/design and prompt the agent to build with my components. Designs are safe from re-syncs.
3. **Re-sync on component/token change:** `/design-sync` rebuilds, diffs against the project's anchor, and uploads only what moved (one `finalize_plan` approval shows the exact writes/deletes). Commit the `.design-sync/` inputs.
4. **Sync from a committed/settled tree** — a mid-refactor tree syncs WIP. Run one sync session per project at a time (no concurrent syncs to the same project).

**Safety guarantees (so I can stop worrying):**
- Re-sync updates the library only; my designs + hand-authored extras are untouched.
- `.design-sync/` inputs are committed → reproducible on any machine; verified state carries via the uploaded `_ds_sync.json`.
- A crash mid-sync leaves the project **un-anchored** (the documented safe state) — the next sync re-verifies and re-uploads; nothing silently rots.

**Known upstream noise — do NOT chase per-project.** `check_design_system` flags Tailwind `--tw-*` engine internals as "unclassified tokens" / wants `@kind` comments. These are **advisory** (they do not block design iteration), regenerate on every sync, and are a design-sync **tooling** limitation — not fixable in the repo or the project. Ignore them, or raise with the design-sync maintainers.

## New Project Defaults

Every new project follows this core compounding skeleton:

1.  **Skeleton**: `bun init -y`, `git init`
2.  **Docs**: Initialize **Dewey** for AI-agent-ready docs (`npx dewey init`)
3.  **Diagrams**: Create initial architecture with **ARC**
4.  **Landing**: Standard landing page + `/docs` structure
5.  **Visuals**: Set up **OG** image generation (`npx @arach/og og-config.json`)

## Key Projects

### Productivity & Compound Engineering

| Project | Description | Skill |
| :--- | :--- | :--- |
| **operate** | Core productivity and compound-engineering project | — |
| **dewey** | Documentation toolkit for AI-agent-ready docs | `npx skills add arach/dewey` |
| **arc** | Visual architecture diagram editor | `npx skills add arach/arc` |
| **og** | Open Graph image generator | — |

### Apps — macOS/iOS

| Project | Description | Path |
| :--- | :--- | :--- |
| **Talkie** | Voice conversation app | `~/dev/talkie` |
| **Scout** | Audio transcription | `~/dev/scout` |
| **Pomo** | Pomodoro timer | `~/dev/pomo` |
| **Tempo** | Time tracking | `~/dev/tempo` |
| **Speakeasy** | Voice assistant (legacy focus) | `~/dev/speakeasy` |

### Web Properties

| Project | Description | Path |
| :--- | :--- | :--- |
| **arach.dev** | Personal site | `~/dev/arach.dev` |
| **arach.io** | Portfolio | `~/dev/arach.io` |
| **usetalkie.com** | Talkie landing page | `~/dev/usetalkie.com` |
| **agentlist.io** | AI agent directory | `~/dev/agentlist.io` |

### Libraries & Experiments

| Project | Description | Path |
| :--- | :--- | :--- |
| **agentloop** | Agent loop primitives | `~/dev/agentloop` |
| **hooked** | Voice & until loops for Claude Code | — |
| **fabric** | UI framework experiments | `~/dev/fabric` |

## Installing Skills

When working on a specific project, install its skill for deeper context:

```bash
# Install all arach skills (this meta-skill)
npx skills add arach/arach

# Install specific project skills
npx skills add arach/arc        # Architecture diagrams
npx skills add arach/dewey      # Documentation toolkit
```

## Project Detection

When I mention or you detect I'm working in:

| Context | Action |
| :--- | :--- |
| `~/dev/arc` or "architecture diagram" | Load arc-diagrams skill |
| `~/dev/dewey` or "documentation" | Load dewey-docs skill |
| `~/dev/talkie` or "voice app" | Swift/SwiftUI macOS app context |
| Any `~/dev/*` project | Check for local CLAUDE.md first |

## Tech Stack Preferences

| Category | Preference |
| :--- | :--- |
| Package manager | Bun |
| Language | TypeScript |
| Frontend | React + TypeScript + TailwindCSS |
| Desktop apps | Swift/SwiftUI (macOS), Tauri (cross-platform) |
| Build tools | Vite, Turbo |
| Testing | Vitest, Playwright |
| State | Zustand |

## Common Commands

```bash
# Development
bun dev           # Start dev server
bun run build     # Production build
bun test          # Run tests
bun run lint      # Lint code

# Docs & OG
npx dewey build   # Build dewey docs
npx @arach/og og-config.json # Generate OG image

# Swift/macOS
swift build       # Build Swift package
swift run         # Run in debug mode

# Git (always with gitmoji)
git commit -m "✨ Add new feature"
git commit -m "🐛 Fix bug in component"
git commit -m "🎨 Improve code structure"
git commit -m "📝 Update documentation"
git commit -m "🔧 Update configuration"
```

## Directory Structure

```
~/dev/
├── arach/          # This repo (GitHub profile + meta-skill)
├── operate/        # Core productivity toolkit
├── arc/            # Architecture diagrams [has skill]
├── dewey/          # Documentation toolkit [has skill]
├── talkie/         # Voice conversation app
├── arach.dev/      # Personal website
├── ...             # ~100 other projects
```

## When Starting Fresh

On a new machine, bootstrap everything:

```bash
# 1. Install this meta-skill
npx skills add arach/arach

# 2. Claude now knows all projects and can install specific skills as needed
```

## Links

- GitHub: [github.com/arach](https://github.com/arach)
- Site: [arach.dev](https://arach.dev)
- X: [@arach](https://x.com/arach)
- Site: [arach.io](https://arach.io)
