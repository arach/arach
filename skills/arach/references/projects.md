# Arach project map

Use this file for routing. Verify each path on the active machine before using
it as a command argument.

## Framework

| Project | Role | Common checkout hint |
| --- | --- | --- |
| `hudson` | Personal framework for multi-app canvases, providers, slots, hooks, and Vox | `~/dev/hudson` |

## Hudson-powered applications

| Project | Role | Common checkout hint |
| --- | --- | --- |
| `openscout` | Agent runtime with macOS, iOS, web, CLI, broker, and mesh surfaces | `~/dev/openscout` |
| `lattices` | Agentic macOS workspace manager | `~/dev/lattices` |
| `linea` | Web and native product moving onto Hudson | `~/dev/linea` |

## Standalone applications

| Project | Role | Common checkout hint |
| --- | --- | --- |
| `talkie` | Voice conversation application for macOS, iOS, and web | `~/dev/talkie` |

## Compounding tools

| Project | Role | Common checkout hint |
| --- | --- | --- |
| `operate` | Machine-aware control plane for remote agent execution | `~/dev/operate` |
| `dewey` | Documentation toolkit for agent-ready repositories and doc sites | `~/dev/dewey` |
| `arc` | Visual architecture and diagram editor | `~/dev/arc` |
| `og` | Open Graph image generator | `~/dev/og` |

## Web properties

| Project | Role | Common checkout hint |
| --- | --- | --- |
| `arach.dev` | Portfolio and project specifications | `~/dev/arach.dev` |
| `arach.io` | Writing, resume, and personal site | `~/dev/arach.io` |
| `usetalkie.com` | Talkie marketing site | `~/dev/usetalkie-theme` |
| `agentlist.io` | AI agent directory | `~/dev/agentlist.io` |

## Project-specific skills

Install deeper project context only when the current task needs it:

```bash
npx skills add arach/arc --global
npx skills add arach/dewey --global
```
