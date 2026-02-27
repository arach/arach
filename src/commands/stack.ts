import { tech } from "../data.js";
import {
  heading,
  keyVal,
  blank,
  separator,
  prompt,
  print,
} from "../render.js";

export function showStack(): void {
  const lines: string[] = [];

  lines.push(prompt("stack"));
  lines.push(blank());
  lines.push(heading("STACK"));

  for (const t of tech) {
    lines.push(keyVal(t.k, t.v));
  }

  lines.push(blank());
  lines.push(separator());

  print(lines);
}
