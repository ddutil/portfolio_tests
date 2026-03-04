import { test, expect } from '../fixtures/base';
import constants from '../../test-data/constants.json';
import BasePage from '../pages/BasePage';
import ErrorPage from '../pages/ErrorPage';
import { error } from 'node:console';

test.describe('Navigation Validation', () => {

  test('navigate to all pages via URL', async ({ page }) => {
    for (const route of constants.routes) {
      await test.step(`navigate to ${route} and verify title is visible`, async () => {
        await page.goto(route);
        const basePage = new BasePage(page);

        const pageTitle = basePage.pageTitle;
        if (route === '/') {
          await expect(pageTitle).toHaveText(constants.homePageTitle);
        } else {
          const expectedTitle = route.replace(/\//g, ''); 
          await expect(pageTitle).toContainText(expectedTitle, { 
            ignoreCase: true, 
          });
        }
      });
    }
  });

  test('navigate to all pages via UI navbar links', async ({ page }) => {
    await page.goto('/');
    const basePage = new BasePage(page);

    await test.step('navigate to experience page via navbar and verify title', async () => {
      await basePage.navigateToExperienceViaTab();
      await expect(basePage.pageTitle).toHaveText(constants.experiencePageTitle);
      await expect(basePage.navBar).toBeVisible();
    });

    await test.step('navigate to contact page via navbar and verify title', async () => {
      await basePage.navigateToContactViaTab();
      await expect(basePage.pageTitle).toHaveText(constants.contactPageTitle);
      await expect(basePage.navBar).toBeVisible();
    });

    await test.step('navigate back to home page via navbar icon and verify title', async () => {
      await basePage.navigateHomeViaIcon();
      await expect(basePage.pageTitle).toHaveText(constants.homePageTitle);
      await expect(basePage.navBar).toBeVisible();
    });
  });

  test('invalid URL produces 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const errorPage = new ErrorPage(page);
    
    await expect(errorPage.pageTitle).toContainText(constants.errorPageTitle);

    await errorPage.clickGoHomeButton();
    await expect(errorPage.pageTitle).toHaveText(constants.homePageTitle);
  });
});
