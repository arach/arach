export type GhosttyTheme = {
  id: string;
  name: string;
  summary: string;
  background: string;
  foreground: string;
  cursor: string;
  cursorText: string;
  selectionBg: string;
  selectionFg: string;
  palette: string[];
  splitFill: string;
  splitDivider: string;
  iconGhost: string;
  iconScreen: string;
  herdr: Record<string, string>;
  uiAccent: string;
  opacity: number;
};

/** Deepest field, gold only on the cursor. */
const voidTheme: GhosttyTheme = {
  id: "black-gold-void",
  name: "void",
  summary: "Deep black, sparse gold",
  background: "#050505",
  foreground: "#cfc6b0",
  cursor: "#c4a35a",
  cursorText: "#050505",
  selectionBg: "#241e14",
  selectionFg: "#e8e0cc",
  palette: [
    "#141414",
    "#b05448",
    "#7a8a58",
    "#b8962e",
    "#7a6e50",
    "#a88c4a",
    "#8a7c50",
    "#cfc6b0",
    "#4a4a4a",
    "#c45c4a",
    "#8a9a62",
    "#c4a35a",
    "#a89468",
    "#c4a35a",
    "#b0a070",
    "#e8e0cc",
  ],
  splitFill: "#050505",
  splitDivider: "#1a1610",
  iconGhost: "#c4a35a",
  iconScreen: "#050505,#241e14",
  herdr: {
    panel_bg: "#050505",
    surface0: "#141414",
    surface1: "#1a1610",
    surface_dim: "#000000",
    overlay0: "#4a4a4a",
    overlay1: "#8a8070",
    text: "#cfc6b0",
    subtext0: "#8a8070",
    accent: "#c4a35a",
    mauve: "#a88c4a",
    blue: "#a89468",
    teal: "#8a7c50",
    green: "#7a8a58",
    peach: "#b8962e",
    red: "#b05448",
    yellow: "#c4a35a",
  },
  uiAccent: "#c4a35a",
  opacity: 0.96,
};

/** The landed look: lacquer black, ivory text, gold metal. */
const lacquerTheme: GhosttyTheme = {
  id: "black-gold-lacquer",
  name: "lacquer",
  summary: "Ivory on lacquer",
  background: "#0a0a0a",
  foreground: "#e8e0cc",
  cursor: "#e6c384",
  cursorText: "#0a0a0a",
  selectionBg: "#3d3420",
  selectionFg: "#f2ead2",
  palette: [
    "#1a1a1a",
    "#c45c4a",
    "#8a9a62",
    "#5c4e28",
    "#6e7f8a",
    "#a88890",
    "#6e8a82",
    "#d8d0b8",
    "#5a5a5a",
    "#e07060",
    "#a8b87a",
    "#c4a35a",
    "#8aa0b0",
    "#c090a0",
    "#8ab0a8",
    "#e8e0cc",
  ],
  splitFill: "#0a0a0a",
  splitDivider: "#2a2418",
  iconGhost: "#e6c384",
  iconScreen: "#0a0a0a,#3d3420",
  herdr: {
    panel_bg: "#0a0a0a",
    surface0: "#1a1a1a",
    surface1: "#2a2418",
    surface_dim: "#050505",
    overlay0: "#5a5a5a",
    overlay1: "#8a8070",
    text: "#e8e0cc",
    subtext0: "#a89c80",
    accent: "#e6c384",
    mauve: "#a88890",
    blue: "#8aa0b0",
    teal: "#6e8a82",
    green: "#8a9a62",
    peach: "#c4a35a",
    red: "#c45c4a",
    yellow: "#c4a35a",
  },
  uiAccent: "#e6c384",
  opacity: 0.88,
};

/** Warmer floor, more brass in the chrome. */
const brassTheme: GhosttyTheme = {
  id: "black-gold-brass",
  name: "brass",
  summary: "Warm brass chrome",
  background: "#16130e",
  foreground: "#f2ead2",
  cursor: "#e6c384",
  cursorText: "#16130e",
  selectionBg: "#4a3c1c",
  selectionFg: "#f2ead2",
  palette: [
    "#221e16",
    "#c45c4a",
    "#8a9a62",
    "#e6c384",
    "#c4b07a",
    "#d4af37",
    "#c4a35a",
    "#f2ead2",
    "#6a5e48",
    "#e07060",
    "#a8b87a",
    "#f0d78a",
    "#d4c08a",
    "#e6c384",
    "#d8c49a",
    "#fff6e0",
  ],
  splitFill: "#16130e",
  splitDivider: "#3d3420",
  iconGhost: "#e6c384",
  iconScreen: "#16130e,#4a3c1c",
  herdr: {
    panel_bg: "#16130e",
    surface0: "#221e16",
    surface1: "#3d3420",
    surface_dim: "#0c0a08",
    overlay0: "#6a5e48",
    overlay1: "#a89c80",
    text: "#f2ead2",
    subtext0: "#a89c80",
    accent: "#e6c384",
    mauve: "#d4af37",
    blue: "#c4b07a",
    teal: "#c4a35a",
    green: "#8a9a62",
    peach: "#e6c384",
    red: "#c45c4a",
    yellow: "#f0d78a",
  },
  uiAccent: "#e6c384",
  opacity: 0.92,
};

export const ghosttyThemes: GhosttyTheme[] = [
  voidTheme,
  lacquerTheme,
  brassTheme,
];

export const defaultGhosttyTheme = lacquerTheme;

export function findGhosttyTheme(query: string): GhosttyTheme | undefined {
  const q = query.trim().toLowerCase();
  return ghosttyThemes.find(
    (theme) =>
      theme.name === q ||
      theme.id === q ||
      theme.id === `black-gold-${q}`
  );
}

export function ghosttyThemeFile(theme: GhosttyTheme): string {
  const lines = [
    `# ${theme.name} — ${theme.summary}`,
    ...theme.palette.map((hex, i) => `palette = ${i}=${hex}`),
    "",
    `background = ${theme.background}`,
    `foreground = ${theme.foreground}`,
    `cursor-color = ${theme.cursor}`,
    `cursor-text = ${theme.cursorText}`,
    `selection-background = ${theme.selectionBg}`,
    `selection-foreground = ${theme.selectionFg}`,
    "",
  ];
  return lines.join("\n");
}

export function herdrCustomBlock(theme: GhosttyTheme): string {
  const entries = Object.entries(theme.herdr)
    .map(([key, value]) => `${key} = "${value}"`)
    .join("\n");
  return `[theme.custom]\n${entries}\n`;
}
