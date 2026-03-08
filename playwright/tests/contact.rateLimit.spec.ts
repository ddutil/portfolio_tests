import { test, expect } from '../fixtures/base';
import { ContactPage } from '../pages/ContactPage';
import { randomString } from '../../utils/stringUtils';

// This file is excluded from mobile projects in playwright.config.ts
// so it only runs on chromium desktop.
test.describe('Rate Limit - Contact Page Emails', () => {
  test.use({ bypassRateLimit: false });
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('Ensure rate limit is enforced for contact form submissions', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const randomStr = randomString(10);
    const firstName = `${randomStr}-firstNameTest`;
    const lastName = `${randomStr}-lastNameTest`;
    const email = `${randomStr}@test.com`;
    const message = 'This is a test message';

    await test.step('submit form multiple times to exceed rate limit', async () => {
      for (let i = 0; i < 6; i++) {
        await contactPage.insertTextIntoAllFields(firstName, lastName, email, message);
        const response = await contactPage.clickSendMessageAndWaitForResponse();
        if (i < 5) {
          expect(response.status()).toBe(200);
          await contactPage.clickBackToHomeButton();
          await page.waitForTimeout(1000);
        } else {
          expect(response.status()).toBe(429);
        }
      }
    });
  });
});
