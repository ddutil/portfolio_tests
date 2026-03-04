import { test as base } from '@playwright/test';

type TestOptions = {
  bypassRateLimit: boolean;
};

/**
 * Extends the base `test` fixture to inject the x-test-key header
 * only on requests to the portfolio domain, avoiding CORS issues
 * with third-party services like PostHog.
 *
 * Set `bypassRateLimit: false` via `test.use()` to skip header injection
 * (e.g. for rate limiting tests that should receive 429 responses).
 */
export const test = base.extend<TestOptions>({
  bypassRateLimit: [true, { option: true }],
  page: async ({ page, baseURL, bypassRateLimit }, use) => {
    if (bypassRateLimit) {
      await page.route(`${baseURL}/**`, async (route) => {
        await route.continue({
          headers: {
            ...route.request().headers(),
            'x-test-key': process.env.TEST_API_KEY ?? '',
          },
        });
      });
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
