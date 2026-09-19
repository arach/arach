# Black-gold

Terminal and Herdr chrome. Black field, gold metal, ivory text.

- **Use for:** Ghostty, Herdr TUI, and any agent-shell surface that should match the live machine.
- **Do not use for:** product UI (Talkie, Lattices, Arc). Those keep their own systems.
- **Vibe:** lacquer black, warm metal, no purple, no bloom fog.

## Palette

| Role | Hex | Use |
|------|-----|-----|
| Field | `#0a0a0a` | window / panel background |
| Dim | `#050505` | recessed chrome |
| Surface | `#1a1a1a` | raised rows |
| Brass edge | `#2a2418` | splitters, nested surface |
| Gold | `#e6c384` | cursor, accent, Ghostty icon ghost |
| Coin | `#d4af37` | secondary gold (Herdr labels) |
| Ivory | `#e8e0cc` | primary text |
| Warm mute | `#a89c80` | subtext |
| Select | `#3d3420` | selection fill |
| Select ink | `#f2ead2` | selection text |
| Red | `#c45c4a` | error / ANSI 1 |
| Green | `#8a9a62` | ok / ANSI 2 |

Text is ivory, not gold. Gold is the cursor and thin accents only.
ANSI yellow is dark bronze (`#5c4e28`) so TUIs cannot fill a pane with metal.

## Type

- Body: JetBrains Mono Light, 12, no macOS thicken
- Bold: JetBrains Mono Regular
- Icons: GeistMono Nerd Font Mono as Ghostty fallback
- Features: `calt`, `liga`, `zero`
- Cell: width −4%, height −2%

## Variants

| Name | Ghostty id | Floor | Gold | Opacity |
|------|------------|-------|------|---------|
| void | `black-gold-void` | `#050505` | `#c4a35a` (cursor only) | 0.96 |
| lacquer | `black-gold-lacquer` | `#0a0a0a` | `#e6c384` (landed look) | 0.88 |
| brass | `black-gold-brass` | `#16130e` | `#e6c384` (warmer chrome) | 0.92 |

Lacquer is the default. Text stays ivory; gold is accent.

## Surfaces

| Surface | Mapping |
|---------|---------|
| Ghostty | `theme = black-gold-<variant>`, per-variant opacity, hidden titlebar, gold bar cursor, cursor smear only (no bloom) |
| Herdr | `theme.custom` from the active variant; UI accent matches gold |
| Ghostty icon | ghost = gold, screen = field + select |

## Command

```bash
npx @arach/arach ghostty                 # preview all three
npx @arach/arach ghostty preview lacquer
npx @arach/arach ghostty apply lacquer
npx @arach/arach ghostty flavors         # named Ghostty apps
npx @arach/arach ghostty install         # Talkie Ghost + Lattices Ghost
npx @arach/arach ghostty open talkie
```

Apply writes `~/.config/ghostty/themes/black-gold-*`. Flavors are still Ghostty: a named wrapper, a tinted macOS icon, a theme, and a Herdr session. They land in `~/Applications/dev/`.
