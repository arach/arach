import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CardData } from "./types.js";

const BASE_URL = "https://arach.io/api/v1";
const CARD_URL = "https://arach.io/api/card.json";
const COMMS_URL = "https://arach.io/api/comms";
const TIMEOUT_MS = 2500;
const CONFIG_PATH = join(homedir(), ".arach.json");

interface Config {
  token?: string;
}

let _config: Config | null = null;

/** Read ~/.arach.json once, cache it. Returns {} on any failure. */
async function loadConfig(): Promise<Config> {
  if (_config) return _config;
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    _config = JSON.parse(raw) as Config;
  } catch {
    _config = {};
  }
  return _config;
}

/** Fetch card data from arach.io. Returns null on any failure. */
export async function fetchCardData(): Promise<Partial<CardData> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(CARD_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "arach-cli/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    return (await res.json()) as Partial<CardData>;
  } catch {
    return null;
  }
}

export interface InboxMessage {
  id: string;
  body: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
}

/** Fetch inbox messages for the authenticated agent. Returns null if no token or on failure. */
export async function fetchInbox(): Promise<InboxMessage[] | null> {
  const config = await loadConfig();
  if (!config.token) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${BASE_URL}/inbox`, {
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "User-Agent": "arach-cli/1.0",
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = (await res.json()) as { messages: InboxMessage[] };
    return data.messages;
  } catch {
    return null;
  }
}

/** Fire-and-forget ping to the comms API. Attaches bearer token if ~/.arach.json exists. */
export async function ping(event: string, meta?: Record<string, unknown>): Promise<void> {
  const config = await loadConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "arach-cli/1.0",
  };
  if (config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  }

  const body = JSON.stringify({ event, ts: Date.now(), ...meta });
  fetch(COMMS_URL, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
}
