import { fetchInbox } from "../remote.js";
import { heading, blank, separator, prompt, print, dimLine } from "../render.js";
import { c } from "../colors.js";

export async function showInbox(): Promise<void> {
  const messages = await fetchInbox();

  const lines: string[] = [];

  lines.push(prompt("inbox"));
  lines.push(blank());

  if (messages === null) {
    lines.push(
      `  ${c.yellow}No token configured.${c.reset}`
    );
    lines.push(
      `  ${c.dim}Add {"token": "..."} to ~/.arach.json${c.reset}`
    );
    lines.push(blank());
    print(lines);
    return;
  }

  lines.push(heading("INBOX"));
  lines.push(blank());

  if (messages.length === 0) {
    lines.push(dimLine("  No messages."));
  } else {
    for (const msg of messages) {
      const status = msg.read_at ? `${c.dim}read${c.reset}` : `${c.green}new${c.reset}`;
      lines.push(
        `  ${c.cyan}${msg.id.slice(0, 8)}${c.reset}  ${status}  ${c.dim}${msg.created_at}${c.reset}`
      );
      lines.push(`  ${msg.body}`);
      lines.push(blank());
    }
  }

  lines.push(separator());
  print(lines);
}
