import { setTimeout as sleep } from 'node:timers/promises';

/**
 * The public demo store answers bursts of traffic with an HTML page saying it
 * is "under heavy load (queue full)" instead of the requested content.
 */
export const OVERLOAD_MARKER = 'under heavy load';

export const MAX_OVERLOAD_ATTEMPTS = 5;

/** Exponential backoff with jitter: ~1s, 2s, 4s, 8s. */
export async function waitBeforeRetry(attempt: number): Promise<void> {
  const base = 1_000 * 2 ** (attempt - 1);
  await sleep(base + Math.floor(Math.random() * 500));
}
