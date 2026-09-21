import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const envFile = resolve(__dirname, '.env');

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const environmentUrls = {
  uat: 'https://uat.catchrecording.cefasext.co.uk',
  local: 'http://localhost:3000',
  test: 'https://mmo-cr-copilot-dashboard.test.cdp-int.defra.cloud/',
  'ext-test': 'https://mmo-cr-copilot-dashboard.ext-test.cdp-int.defra.cloud/',
} as const;

const environmentName = process.env.ENVIRONMENT ?? process.env.CATCH_RECORDING_ENV;
const baseURL =
  process.env.BASE_URL ??
  process.env.CATCH_RECORDING_BASE_URL ??
  (environmentName && environmentUrls[environmentName as keyof typeof environmentUrls]) ??
  (environmentName ? `https://mmo-cr-copilot-dashboard.${environmentName}.cdp-int.defra.cloud/` : undefined) ??
  'https://mmo-cr-copilot-dashboard.ext-test.cdp-int.defra.cloud/';

/* Falls back to the frontend baseURL when the API is served from the same host. */
const apiBaseURL = process.env.CATCH_RECORDING_API_BASE_URL ?? baseURL;
const apiToken = process.env.CATCH_RECORDING_API_TOKEN;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  ...(process.env.CI ? { workers: 1 } : {}),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['allure-playwright'],
    ['html', { outputFolder: 'allure-report', open: 'never' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for the supported desktop and touchscreen browsers. */
  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined,
      },
    },
  ],
});
