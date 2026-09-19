const reset = "\x1b[0m";

export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

export function fg(hex: string, text: string): string {
  const [r, g, b] = parseHex(hex);
  return `\x1b[38;2;${r};${g};${b}m${text}${reset}`;
}

export function bg(hex: string, text: string): string {
  const [r, g, b] = parseHex(hex);
  return `\x1b[48;2;${r};${g};${b}m${text}${reset}`;
}

export function paint(fgHex: string, bgHex: string, text: string): string {
  const [fr, fgG, fb] = parseHex(fgHex);
  const [br, bgG, bb] = parseHex(bgHex);
  return `\x1b[38;2;${fr};${fgG};${fb}m\x1b[48;2;${br};${bgG};${bb}m${text}${reset}`;
}

export function chip(hex: string, width = 2): string {
  return bg(hex, " ".repeat(width));
}
