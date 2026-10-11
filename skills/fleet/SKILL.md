---
name: fleet
description: Install, update and verify Arach's published tools (Lattices, Scout, Talkie, Dewey, Vox, the arach skills) on every machine in his fleet. Use when a CLI such as `lats` or `scout` is missing on a host, when a host lacks an agent skill, when setting up a new machine, or when asked to bring the fleet up to date.
---

# Fleet

Arach publishes several tools that every machine should carry: a CLI and the
agent skill that teaches agents to use it. This skill is the list of those tools
and the procedure for putting them on a host.

## Machines

| Host | Reach it with | OS | Notes |
| --- | --- | --- | --- |
| mini | local | macOS | Main desk, keyboard |
| arts-mini | `ssh arts-mini` (user `art`) | macOS | Second keyboard |
| air | `ssh air` | macOS | MacBook Air |
| Archie | `ssh arach@192.168.18.28` | Linux (Omarchy, Hyprland) | No keyboard; reached by Lattices visits |

Rules:

- Ask before installing on, or changing, a machine other than the one you're on.
- Over SSH, put `~/.local/bin`, `~/.bun/bin`, and `/opt/homebrew/bin` on `PATH` first, because non-login shells miss them.
- Use Bun: `bun add -g` for CLIs and `bunx` to run them. Use npm only when a tool's own docs require it.
- Never move secrets between machines. Each host's keychain is provisioned at that host; see the `arach` skill.

## Tools

| Tool | CLI package | Commands | Skills source | Hosts |
| --- | --- | --- | --- | --- |
| Lattices | `@arach/lattices` | `lats`, `lattices` | `arach/lattices` (`lattices`, `action`, `voice`, `blink`) | Macs |
| Scout | `@openscout/scout` | `scout` | `arach/openscout` (`scout`) | all |
| Talkie | `@talkie/cli` | `talkie` | `arach/talkie` (`talkie`) | Macs |
| Dewey | `@arach/dewey` | `dewey` | `arach/arach` (`dewey-docs`) | where docs are built |
| Vox | `@voxd/cli` | `vox` | none | Macs that speak |
| Arach | none | none | `arach/arach` (`arach`, `writing`, `humanizer`, `fleet`) | all |

fab isn't published yet: its CLI (`fab/cli`) is private and has no skill. Run it
from a checkout until a package exists.

Treat this table as a starting point, not as fact. Before relying on a row,
check the tool's repository and `npm view <package> version bin`.

## Procedure

For each host, with permission:

1. **Inventory.** For each command, `command -v <cmd>` and the real path it points to. Look for stale installs: an old package name (`@lattices/cli` replaced `@arach/lattices` at one point and lingers in bun's global list), a second copy under npm's global prefix (`~/.local/lib/node_modules`), or a skill symlinked into `/tmp`.
2. **Compare.** Compare the published version (`npm view <package> version bin`) with what's installed. If the registry lags the source, say so and stop that tool rather than installing an older build. Lattices releases its macOS app as a DMG more often than it publishes to npm, so a command can exist on `main` but not on npm.
3. **Clean.** Remove stale installs only after naming them to the user: `bun remove -g <old>`, `npm rm -g <old>`, and broken skill symlinks.
4. **Install.** Install the CLIs with `bun add -g <package>`. Install the skills with `bunx skills add <owner/repo> --skill <names> --agent '*' --global --yes`. The skills land in `~/.agents/skills` and are linked into each agent's directory, including `~/.claude/skills`.
5. **Verify.** Each command runs (`<cmd> --version` or `help`). Each skill is listed in `~/.claude/skills` with a readable `SKILL.md`. Report a table of host × tool, with ✓ or the reason it isn't installed.

Update everything later with `bun update -g` and `bunx skills update --global --yes`.

## Adding a tool

When a new tool ships for the fleet, add a row to the table above in the same
commit that publishes its package or skill.
