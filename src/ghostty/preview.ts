import { chip, paint } from "./ansi.js";
import { type GhosttyTheme, ghosttyThemes } from "./themes.js";

const COL = 22;

function padVisible(text: string, width: number): string {
  const visible = text.replace(/\x1b\[[0-9;]*m/g, "");
  const extra = Math.max(0, width - visible.length);
  return text + " ".repeat(extra);
}

function sample(theme: GhosttyTheme): string[] {
  const w = COL;
  const fill = (s: string) => s.padEnd(w);
  const line = (fg: string, text: string) =>
    paint(fg, theme.background, fill(text));

  return [
    line(theme.foreground, ` ${theme.name}`),
    line(theme.herdr.subtext0 ?? theme.palette[8], ` ${theme.summary}`),
    line(theme.foreground, " ".repeat(w)),
    line(theme.herdr.overlay1 ?? theme.palette[8], " $ git status"),
    line(theme.cursor, " ## main"),
    line(theme.palette[1], " M  src/cli.ts"),
    line(theme.palette[2], " A  src/ghostty/"),
    line(theme.foreground, " ".repeat(w)),
    paint(theme.cursorText, theme.cursor, " ") +
      paint(theme.foreground, theme.background, " ".repeat(w - 1)),
  ];
}

function paletteRow(theme: GhosttyTheme): string {
  return theme.palette.map((hex) => chip(hex, 1)).join("");
}

function column(theme: GhosttyTheme): string[] {
  const bar = chip(theme.background, COL);
  const gold = chip(theme.cursor, COL);
  const lines = [
    bar,
    gold,
    ...sample(theme),
    paint(theme.foreground, theme.background, " ".repeat(COL)),
    paletteRow(theme) + chip(theme.background, Math.max(0, COL - 16)),
    bar,
  ];
  return lines.map((line) => padVisible(line, COL));
}

export function renderPreview(themes: GhosttyTheme[] = ghosttyThemes): string {
  const cols = themes.map(column);
  const height = Math.max(...cols.map((c) => c.length));
  const rows: string[] = [];
  rows.push("");
  rows.push("  black-gold");
  rows.push("");
  const names = themes
    .map((t) => t.name.padEnd(COL))
    .join("  ");
  rows.push(`  ${names}`);
  for (let i = 0; i < height; i++) {
    rows.push(`  ${cols.map((c) => c[i] ?? " ".repeat(COL)).join("  ")}`);
  }
  rows.push("");
  return rows.join("\n");
}
