import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests for MakeMyLabs / Entry Share Pal.
 * Data flow tests require the app to be running (e.g. npm run dev) and optional auth.
 *
 * For protected routes (dashboard, preview, etc.):
 *   Set env: E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD
 *   Or run with: E2E_TEST_USER_EMAIL=... E2E_TEST_USER_PASSWORD=... npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'public',
      testMatch: /public-routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-with-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: [/.*\.setup\.ts/, /public-routes\.spec\.ts/],
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
