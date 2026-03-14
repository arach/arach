---
name: arach
description: Personal meta-skill for Arach. Use this as the entry point to understand arach's projects, conventions, and available skills. Activates on "arach's projects", "what does arach work on", or when working in any arach/* repo.
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
