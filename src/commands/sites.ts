import { sites } from "../data.js";
import {
  heading,
  numberedItem,
  blank,
  prompt,
  print,
} from "../render.js";
import { c } from "../colors.js";

export function showSites(): void {
  const lines: string[] = [];

  lines.push(prompt("sites"));
  lines.push(blank());
  lines.push(heading("SITES"));

  sites.forEach((s, i) => {
    const name = `${c.underline}${s.name.padEnd(20)}${c.reset}`;
    lines.push(numberedItem(i + 1, `${name}${c.dim}${s.desc}${c.reset}`));
  });

  print(lines);
}
