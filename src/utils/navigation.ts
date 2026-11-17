import type { Page } from '@playwright/test';
import { MAX_OVERLOAD_ATTEMPTS, OVERLOAD_MARKER, waitBeforeRetry } from './overload';

/** `page.goto` that waits out the store's "queue full" page instead of failing the test. */
export async function gotoStorePage(page: Page, path: string): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    const response = await page.goto(path);
    const body = response ? await response.text() : '';
    if (!body.includes(OVERLOAD_MARKER)) {
      return;
    }
    if (attempt >= MAX_OVERLOAD_ATTEMPTS) {
      throw new Error(`${path}: store still overloaded after ${attempt} attempts`);
    }
    await waitBeforeRetry(attempt);
  }
}
