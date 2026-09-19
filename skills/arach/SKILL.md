---
name: arach
description: Personal meta-skill for Arach. Use as the entry point for Arach's projects, conventions, bundled skills, and preferred agent workflows. Load it when working in an arach/* repository, when asked about Arach's projects or working style, or when routing work to the Scout review, design-sync, or design-iteration workflows.
---

# Arach

Use this skill as a compact router. Load the narrow skill or reference that
matches the task instead of carrying every workflow into context.

## Start here

1. Read the active repository's instruction files before applying personal
   defaults.
2. Verify the current checkout, branch, and source of truth before making a
   status claim.
3. Treat the paths in this skill as hints. Do not assume that every machine or
   operating-system account uses the same checkout path.
4. Preserve existing user work. Do not hide work in a stash when an explicit
   commit or branch can preserve it.

## Core conventions

- Use Bun when a project has `bun.lock` or `bun.lockb`. Follow the repository's
  existing package manager when it uses another lockfile.
- Prefer TypeScript for new JavaScript ecosystem code.
- Do not add co-authoring attribution or generated-by footers.
- Prefer editing an existing file over adding a parallel implementation.
- Solve the root cause before proposing a workaround.
- Separate verified current behavior from inference and planned behavior.
- Use exact project nouns, paths, states, and commands.

## Secrets

Credentials live in the per-machine macOS login keychain through the `secret`
CLI (`~/.local/bin/secret`).

- Launch long-lived processes such as agents, MCP servers, and tmux sessions
  with `secret run KEY -- cmd`, so the value exists only inside that process
  environment.
- Never pass values as command arguments or write them into dotenv files,
  transcripts, or temp files.
- `secret list` reads a synced index of names, so a name can appear on a
  machine whose keychain does not hold the value. Verify with
  `secret get KEY >/dev/null` before depending on it.
- A locked keychain reached over SSH fails with "User interaction is not
  allowed". Unlock once at that machine's console instead of moving values
  over the network as a workaround. When another machine needs a credential,
  provision its keychain deliberately, one key at a time, from that machine.

## Bundled skill routing

This GitHub repository contains four installable skills:

| Skill | Use it for |
| --- | --- |
| `arach` | Personal project context, conventions, and workflow routing |
| `writing` | Arach's technical, editorial, and mixed writing modes |
| `humanizer` | An explicit anti-AI-pattern audit or generic prose cleanup |
| `dewey-docs` | Dewey documentation setup and agent-ready documentation work |

Use `writing` for text written in Arach's voice. Use `humanizer` as an optional
final audit when the user explicitly wants de-slopping or AI-pattern removal.
The writing mode and factual contract remain authoritative.

The bundled `dewey-docs` skill is a convenience copy. Verify product behavior
against the active `arach/dewey` checkout or published Dewey documentation when
current implementation detail matters.

## Workshop tooling

`vmops` operates our exe.dev workshop VMs — create/delete VMs, service
status, logs, and one-command studio deploys. It is intentionally not an
installable skill: the script lives in the studio checkout at
`~/dev/studio/bin/vmops.mjs` (run it with Bun). Load it when the task is
putting things up on exe.dev, checking VM services, or syncing studios.
Full contract: `docs/cloud-studios.md` and `AGENTS.md` in the studio repo.

## Preferred workflows

Load only the reference required by the request:

- [Scout review loop](references/scout-review-loop.md): outside review through
  Scout, followed by evidence classification and an in-scope response.
- [Design sync](references/design-sync.md): synchronize a repository-owned
  component system to `claude.ai/design` without overwriting designs.
- [Design iteration loop](references/design-iteration-loop.md): compare rendered
  visual directions against a written rubric and bounded budget.
- [Terminal](references/terminal.md): Ghostty + Herdr black-gold surface.

Do not assume that another account has Scout, design-sync, sub-agent, or browser
capabilities. Check availability before invoking a workflow. If a required
capability is missing, name it and provide the exact installation or handoff
needed.

## Project routing

Read [projects](references/projects.md) when the task depends on project
ownership, repository location, or Arach's product map.

For any repository:

1. Use the active working directory and repository instructions as evidence.
2. If the repository is not open, locate it by project name before assuming a
   path.
3. Report the verified host and checkout when the same project can exist on
   more than one machine.

## New project defaults

Use these only when the new project does not define its own stack:

1. Initialize a Bun and TypeScript project.
2. Initialize Git.
3. Add Dewey documentation when the project needs an agent-readable contract.
4. Create an architecture diagram with ARC when system ownership is not
   obvious from the code.
5. Add a landing page and `/docs` surface when the project is public.
6. Configure an Open Graph image with `@arach/og` when the project has a public
   URL.

## Installation across accounts

GitHub is the source of truth for this skill collection.

Install all bundled skills globally for every agent supported by the Skills
CLI on the current operating-system account:

```bash
npx skills add arach/arach --all --global
```

Install only the personal router and writing system:

```bash
npx skills add arach/arach --skill arach writing --agent '*' --global --yes
```

List the skills without installing them:

```bash
npx skills add arach/arach --list
```

Run the install command once on each machine or operating-system account. Agent
sign-in accounts do not automatically synchronize local skill files.

Update globally installed skills from their recorded GitHub sources:

```bash
npx skills update --global --yes
```

## Links

- GitHub: <https://github.com/arach>
- Site: <https://arach.dev>
- Writing: <https://arach.io>
