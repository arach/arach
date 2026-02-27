import { accounts } from "../data.js";
import {
  heading,
  numberedItem,
  blank,
  separator,
  prompt,
  print,
} from "../render.js";
import { c } from "../colors.js";

export function showAccounts(): void {
  const lines: string[] = [];

  lines.push(prompt("accounts"));
  lines.push(blank());
  lines.push(heading("ACCOUNTS"));

  accounts.forEach((a, i) => {
    const name = a.name.padEnd(14);
    lines.push(
      numberedItem(i + 1, `${c.dim}${name}${c.reset}${c.cyan}${a.handle}${c.reset}`)
    );
  });

  lines.push(blank());
  lines.push(separator());

  print(lines);
}
