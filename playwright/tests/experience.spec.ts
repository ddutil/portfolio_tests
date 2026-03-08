import { test, expect } from '../fixtures/base';
import { ExperiencePage } from '../pages/ExperiencePage';
import constants from '../../test-data/constants.json';

test.describe('Experience Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/experience');
  });

  test('Number of tabs and tab text check', async ({ page }) => {
    const experiencePage = new ExperiencePage(page);
    expect.soft(await experiencePage.allTabs.count()).toBe(constants.experiencePageTabs.length);
    
    for (const tab of await experiencePage.allTabs.all()) {
      expect.soft(constants.experiencePageTabs).toContain(await tab.textContent());
    }
  });

  test('Work History tab selected by default', async ({ page }) => {
    const experiencePage = new ExperiencePage(page);
    await expect(experiencePage.workHistoryTab).toHaveAttribute('data-active', 'true');
  });

  test('Only one tab is active at a time', async ({ page }) => {
    const experiencePage = new ExperiencePage(page);

    // verify only one tab is active before changing tabs
    const activeTabs = experiencePage.activeTab;
    await expect(activeTabs).toHaveCount(1);

    // verify only one tab is active after changing tabs
    const tabCount = await constants.experiencePageTabs.length;
    for (let i = 0; i < await constants.experiencePageTabs.length * 2; i++) {
      await test.step(`select ${constants.experiencePageTabs[i % tabCount]} tab and verify only that tab is active`, async () => {
        const tabName = constants.experiencePageTabs[i % tabCount];
        await experiencePage.selectTab(tabName);
        await expect(experiencePage.getTabLocatorByName(tabName)).toHaveAttribute('data-active', 'true');
        await expect(activeTabs).toHaveCount(1);
      });
    }
  });

  test('Content updates when selecting different tabs', async ({ page }) => {
    const experiencePage = new ExperiencePage(page);

    await test.step('verify work history content is visible when work history tab is selected', async () => {
      await experiencePage.selectTab('Work History');
      await expect(experiencePage.workHistoryContentHeaders.first()).toBeVisible();
      await expect(experiencePage.personalProjectsContentHeaders.first()).not.toBeVisible();
      await expect(experiencePage.educationAndCertsContentHeaders.first()).not.toBeVisible();
    });

    await test.step('verify personal projects content is visible when personal projects tab is selected', async () => {
      await experiencePage.selectTab('Personal Projects');
      await expect(experiencePage.personalProjectsContentHeaders.first()).toBeVisible();
      await expect(experiencePage.workHistoryContentHeaders.first()).not.toBeVisible();
      await expect(experiencePage.educationAndCertsContentHeaders.first()).not.toBeVisible();
    });

    await test.step('verify education and certs content is visible when education and certs tab is selected', async () => {
      await experiencePage.selectTab('Education & Certs');
      await expect(experiencePage.educationAndCertsContentHeaders.first()).toBeVisible();
      await expect(experiencePage.workHistoryContentHeaders.first()).not.toBeVisible();
      await expect(experiencePage.personalProjectsContentHeaders.first()).not.toBeVisible();
    });
  });

});
