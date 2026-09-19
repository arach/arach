import { c } from "../colors.js";
import { blank, heading, prompt, print } from "../render.js";
import { applyGhosttyTheme } from "../ghostty/apply.js";
import { renderPreview } from "../ghostty/preview.js";
import {
  defaultGhosttyTheme,
  findGhosttyTheme,
  ghosttyThemes,
} from "../ghostty/themes.js";

function usage(): string[] {
  return [
    prompt("ghostty"),
    blank(),
    heading("GHOSTTY"),
    blank(),
    `  ${c.cyan}arach ghostty${c.reset}                    Preview all three variants`,
    `  ${c.cyan}arach ghostty preview${c.reset} [name]    Preview void, lacquer, or brass`,
    `  ${c.cyan}arach ghostty apply${c.reset} <name>      Write theme + point Ghostty/Herdr at it`,
    blank(),
    `  ${c.dim}variants:${c.reset} ${ghosttyThemes.map((t) => t.name).join(", ")}  ${c.dim}(default apply: ${defaultGhosttyTheme.name})${c.reset}`,
    `  ${c.dim}reload Ghostty with cmd+shift+, — opacity needs a full quit${c.reset}`,
  ];
}

export async function runGhostty(args: string[]): Promise<void> {
  const [action, name] = args;

  if (!action || action === "preview" || action === "list") {
    const theme = name ? findGhosttyTheme(name) : undefined;
    if (name && !theme) {
      console.error(`Unknown variant: ${name}`);
      print(usage());
      process.exitCode = 1;
      return;
    }
    print(usage());
    console.log(renderPreview(theme ? [theme] : ghosttyThemes));
    return;
  }

  if (action === "apply") {
    const theme = findGhosttyTheme(name ?? defaultGhosttyTheme.name);
    if (!theme) {
      console.error(`Unknown variant: ${name}`);
      print(usage());
      process.exitCode = 1;
      return;
    }
    const paths = await applyGhosttyTheme(theme);
    print([
      prompt("ghostty apply"),
      blank(),
      heading("GHOSTTY"),
      blank(),
      `  applied ${c.bold}${theme.name}${c.reset}  ${c.dim}${theme.summary}${c.reset}`,
      `  ${c.dim}${paths.config}${c.reset}`,
      `  ${c.dim}${paths.herdr}${c.reset}`,
      blank(),
      `  ${c.dim}reload: cmd+shift+, in Ghostty · herdr server reload-config${c.reset}`,
    ]);
    console.log(renderPreview([theme]));
    return;
  }

  if (action === "help" || action === "--help" || action === "-h") {
    print(usage());
    return;
  }

  console.error(`Unknown ghostty command: ${action}`);
  print(usage());
  process.exitCode = 1;
}
