import { execFileSync } from "node:child_process";
import { chmod, copyFile, mkdir, writeFile } from "node:fs/promises";
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
    const development = out.match(/"(Apple Development: [^"]+)"/);
    if (development) return development[1];
    const developerId = out.match(/"(Developer ID Application: [^"]+)"/);
    if (developerId) return developerId[1];
  } catch {
    // fall through
  }
  return "-";
}

function sign(target: string, entitlements: string): void {
  execFileSync(
    "codesign",
    ["--force", "--sign", codesignIdentity(), "--entitlements", entitlements, target],
    { stdio: "pipe" }
  );
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

function infoPlist(flavor: GhosttyFlavor): string {
  const xdg = flavorXdgHome(flavor);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>${flavor.name}</string>
  <key>CFBundleExecutable</key>
  <string>ghostty</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>${flavor.bundleId}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${flavor.name}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSEnvironment</key>
  <dict>
    <key>XDG_CONFIG_HOME</key>
    <string>${xdg}</string>
  </dict>
  <key>LSMinimumSystemVersion</key>
  <string>14.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>NSSupportsAutomaticTermination</key>
  <false/>
</dict>
</plist>
`;
}

function entitlementsPlist(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
</dict>
</plist>
`;
}

export async function installGhosttyFlavor(flavor: GhosttyFlavor): Promise<{
  app: string;
  config: string;
}> {
  const app = flavorAppPath(flavor);
  const contents = path.join(app, "Contents");
  const macos = path.join(contents, "MacOS");
  await mkdir(macos, { recursive: true });

  await writeFile(path.join(contents, "Info.plist"), infoPlist(flavor), "utf8");
  await writeFile(path.join(contents, "PkgInfo"), "APPL????", "utf8");

  const ghosttyBin = path.join(GHOSTTY_APP, "Contents", "MacOS", "ghostty");
  const localGhostty = path.join(macos, "ghostty");
  await copyFile(ghosttyBin, localGhostty);
  await chmod(localGhostty, 0o755);

  const ln = (from: string, to: string) => {
    execFileSync("ln", ["-sfn", from, to]);
  };
  ln(
    path.join(GHOSTTY_APP, "Contents", "Frameworks"),
    path.join(contents, "Frameworks")
  );
  ln(
    path.join(GHOSTTY_APP, "Contents", "Resources"),
    path.join(contents, "Resources")
  );

  const entitlements = path.join(
    homedir(),
    ".config",
    "ghostty",
    "flavors",
    ".entitlements.plist"
  );
  await mkdir(path.dirname(entitlements), { recursive: true });
  await writeFile(entitlements, entitlementsPlist(), "utf8");
  sign(localGhostty, entitlements);

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

  sign(app, entitlements);
  execFileSync("xattr", ["-cr", app]);

  return { app, config: xdgConfig };
}

export function openGhosttyFlavor(flavor: GhosttyFlavor): void {
  execFileSync("open", ["-n", flavorAppPath(flavor)]);
}
