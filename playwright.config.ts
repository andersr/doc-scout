import { defineConfig, devices } from "@playwright/test";

// TODO: set as shared var with app
const E2E_PORT = 8080;
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Configure projects for major browsers */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      dependencies: ["setup"],
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      dependencies: ["setup"],
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      dependencies: ["setup"],
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      dependencies: ["setup"],
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      dependencies: ["setup"],
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    baseURL: `http://localhost:${E2E_PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run e2e:start",
    reuseExistingServer: !process.env.CI,
    url: `http://localhost:${E2E_PORT}`,
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
});
