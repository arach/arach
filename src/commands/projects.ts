import { projects } from "../data.js";
import {
  heading,
  dimLine,
  numberedItem,
  blank,
  separator,
  prompt,
  print,
} from "../render.js";
import { c } from "../colors.js";

export function showProjects(): void {
  const lines: string[] = [];

  lines.push(prompt("projects", "--featured"));
  lines.push(blank());
  lines.push(heading("PROJECTS"));

  projects.forEach((p, i) => {
    const name = p.href
      ? `${c.bold}${c.white}${p.name}${c.reset}`
      : `${c.bold}${c.white}${p.name}${c.reset}`;
    lines.push(numberedItem(i + 1, name));
    lines.push(`   ${p.desc}`);
    lines.push(`   ${c.dim}${p.stack}${c.reset}`);
    if (p.href) {
      lines.push(`   ${c.dim}${p.href}${c.reset}`);
    }
    if (i < projects.length - 1) lines.push(blank());
  });

  lines.push(blank());
  lines.push(dimLine("  15+ projects at https://arach.dev"));
  lines.push(blank());
  lines.push(separator());

  print(lines);
}
