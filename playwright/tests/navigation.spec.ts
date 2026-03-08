import { test, expect } from '../fixtures/base';
import constants from '../../test-data/constants.json';
import BasePage from '../pages/BasePage';
import ErrorPage from '../pages/ErrorPage';

test.describe('Navigation', () => {

  test('Navigate to all pages via URL', async ({ page }) => {
    for (const route of constants.routes) {
      await test.step(`navigate to ${route} and verify title is visible`, async () => {
        await page.goto(route);
        const basePage = new BasePage(page);

        const pageTitle = basePage.pageTitle;
        if (route === '/') {
          await expect(pageTitle).toHaveText(constants.homePageTitle);
        } else {
          const expectedTitle = route.replace(/\//g, '').replace(/-/g, ' '); 
          await expect(pageTitle).toContainText(expectedTitle, { 
            ignoreCase: true, 
          });
        }
      });
    }
  });

  test('Navigate to all pages via UI navbar links', async ({ page }) => {
    await page.goto('/');
    const basePage = new BasePage(page);

    await test.step('Navigate to experience page via navbar and verify title', async () => {
      await basePage.navigateToExperienceViaTab();
      await expect(basePage.pageTitle).toHaveText(constants.experiencePageTitle);
      await expect(basePage.navBar).toBeVisible();
    });

    await test.step('Navigate to contact page via navbar and verify title', async () => {
      await basePage.navigateToContactViaTab();
      await expect(basePage.pageTitle).toHaveText(constants.contactPageTitle);
      await expect(basePage.navBar).toBeVisible();
    });

    await test.step('Navigate back to home page via navbar icon and verify title', async () => {
      await basePage.navigateHomeViaIcon();
      await expect(basePage.pageTitle).toHaveText(constants.homePageTitle);
      await expect(basePage.navBar).toBeVisible();
    });
  });

  test('Invalid URL produces 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const errorPage = new ErrorPage(page);
    
    await expect(errorPage.pageTitle).toContainText(constants.errorPageTitle);

    await errorPage.clickGoHomeButton();
    await expect(errorPage.pageTitle).toHaveText(constants.homePageTitle);
  });

  test('Navbar remains visible after scrolling to bottom of page', async ({ page }) => {
    for (const route of constants.routes) {
      await test.step(`navigate to ${route} and verify navbar is sticky`, async () => {
        await page.goto(route);
        const basePage = new BasePage(page);

        await expect(basePage.navBar).toBeVisible();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(basePage.navBar).toBeVisible();
      });
    }
  });
});
