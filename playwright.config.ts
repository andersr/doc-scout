import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT;

if (!port) {
  console.warn("No port found");
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Configure projects for major browsers */
  //  teardown: "teardown",
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    // {
    //   name: "teardown",
    //   testMatch: /.*\.teardown\.ts/,
    // },
    {
      dependencies: ["setup"],
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // {
    //   dependencies: ["setup"],
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // currently not testing on webkit due to auth issues, likely related to this: https://github.com/microsoft/playwright/issues/35712
    // {
    //   dependencies: ["setup"],
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
    /* Test against mobile viewports. */
    // {
    //   dependencies: ["setup"],
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   dependencies: ["setup"],
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  tsconfig: "./tsconfig.playwright.json",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    baseURL: `http://localhost:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `PORT=${port} dotenv -e .env.test -- npm start`,
    reuseExistingServer: !process.env.CI,
    url: `http://localhost:${port}`,
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
});
