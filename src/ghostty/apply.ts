import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

export async function applyGhosttyTheme(
  theme: GhosttyTheme,
  options: { herdr?: boolean } = {}
): Promise<{
  themeFile: string;
  config: string;
  herdr: string | null;
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
  config = upsertLine(config, "background-opacity", String(theme.opacity));
  config = upsertLine(config, "cursor-color", theme.cursor);
  config = upsertLine(config, "cursor-text", theme.cursorText);
  config = upsertLine(config, "unfocused-split-fill", theme.splitFill);
  config = upsertLine(config, "split-divider-color", theme.splitDivider);
  config = upsertLine(config, "macos-icon-ghost-color", theme.iconGhost);
  config = upsertLine(config, "macos-icon-screen-color", theme.iconScreen);
  await writeFile(configPath, config.endsWith("\n") ? config : `${config}\n`, "utf8");

  if (options.herdr === false) return { themeFile, config: configPath, herdr: null };

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

/** The repo's ghostty/ folder: next to src/ when run from a checkout. */
function bundledGhosttyDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const candidate of [
    path.resolve(here, "..", "..", "ghostty"),
    path.resolve(here, "..", "ghostty"),
  ]) {
    if (existsSync(path.join(candidate, "config"))) return candidate;
  }
  throw new Error("ghostty/ files not found; run setup from an arach checkout");
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
}

/**
 * The whole look, not just the palette: base config, cursor shader, and the
 * titlebar script, then the theme on top. An existing config that differs is
 * kept as config.bak-<stamp>.
 */
export async function setupGhostty(theme: GhosttyTheme): Promise<{
  config: string;
  backup: string | null;
  shader: string;
  title: string;
  herdr: string | null;
}> {
  const source = bundledGhosttyDir();
  const target = ghosttyDir();
  await mkdir(path.join(target, "shaders"), { recursive: true });

  const configPath = path.join(target, "config");
  const base = await readFile(path.join(source, "config"), "utf8");
  let backup: string | null = null;
  if (existsSync(configPath)) {
    const current = await readFile(configPath, "utf8");
    if (current !== base) {
      backup = `${configPath}.bak-${stamp()}`;
      await copyFile(configPath, backup);
    }
  }
  await writeFile(configPath, base, "utf8");

  const shader = path.join(target, "shaders", "cursor-smear.glsl");
  await copyFile(path.join(source, "shaders", "cursor-smear.glsl"), shader);
  const title = path.join(target, "title.zsh");
  await copyFile(path.join(source, "title.zsh"), title);

  const herdrInstalled = existsSync(path.dirname(herdrConfigPath()));
  const applied = await applyGhosttyTheme(theme, { herdr: herdrInstalled });
  return { config: configPath, backup, shader, title, herdr: applied.herdr };
}
