import { homedir } from "node:os";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  type GhosttyTheme,
  ghosttyThemeFile,
  ghosttyThemes,
  herdrCustomBlock,
} from "./themes.js";

function ghosttyDir(): string {
  return path.join(homedir(), ".config", "ghostty");
}

function herdrConfigPath(): string {
  return path.join(homedir(), ".config", "herdr", "config.toml");
}

function upsertLine(source: string, key: string, value: string): string {
  const pattern = new RegExp(`^${key} = .*$`, "m");
  const line = `${key} = ${value}`;
  if (pattern.test(source)) return source.replace(pattern, line);
  return `${source.replace(/\s*$/, "")}\n${line}\n`;
}

export async function writeThemeFiles(): Promise<string[]> {
  const themesPath = path.join(ghosttyDir(), "themes");
  await mkdir(themesPath, { recursive: true });
  const written: string[] = [];
  for (const theme of ghosttyThemes) {
    const file = path.join(themesPath, theme.id);
    await writeFile(file, ghosttyThemeFile(theme), "utf8");
    written.push(file);
  }
  return written;
}

export async function applyGhosttyTheme(theme: GhosttyTheme): Promise<{
  themeFile: string;
  config: string;
  herdr: string;
}> {
  await writeThemeFiles();
  const themeFile = path.join(ghosttyDir(), "themes", theme.id);
  const configPath = path.join(ghosttyDir(), "config");
  let config = "";
  try {
    config = await readFile(configPath, "utf8");
  } catch {
    config = `# Ghostty — managed by arach ghostty apply\ntheme = ${theme.id}\n`;
  }
  config = upsertLine(config, "theme", theme.id);
  config = upsertLine(config, "cursor-color", theme.cursor);
  config = upsertLine(config, "cursor-text", theme.cursorText);
  config = upsertLine(config, "unfocused-split-fill", theme.splitFill);
  config = upsertLine(config, "split-divider-color", theme.splitDivider);
  config = upsertLine(config, "macos-icon-ghost-color", theme.iconGhost);
  config = upsertLine(config, "macos-icon-screen-color", theme.iconScreen);
  await writeFile(configPath, config.endsWith("\n") ? config : `${config}\n`, "utf8");

  const herdrPath = herdrConfigPath();
  let herdr = "";
  try {
    herdr = await readFile(herdrPath, "utf8");
  } catch {
    herdr = "onboarding = false\n\n";
  }
  const custom = herdrCustomBlock(theme);
  if (/\[theme\.custom\]/.test(herdr)) {
    herdr = herdr.replace(/\[theme\.custom\][\s\S]*?(?=\n\[|\n*$)/, custom.trimEnd() + "\n");
  } else {
    herdr = `${herdr.replace(/\s*$/, "")}\n\n${custom}`;
  }
  if (/\[ui\]/.test(herdr)) {
    if (/\[ui\][^\[]*accent = /.test(herdr)) {
      herdr = herdr.replace(
        /(\[ui\][^\[]*)accent = ".*"/,
        `$1accent = "${theme.uiAccent}"`
      );
    } else {
      herdr = herdr.replace("[ui]", `[ui]\naccent = "${theme.uiAccent}"`);
    }
  } else {
    herdr += `\n[ui]\naccent = "${theme.uiAccent}"\n`;
  }
  await mkdir(path.dirname(herdrPath), { recursive: true });
  await writeFile(herdrPath, herdr.endsWith("\n") ? herdr : `${herdr}\n`, "utf8");

  return { themeFile, config: configPath, herdr: herdrPath };
}
