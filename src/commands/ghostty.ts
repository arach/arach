import { c } from "../colors.js";
import { blank, heading, prompt, print } from "../render.js";
import { applyGhosttyTheme } from "../ghostty/apply.js";
import {
  findGhosttyFlavor,
  flavorTheme,
  ghosttyFlavors,
} from "../ghostty/flavors.js";
import {
  installGhosttyFlavor,
  openGhosttyFlavor,
  writeFlavorConfig,
} from "../ghostty/install-flavor.js";
import { renderPreview } from "../ghostty/preview.js";
import {
  defaultGhosttyTheme,
  findGhosttyTheme,
  ghosttyThemes,
} from "../ghostty/themes.js";

function usage(): string[] {
  const flavorNames = ghosttyFlavors.map((f) => f.id).join(", ");
  return [
    prompt("ghostty"),
    blank(),
    heading("GHOSTTY"),
    blank(),
    `  ${c.cyan}arach ghostty${c.reset}                    Preview theme variants`,
    `  ${c.cyan}arach ghostty preview${c.reset} [name]    Preview a theme`,
    `  ${c.cyan}arach ghostty apply${c.reset} <name>      Write the palette into ~/.config/ghostty`,
    `  ${c.cyan}arach ghostty flavors${c.reset}           Named Ghostty apps (tint + theme + Herdr)`,
    `  ${c.cyan}arach ghostty install${c.reset} [name]    Build ~/Applications/dev/<Name> Ghost.app`,
    `  ${c.cyan}arach ghostty open${c.reset} <flavor> [theme]   Last arg is the theme`,
    blank(),
    `  ${c.dim}themes:${c.reset} ${ghosttyThemes.map((t) => t.name).join(", ")}  ${c.dim}(default apply: ${defaultGhosttyTheme.name})${c.reset}`,
    `  ${c.dim}flavors:${c.reset} ${flavorNames}`,
    `  ${c.dim}still Ghostty — each flavor is a named, tinted wrapper${c.reset}`,
  ];
}

function flavorLines(): string[] {
  return ghosttyFlavors.map((flavor) => {
    const tint = `${flavor.iconGhost} on ${flavor.iconScreen}`;
    return `  ${c.bold}${flavor.id.padEnd(10)}${c.reset}${flavor.name.padEnd(16)} ${c.dim}${flavor.themeName} · ${flavor.herdrSession} · ${tint}${c.reset}`;
  });
}

function resolveThemeArg(raw: string | undefined, flavorId?: string) {
  if (!raw) return undefined;
  const theme = findGhosttyTheme(raw);
  if (!theme) {
    console.error(`Unknown theme: ${raw}`);
    print(usage());
    process.exitCode = 1;
    return null;
  }
  void flavorId;
  return theme;
}

export async function runGhostty(args: string[]): Promise<void> {
  const [action, name, themeArg] = args;

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

  if (action === "flavors" || action === "flavor") {
    print([
      prompt("ghostty flavors"),
      blank(),
      heading("FLAVORS"),
      blank(),
      ...flavorLines(),
      blank(),
      `  ${c.dim}arach ghostty install talkie${c.reset}`,
      `  ${c.dim}arach ghostty open lattices stormy${c.reset}`,
    ]);
    return;
  }

  if (action === "install") {
    const selected = name
      ? [findGhosttyFlavor(name)]
      : ghosttyFlavors.map((f) => f);
    if (name && !selected[0]) {
      console.error(`Unknown flavor: ${name}`);
      print(usage());
      process.exitCode = 1;
      return;
    }
    const lines = [
      prompt("ghostty install"),
      blank(),
      heading("FLAVORS"),
      blank(),
    ];
    const theme = themeArg ? resolveThemeArg(themeArg) : undefined;
    if (themeArg && theme === null) return;
    for (const flavor of selected) {
      if (!flavor) continue;
      const paths = await installGhosttyFlavor(
        flavor,
        theme ?? flavorTheme(flavor)
      );
      lines.push(
        `  ${c.bold}${flavor.name}${c.reset}  ${c.dim}${flavor.summary}${c.reset}`
      );
      lines.push(`  ${c.dim}${paths.app}${c.reset}`);
      lines.push(`  ${c.dim}${paths.config}${c.reset}`);
      lines.push(blank());
    }
    lines.push(
      `  ${c.dim}first launch: right-click the app → Open if macOS blocks the new bundle id${c.reset}`
    );
    print(lines);
    return;
  }

  if (action === "open") {
    const flavor = findGhosttyFlavor(name ?? "");
    if (!flavor) {
      console.error(`Unknown flavor: ${name ?? ""}`);
      print(usage());
      process.exitCode = 1;
      return;
    }
    const theme = themeArg
      ? resolveThemeArg(themeArg)
      : flavorTheme(flavor);
    if (themeArg && theme === null) return;
    if (!theme) return;
    await writeFlavorConfig(flavor, theme);
    openGhosttyFlavor(flavor);
    print([
      prompt("ghostty open"),
      blank(),
      `  opened ${c.bold}${flavor.name}${c.reset}  ${c.dim}${theme.name}${c.reset}  ${theme.summary}`,
    ]);
    return;
  }

  if (action === "help" || action === "--help" || action === "-h") {
    print(usage());
    return;
  }

  const implied = findGhosttyFlavor(action);
  if (implied) {
    const theme = name ? resolveThemeArg(name) : flavorTheme(implied);
    if (name && theme === null) return;
    if (!theme) return;
    await writeFlavorConfig(implied, theme);
    openGhosttyFlavor(implied);
    print([
      prompt(`ghostty ${implied.id}`),
      blank(),
      `  opened ${c.bold}${implied.name}${c.reset}  ${c.dim}${theme.name}${c.reset}  ${theme.summary}`,
    ]);
    return;
  }

  console.error(`Unknown ghostty command: ${action}`);
  print(usage());
  process.exitCode = 1;
}
