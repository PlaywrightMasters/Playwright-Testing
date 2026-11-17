import { defineConfig, devices } from '@playwright/test';
import { resolveEnvironment } from './config/environments';

const env = resolveEnvironment();
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCI,
  // The public demo store sheds load in bursts ("queue full"). The framework
  // retries those pages itself; a test-level retry covers what remains.
  retries: isCI ? 2 : 1,
  // Stay gentle with a shared public site. Override with WORKERS=n.
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  metadata: { environment: env.name, baseURL: env.baseURL },

  use: {
    baseURL: env.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/e2e', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/e2e', use: { ...devices['Desktop Safari'] } },
  ],
});
