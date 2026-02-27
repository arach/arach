import { c } from "./colors.js";

export function heading(text: string): string {
  return `${c.bold}${c.white}${text}${c.reset}`;
}

export function line(text: string): string {
  return text;
}

export function dimLine(text: string): string {
  return `${c.dim}${text}${c.reset}`;
}

export function keyVal(key: string, val: string, keyWidth = 11): string {
  const padded = key.padEnd(keyWidth);
  return `  ${c.dim}${padded}${c.reset}${c.dim}${val}${c.reset}`;
}

export function numberedItem(n: number, text: string): string {
  return `${c.cyan}${c.bold}${n}/${c.reset} ${text}`;
}

export function separator(): string {
  return dimLine("---");
}

export function blank(): string {
  return "";
}

export function statsBox(
  stats: { key: string; val: string }[]
): string {
  const cellWidth = 14;
  const border = "─";
  const totalWidth = stats.length * cellWidth + stats.length + 1;
  const topBorder = `┌${stats.map(() => border.repeat(cellWidth)).join("┬")}┐`;
  const midBorder = `├${stats.map(() => border.repeat(cellWidth)).join("┼")}┤`;
  const botBorder = `└${stats.map(() => border.repeat(cellWidth)).join("┴")}┘`;

  const keyRow = `│${stats.map((s) => `${c.dim} ${s.key.padEnd(cellWidth - 1)}${c.reset}`).join("│")}│`;
  const valRow = `│${stats.map((s) => `${c.bold}${c.white} ${s.val.padEnd(cellWidth - 1)}${c.reset}`).join("│")}│`;

  return [
    `${c.dim}${topBorder}${c.reset}`,
    keyRow,
    `${c.dim}${midBorder}${c.reset}`,
    valRow,
    `${c.dim}${botBorder}${c.reset}`,
  ].join("\n");
}

export function prompt(cmd: string, flags = ""): string {
  const flagStr = flags ? ` ${c.dim}${flags}${c.reset}` : "";
  return `${c.dim}$${c.reset} arach${cmd ? ` ${cmd}` : ""}${flagStr}`;
}

export function print(lines: string[]): void {
  console.log(lines.join("\n"));
}
