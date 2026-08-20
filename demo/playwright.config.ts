import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // With E2E_PREVIEW=1, run the tests against the PRODUCTION build served by
  // `vite preview` instead of the dev server. The dev server dedupes React on
  // its own, so a production-only bundling fault (e.g. two React copies) renders
  // blank in production while every dev-mode test passes. CI sets this flag so
  // the suite exercises the bundle Vercel actually ships. Requires the demo to
  // be built first (the CI job builds it before this step).
  webServer: {
    command: process.env.E2E_PREVIEW
      ? 'pnpm preview --port 3000 --strictPort'
      : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
