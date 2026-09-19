import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import {
  type GhosttyFlavor,
  flavorAppPath,
  flavorConfigPath,
  flavorHome,
  flavorTheme,
  flavorXdgHome,
} from "./flavors.js";
import { ghosttyThemeFile, ghosttyThemes } from "./themes.js";

const GHOSTTY_APP = "/Applications/Ghostty.app";

function which(bin: string): string {
  try {
    return execFileSync("which", [bin], { encoding: "utf8" }).trim();
  } catch {
    return bin;
  }
}

function codesignIdentity(): string {
  try {
    const out = execFileSync("security", ["find-identity", "-v", "-p", "codesigning"], {
      encoding: "utf8",
    });
    const developerId = out.match(/"(Developer ID Application: [^"]+)"/);
    if (developerId) return developerId[1];
    const development = out.match(/"(Apple Development: [^"]+)"/);
    if (development) return development[1];
  } catch {
    // fall through
  }
  return "-";
}

export function flavorConfigSource(flavor: GhosttyFlavor): string {
  const theme = flavorTheme(flavor);
  const cwd = flavorHome(flavor);
  const herdr = which("herdr");
  const base = path.join(homedir(), ".config", "ghostty", "config");
  return `# ${flavor.name} — Ghostty flavor
# Still Ghostty. Named, tinted, themed.

config-file = ${base}

theme = ${theme.id}
title = ${flavor.name}
working-directory = ${cwd}
command = ${herdr} --session ${flavor.herdrSession}
auto-update = off

macos-icon = custom-style
macos-icon-frame = ${flavor.iconFrame}
macos-icon-ghost-color = ${flavor.iconGhost}
macos-icon-screen-color = ${flavor.iconScreen}

background-opacity = ${theme.opacity}
cursor-color = ${theme.cursor}
cursor-text = ${theme.cursorText}
unfocused-split-fill = ${theme.splitFill}
split-divider-color = ${theme.splitDivider}
`;
}

function plistBuddy(app: string, command: string): void {
  execFileSync("/usr/libexec/PlistBuddy", [
    "-c",
    command,
    path.join(app, "Contents", "Info.plist"),
  ]);
}

export async function installGhosttyFlavor(flavor: GhosttyFlavor): Promise<{
  app: string;
  config: string;
}> {
  const app = flavorAppPath(flavor);
  execFileSync("rm", ["-rf", app]);
  await mkdir(path.dirname(app), { recursive: true });
  execFileSync("ditto", [GHOSTTY_APP, app]);

  plistBuddy(app, `Set :CFBundleIdentifier ${flavor.bundleId}`);
  plistBuddy(app, `Set :CFBundleName ${flavor.name}`);
  plistBuddy(app, `Set :CFBundleDisplayName ${flavor.name}`);
  try {
    plistBuddy(app, "Delete :LSEnvironment");
  } catch {
    // none yet
  }
  plistBuddy(app, "Add :LSEnvironment dict");
  plistBuddy(
    app,
    `Add :LSEnvironment:XDG_CONFIG_HOME string ${flavorXdgHome(flavor)}`
  );

  const source = flavorConfigSource(flavor);
  const aliasPath = flavorConfigPath(flavor);
  await mkdir(path.dirname(aliasPath), { recursive: true });
  await writeFile(aliasPath, source, "utf8");

  const xdgConfig = path.join(flavorXdgHome(flavor), "ghostty", "config");
  await mkdir(path.dirname(xdgConfig), { recursive: true });
  await writeFile(xdgConfig, source, "utf8");
  execFileSync("ln", [
    "-sfn",
    path.join(homedir(), ".config", "ghostty", "themes"),
    path.join(flavorXdgHome(flavor), "ghostty", "themes"),
  ]);

  const themesDir = path.join(homedir(), ".config", "ghostty", "themes");
  await mkdir(themesDir, { recursive: true });
  for (const theme of ghosttyThemes) {
    await writeFile(path.join(themesDir, theme.id), ghosttyThemeFile(theme), "utf8");
  }

  const identity = codesignIdentity();
  execFileSync(
    "codesign",
    ["--force", "--deep", "--sign", identity, app],
    { stdio: "pipe" }
  );
  execFileSync("xattr", ["-cr", app]);

  return { app, config: xdgConfig };
}

export function openGhosttyFlavor(flavor: GhosttyFlavor): void {
  execFileSync("open", ["-n", flavorAppPath(flavor)]);
}
