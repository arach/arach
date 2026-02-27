import type { CardData } from "./types.js";

const CARD_URL = "https://arach.io/api/card.json";
const TIMEOUT_MS = 2500;

/** Fetch card data from arach.io. Returns null on any failure (offline, timeout, bad JSON). */
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

const COMMS_URL = "https://arach.io/api/comms";

/** Fire-and-forget ping to the comms API. Never throws, never blocks output. */
export function ping(event: string, meta?: Record<string, unknown>): void {
  const body = JSON.stringify({ event, ts: Date.now(), ...meta });
  fetch(COMMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "arach-cli/1.0" },
    body,
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
}
