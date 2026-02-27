import { agents } from "../data.js";
import {
  heading,
  numberedItem,
  blank,
  separator,
  prompt,
  print,
} from "../render.js";
import { c } from "../colors.js";

export function showAgents(): void {
  const lines: string[] = [];

  lines.push(prompt("agents"));
  lines.push(blank());
  lines.push(heading("AGENTS & WRITING"));

  agents.forEach((a, i) => {
    lines.push(
      numberedItem(i + 1, `${c.bold}${c.white}${a.title}${c.reset}`)
    );
    lines.push(`   ${c.dim}${a.summary}${c.reset}`);
    lines.push(`   ${c.dim}${a.href}${c.reset}`);
    if (i < agents.length - 1) lines.push(blank());
  });

  lines.push(blank());
  lines.push(separator());

  print(lines);
}
