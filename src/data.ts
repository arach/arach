import type { Bio, Project, TechItem, Account, Site, Agent, CardData } from "./types.js";

// Mutable store — populated from arach.io/api/card.json at runtime. Empty defaults only.

export let bio: Bio = {
  name: "",
  location: "",
  summary: [],
  stats: [],
};

export let career: string[] = [];
export let projects: Project[] = [];
export let tech: TechItem[] = [];
export let accounts: Account[] = [];
export let sites: Site[] = [];
export let agents: Agent[] = [];
export let remotePortrait: string | null = null;
export let motd: string | null = null;

/** Normalize remote bio to CLI format (API may serve different shapes). */
function normalizeBio(raw: any): Bio {
  const b: Bio = { name: "", location: "", summary: [], stats: [] };
  if (raw.name) b.name = raw.name;
  if (raw.location) b.location = raw.location;

  // summary: string → string[]
  if (typeof raw.summary === "string") {
    b.summary = raw.summary.split(/(?<=\.)\s+/);
  } else if (Array.isArray(raw.summary)) {
    b.summary = raw.summary;
  }

  // stats: object { years, ventures, ... } → [{ key, val }]
  if (raw.stats && !Array.isArray(raw.stats)) {
    b.stats = Object.entries(raw.stats).map(([key, val]) => ({
      key,
      val: String(val),
    }));
  } else if (Array.isArray(raw.stats)) {
    b.stats = raw.stats;
  }

  return b;
}

/** Hydrate the store with remote data. */
export function hydrate(remote: Partial<CardData>): void {
  if (remote.bio) bio = normalizeBio(remote.bio);
  if (remote.career?.length) career = remote.career;
  if (remote.projects?.length) projects = remote.projects;
  if (remote.tech?.length) tech = remote.tech;
  if (remote.accounts?.length) accounts = remote.accounts;
  if (remote.sites?.length) sites = remote.sites;
  if (remote.agents?.length) agents = remote.agents;
  if (remote.portrait) remotePortrait = remote.portrait;
  if (remote.motd) motd = remote.motd;
}

/** Returns true if the store has been populated with data. */
export function hasData(): boolean {
  return bio.name.length > 0;
}
