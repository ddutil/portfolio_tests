import { test, expect } from '../fixtures/base';
import HomePage from '../pages/HomePage';
import constants from '../../test-data/constants.json';
import fs from 'fs';

test.describe('Homepage - Text Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage title and position text check', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect.soft(homePage.pageTitle).toHaveText(constants.homePageTitle);
    await expect.soft(homePage.positionTitle).toHaveText(constants.homePagePosition);
  });

  test('Homepage section titles and content check', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('verify section titles match expected values', async () => {
      for (const sectionTitle of await homePage.sectionTitles.all()) {
      const text = await sectionTitle.textContent();
      expect.soft(constants.homePageSectionTitles).toContain(text?.trim());
      }
    });

    await test.step('verify summary sections contain text', async () => {
      for (const summaryContent of await homePage.summarySectionContents.all()) {
        const text = await summaryContent.textContent();
        expect.soft(text?.trim().length).toBeGreaterThan(0);
      }
    });

    await test.step('verify skills sections have correct category titles and contain skill entries', async () => {
      for (const categoryTitleElement of await homePage.skillsSectionHeaders.all()) {
        await homePage.scrollIntoViewIfNeeded(categoryTitleElement);
        const text = await categoryTitleElement.textContent();
        expect.soft(constants.homePageSkillsCategoryTitles).toContain(text?.trim());
        const skillEntries = homePage.skillEntriesLocatorForGivenSection(categoryTitleElement);
        const skillCount = await skillEntries.count();
        expect.soft(skillCount).toBeGreaterThan(0);
      }
    });
  });
});

test.describe('Homepage - Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Resume button downloads non-empty PDF', async ({ page }) => {
    const homePage = new HomePage(page);

    // Listen for download event before clicking the button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      homePage.clickResumeButton(),
    ]);
    
    // check the file is a PDF
    expect(download.suggestedFilename()).toMatch(/\.pdf/);

    // check the file is not empty
    const path = await download.path();
    const stats = await fs.promises.stat(path!);
    expect(stats.size).toBeGreaterThan(1024); // 1KB
  });

  test('LinkedIn button links to correct profile', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(homePage.linkedInButton).toHaveAttribute('href', constants.homePageLinkedInLink);
  });

  test('Email button navigates to contact page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.clickEmailButton();
    await page.waitForLoadState();
    expect(page).toHaveURL(/.*\/contact/);
  });

});
