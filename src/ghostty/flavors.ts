import { homedir } from "node:os";
import path from "node:path";

import { findGhosttyTheme, type GhosttyTheme } from "./themes.js";

export type GhosttyFlavor = {
  id: string;
  name: string;
  bundleId: string;
  themeName: string;
  herdrSession: string;
  projectDir: string;
  iconFrame: "aluminum" | "beige" | "plastic" | "chrome";
  iconGhost: string;
  iconScreen: string;
  summary: string;
};

export const ghosttyFlavors: GhosttyFlavor[] = [
  {
    id: "talkie",
    name: "Talkie Ghost",
    bundleId: "dev.arach.ghostty.talkie",
    themeName: "lacquer",
    herdrSession: "talkie-swe2",
    projectDir: "talkie",
    iconFrame: "aluminum",
    iconGhost: "#e6c384",
    iconScreen: "#0a0a0a,#3d3420",
    summary: "Lacquer gold. Talkie Herdr six-pack.",
  },
  {
    id: "lattices",
    name: "Lattices Ghost",
    bundleId: "dev.arach.ghostty.lattices",
    themeName: "void",
    herdrSession: "lattices",
    projectDir: "lattices",
    iconFrame: "aluminum",
    iconGhost: "#8aa0b0",
    iconScreen: "#11151c,#1a2029",
    summary: "Zinc void. Lattices Herdr six-pack.",
  },
];

export function findGhosttyFlavor(query: string): GhosttyFlavor | undefined {
  const q = query.trim().toLowerCase();
  return ghosttyFlavors.find(
    (flavor) =>
      flavor.id === q ||
      flavor.name.toLowerCase() === q ||
      flavor.name.toLowerCase().replace(" ghost", "") === q
  );
}

export function flavorHome(flavor: GhosttyFlavor): string {
  return path.join(homedir(), "dev", flavor.projectDir);
}

export function flavorAppPath(flavor: GhosttyFlavor): string {
  return path.join(homedir(), "Applications", "dev", `${flavor.name}.app`);
}

export function flavorConfigPath(flavor: GhosttyFlavor): string {
  return path.join(homedir(), ".config", "ghostty", "flavors", flavor.id);
}

export function flavorXdgHome(flavor: GhosttyFlavor): string {
  return path.join(homedir(), ".config", `ghostty-${flavor.id}`);
}

export function flavorTheme(
  flavor: GhosttyFlavor,
  override?: string
): GhosttyTheme {
  const name = override ?? flavor.themeName;
  const theme = findGhosttyTheme(name);
  if (!theme) {
    throw new Error(`theme ${name} missing for flavor ${flavor.id}`);
  }
  return theme;
}
