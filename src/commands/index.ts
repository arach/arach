import { bio, career, remotePortrait, motd } from "../data.js";
import {
  heading,
  dimLine,
  statsBox,
  blank,
  separator,
  prompt,
  print,
} from "../render.js";
import { c } from "../colors.js";
import { showProjects } from "./projects.js";
import { showStack } from "./stack.js";
import { showAccounts } from "./accounts.js";
import { showSites } from "./sites.js";
import { showAgents } from "./agents.js";

export function showCard(): void {
  const lines: string[] = [];

  // MOTD banner
  if (motd) {
    lines.push(`${c.yellow}${c.bold}  ${motd}${c.reset}`);
    lines.push(blank());
  }

  // Header
  lines.push(prompt("", "--info"));
  lines.push(blank());
  lines.push(heading(bio.name.toUpperCase()));
  for (const line of bio.summary) {
    lines.push(dimLine(line));
  }
  lines.push(blank());
  if (bio.stats.length) {
    lines.push(statsBox(bio.stats));
    lines.push(blank());
  }
  for (const c2 of career) {
    lines.push(dimLine(`  · ${c2}`));
  }
  lines.push(blank());
  lines.push(separator());

  // Portrait
  if (remotePortrait) {
    lines.push(blank());
    lines.push(prompt("", "--info --agents-view"));
    lines.push(blank());
    lines.push(heading("AGENT: AUTHOR PORTRAIT"));
    lines.push(`${c.dim}${remotePortrait}${c.reset}`);
    lines.push(blank());
    lines.push(separator());
  }

  print(lines);

  // Delegate to sub-sections
  console.log();
  showProjects();
  console.log();
  showStack();
  console.log();
  showAccounts();
  console.log();
  showSites();
  console.log();
  showAgents();
}
