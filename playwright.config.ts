import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',                                   // look for *.spec.ts everywhere (seed + features/)
  testIgnore: ['node_modules/**'],                // but never inside installed packages
  fullyParallel: true,                            // tests are independent, so they can run in any order/shard
  forbidOnly: !!process.env.CI,                   // fail CI if someone left test.only in the code
  retries: process.env.CI ? 1 : 0,                // retry once in CI to spot flaky tests
  reporter: process.env.CI ? 'blob' : 'html',     // CI: mergeable pieces for 2 shards; laptop: HTML report
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',   // from the secret in CI
    testIdAttribute: 'data-test',                 // Toolshop uses data-test="..."
    trace: 'retain-on-failure',                   // step-by-step trace for failed tests
    screenshot: 'only-on-failure',                // picture at the moment of failure
    video: 'retain-on-failure',                   // video of failed tests
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});