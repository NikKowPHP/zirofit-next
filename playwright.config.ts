
import { defineConfig, devices } from '@playwright/test';

const TRAINER_AUTH_FILE = 'tests/e2e/.auth/trainer.json';
const CLIENT_AUTH_FILE = 'tests/e2e/.auth/client.json';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Grant microphone permissions automatically */
    permissions: ['microphone'],
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    
    // Desktop Browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            // Point to the test audio file. The path is relative to the project root.
            '--use-file-for-fake-audio-capture=tests/fixtures/test-audio.webm'
          ]
        }
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },
    {
      name: 'trainer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: TRAINER_AUTH_FILE,
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },
    {
      name: 'client',
      use: {
        ...devices['Desktop Chrome'],
        storageState: CLIENT_AUTH_FILE,
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },

    // Mobile Browsers
    {
      name: 'Mobile Chrome (Trainer)',
      use: {
        ...devices['Pixel 5'],
        storageState: TRAINER_AUTH_FILE,
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },
    {
      name: 'Mobile Chrome (Client)',
      use: {
        ...devices['Pixel 5'],
        storageState: CLIENT_AUTH_FILE,
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});