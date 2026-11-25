import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { apiAuthHeaders } from './services/apiContext';

const envFile = resolve(__dirname, '.env');

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const environmentUrls = {
  dev: 'https://mmo-cr-external-frontend.dev.cdp-int.defra.cloud',
  test: 'https://mmo-cr-external-frontend.test.cdp-int.defra.cloud',
  prod: 'https://mmo-cr-external-frontend.prod.cdp-int.defra.cloud'
} as const;

const environmentName = process.env.CATCH_RECORDING_ENV ?? 'test';
const baseURL = environmentUrls[environmentName as keyof typeof environmentUrls];

/* Falls back to the frontend baseURL when the API is served from the same host. */
const apiBaseURL = process.env.CATCH_RECORDING_API_BASE_URL || baseURL;

const hdViewport = { width: 1280, height: 720 };

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: ['./allure-setup.ts', './reference-data-setup.ts'],
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['allure-playwright'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for the supported desktop browsers. */
  projects: [
    {
      name: 'Chrome',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: hdViewport }
    },
    {
      name: 'Edge',
      testDir: './tests/ui',
      use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: hdViewport }
    },
    {
      name: 'Firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], viewport: hdViewport }
    },
    {
      name: 'Safari',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], viewport: hdViewport }
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: apiAuthHeaders()
      }
    }
  ]
});
