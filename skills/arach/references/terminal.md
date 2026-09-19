# Terminal

Ghostty + Herdr use **black-gold** with three variants: **void**, **lacquer**, **brass**. Design language: `docs/design/black-gold.md` in the arach/arach repo.

```bash
npx @arach/arach ghostty                 # preview all three
npx @arach/arach ghostty preview lacquer
npx @arach/arach ghostty apply lacquer   # default landed look
```

`apply` writes the three Ghostty theme files, sets `theme = black-gold-<variant>`, and overlays Herdr `theme.custom`. Reload Ghostty with `cmd+shift+,`. Opacity and blur need a full quit. Named Herdr sessions: `HERDR_SESSION=… herdr server reload-config`.

Do not switch the palette to Catppuccin, Kanagawa, or crust-black unless asked. Do not enable bloom shaders. Keep JetBrains Light; do not turn `font-thicken` on.

## Tokens

| Role | Hex |
|------|-----|
| Field | `#0a0a0a` |
| Gold | `#e6c384` |
| Ivory | `#e8e0cc` |
| Select | `#3d3420` |

## Ghostty theme

Path: `~/.config/ghostty/themes/black-gold`

```
palette = 0=#1a1a1a
palette = 1=#c45c4a
palette = 2=#8a9a62
palette = 3=#5c4e28
palette = 4=#6e7f8a
palette = 5=#a88890
palette = 6=#6e8a82
palette = 7=#d8d0b8
palette = 8=#5a5a5a
palette = 9=#e07060
palette = 10=#a8b87a
palette = 11=#c4a35a
palette = 12=#8aa0b0
palette = 13=#c090a0
palette = 14=#8ab0a8
palette = 15=#e8e0cc

background = #0a0a0a
foreground = #e8e0cc
cursor-color = #e6c384
cursor-text = #0a0a0a
selection-background = #3d3420
selection-foreground = #f2ead2
```

Required Ghostty keys (rest of the file can keep local keybinds):

```
theme = black-gold
font-family = JetBrains Mono
font-family = GeistMono Nerd Font Mono
font-style = Light
font-style-bold = Regular
font-thicken = false
background-opacity = 0.88
cursor-color = #e6c384
unfocused-split-fill = #0a0a0a
split-divider-color = #2a2418
```

## Herdr

Path: `~/.config/herdr/config.toml`

```
[theme.custom]
panel_bg = "#0a0a0a"
surface0 = "#1a1a1a"
surface1 = "#2a2418"
surface_dim = "#050505"
overlay0 = "#5a5a5a"
overlay1 = "#8a8070"
text = "#e8e0cc"
subtext0 = "#a89c80"
accent = "#e6c384"
mauve = "#c4a35a"
blue = "#c4b07a"
teal = "#9a8b5c"
green = "#8a9a62"
peach = "#d4af37"
red = "#c45c4a"
yellow = "#e6c384"

[ui]
accent = "#e6c384"
```

Grok / Claude sidebar labels use gold (`#e6c384` / `#d4af37`), not pink or mauve.
