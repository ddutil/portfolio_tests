import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config(); // loads .env from the current directory

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html'], ['list'], ...(process.env.CI ? [['./reporters/dbReporter.ts']] as const : [])],

  use: {
    baseURL: 'https://ddutil.dev',
    headless: !!process.env.CI,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testIgnore: '**/contact.rateLimit.spec.ts',
    },
  ],
});
