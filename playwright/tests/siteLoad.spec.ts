import { test, expect } from '../fixtures/base';

test.describe('Site Load Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('page has no 404 resource errors', async ({ page }) => {
    const failedUrls: string[] = [];
    page.on('response', (response) => {
      if (response.status() === 404) failedUrls.push(response.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(failedUrls).toHaveLength(0);
  });
});
