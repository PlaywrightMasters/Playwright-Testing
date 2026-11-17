import type { BrowserContext } from '@playwright/test';

/**
 * Ad and tracking hosts loaded by the demo store. Their full-page vignettes and
 * consent dialogs cover the UI at random, which is the main cause of flaky clicks.
 */
const BLOCKED_HOST_SUFFIXES = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'googletagservices.com',
  'googletagmanager.com',
  'google-analytics.com',
  'adservice.google.com',
  'adtrafficquality.google',
  'fundingchoicesmessages.google.com',
];

export function isBlockedHost(url: URL): boolean {
  const host = url.hostname;
  return BLOCKED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export async function blockAdsAndTrackers(context: BrowserContext): Promise<void> {
  await context.route(isBlockedHost, (route) => route.abort('blockedbyclient'));
}
