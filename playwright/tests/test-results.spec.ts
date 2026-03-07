import { test, expect } from '../fixtures/base';
import { type Locator } from '@playwright/test';
import { TestPage } from '../pages/TestPage';
import constants from '../../test-data/constants.json';
import { runQuery } from '../../utils/dbUtils';
import { fmtDuration } from '../../utils/formatUtils';

test.describe('Test Results Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-results');
  });

  test('verify title and info about test suites displayed', async ({ page }) => {
    const testPage = new TestPage(page);

    await test.step('verify title and description are visible', async () => {
      await expect(testPage.pageTitle).toBeVisible();
      await expect(testPage.testResultsDescription).toBeVisible();
    });

    await test.step('verify description displayed and contains text for current test suites', async () => {
      await expect(testPage.testResultsInfo).toBeVisible();

      const descriptionText = await testPage.testResultsInfo.textContent();
      for (const suite of constants.testResultsTestSuites) {
        expect(descriptionText).toContain(suite);
      }
    });
  });

  test('verify repo link is correct and navigates to expected URL', async ({ page, context }) => {
    const testPage = new TestPage(page);
    await expect(testPage.repoLink).toBeVisible();
    await expect(testPage.repoLink).toHaveAttribute('href', constants.testResultsRepoLink);
    await expect(testPage.repoLink).toHaveAttribute('target', '_blank');
    await expect(testPage.repoLink).toHaveAttribute('rel', 'noopener noreferrer');

    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      testPage.repoLink.click(),
    ]);
    await newTab.waitForLoadState();
    expect(newTab.url()).toBe(constants.testResultsRepoLink);
  });
});

test.describe('Test Run Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-results');
  });
  
  const testRunsQuery = `SELECT * FROM test_runs WHERE "runDate" BETWEEN $1 AND $2 ORDER BY "runDate" DESC`

  test('verify test run cards display correct information for recent test runs', async ({ page }) => {
    test.setTimeout(120_000);
    const testPage = new TestPage(page);

    const now = new Date();
    const sevenDaysAgoUtc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const nowUtc = now.toISOString();
    const testRuns = await runQuery(testRunsQuery, [sevenDaysAgoUtc, nowUtc]);

    for (const testRun of testRuns) {
      const cardLocator = testPage.getTestRunCardLocatorForGivenTestRun(testRun.id as number);
      await cardLocator.scrollIntoViewIfNeeded();
      const expectedSuiteName = testRun.suiteName as string;
      const expectedEnv = (testRun.environment as string).toUpperCase();
      const rawDate = testRun.runDate as Date | string;
      const localDate = rawDate instanceof Date ? rawDate : new Date(`${rawDate}`);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000);
      const expectedRunDate = utcDate.toLocaleString('en-US', {
          timeZone: 'UTC',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        });

      await test.step(`verify test run card for ${expectedSuiteName} suite run at ${expectedRunDate} is displayed`, async () => {
        await expect.soft(cardLocator).toBeVisible();
      });

      await test.step(`verify date displayed for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const dateLocator = testPage.getTestRunDateLocatorForGivenTestRun(cardLocator);
        await expect.soft(dateLocator).toHaveText(expectedRunDate);
      });

      await test.step(`verify suite name and environment displayed for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const suitesLocator = testPage.getTestRunSuitesLocatorForGivenTestRun(cardLocator);
        await expect.soft(suitesLocator).toHaveText(expectedSuiteName);
        const envLocator = testPage.getTestRunEnvironmentLocatorForGivenTestRun(cardLocator);
        await expect.soft(envLocator).toHaveText(expectedEnv);
      });

      if (testRun.reportUrl) {
        await test.step(`verify report link for ${expectedSuiteName} suite run at ${expectedRunDate} navigates to correct URL`, async () => {
          const reportLinkLocator = testPage.getTestRunReportLinkLocatorForGivenTestRun(cardLocator);
          await expect.soft(reportLinkLocator).toHaveAttribute('href', testRun.reportUrl as string);
          await expect.soft(reportLinkLocator).toHaveAttribute('target', '_blank');
          await expect.soft(reportLinkLocator).toHaveAttribute('rel', 'noopener noreferrer');

          const [newTab] = await Promise.all([
            page.context().waitForEvent('page'),
            reportLinkLocator.click(),
          ]);
          await newTab.waitForLoadState();
          expect.soft(newTab.url()).toBe(testRun.reportUrl as string);
          expect.soft(await newTab.title()).toContain('Playwright');
          await expect.soft(newTab.locator('#root')).toBeVisible();
          await newTab.close();
        });
      }

      await test.step(`verify duration for ${expectedSuiteName} suite run at ${expectedRunDate} is displayed and formatted correctly`, async () => {
        const durationLocator = testPage.getTestRunDurationLocatorForGivenTestRun(cardLocator);
        const expectedDuration = fmtDuration(testRun.durationMs as number);
        await expect.soft(durationLocator).toHaveText(expectedDuration);
      });

      const total = testRun.total as number;
      const passed = testRun.passed as number;
      const failed = testRun.failed as number;
      const skipped = testRun.skipped as number;

      await test.step(`verify pass rate fraction for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const passRateLocator = testPage.getTestRunPassRateLocatorForGivenTestRun(cardLocator);
        await expect.soft(passRateLocator).toHaveText(`${passed}/${total}`);
      });

      await test.step(`verify passed, failed, skipped counts for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const passedLocator = testPage.getTestRunPassedTestsLocatorForGivenTestRun(cardLocator);
        await expect.soft(passedLocator).toHaveText(String(passed) + ' passed');

        const failedLocator = testPage.getTestRunFailedTestsLocatorForGivenTestRun(cardLocator);
        if (failed > 0) {
          await expect.soft(failedLocator).toHaveText(String(failed) + ' failed');
        } else {
          await expect.soft(failedLocator).not.toBeVisible();
        }

        const skippedLocator = testPage.getTestRunSkippedTestsLocatorForGivenTestRun(cardLocator);
        if (skipped > 0) {
          await expect.soft(skippedLocator).toHaveText(String(skipped) + ' skipped');
        } else {
          await expect.soft(skippedLocator).not.toBeVisible();
        }
      });

      await test.step(`verify pass rate percent for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const passRatePercentLocator = testPage.getTestRunPassRatePercentLocatorForGivenTestRun(cardLocator);
        const expectedPassRatePercent = `${total > 0 ? Math.round((passed / total) * 100) : 0}%`;
        await expect.soft(passRatePercentLocator).toHaveText(expectedPassRatePercent);
      });

      await test.step(`verify progress bars for ${expectedSuiteName} suite run at ${expectedRunDate}`, async () => {
        const passBarLocator = testPage.getTestRunPassBarLocatorForGivenTestRun(cardLocator);
        const failedBarLocator = testPage.getTestRunFailBarLocatorForGivenTestRun(cardLocator);
        const skippedBarLocator = testPage.getTestRunSkipBarLocatorForGivenTestRun(cardLocator);
        const expectedPassRatePercentValue = total > 0 ? (passed / total) * 100 : 0;
        const expectedFailedRatePercentValue = total > 0 ? (failed / total) * 100 : 0;
        const expectedSkippedRatePercentValue = total > 0 ? (skipped / total) * 100 : 0;

        const parseBarWidth = async (locator: Locator) => {
          const style = await locator.getAttribute('style');
          const match = style?.match(/width:\s*([\d.]+)%/);
          return match ? parseFloat(match[1]) : null;
        };

        if (expectedPassRatePercentValue > 0) {
          const actual = await parseBarWidth(passBarLocator);
          expect.soft(actual).toBeCloseTo(expectedPassRatePercentValue, 2);
        } else {
          await expect.soft(passBarLocator).not.toBeVisible();
        }

        if (expectedFailedRatePercentValue > 0) {
          const actual = await parseBarWidth(failedBarLocator);
          expect.soft(actual).toBeCloseTo(expectedFailedRatePercentValue, 2);
        } else {
          await expect.soft(failedBarLocator).not.toBeVisible();
        }

        if (expectedSkippedRatePercentValue > 0) {
          const actual = await parseBarWidth(skippedBarLocator);
          expect.soft(actual).toBeCloseTo(expectedSkippedRatePercentValue, 2);
        } else {
          await expect.soft(skippedBarLocator).not.toBeVisible();
        }
      });

      await test.step(`verify expand/collapse details for ${expectedSuiteName} suite run at ${expectedRunDate} works correctly`, async () => {
        expect(await testPage.isExpandedForGivenTestRunCard(cardLocator)).toBeFalsy();
        const expandCollapseLocator = testPage.getTestRunExpandCollapseLocatorForGivenTestRun(cardLocator);
        await expandCollapseLocator.click();
        expect(await testPage.isExpandedForGivenTestRunCard(cardLocator)).toBeTruthy();
        await expandCollapseLocator.click();
        expect(await testPage.isExpandedForGivenTestRunCard(cardLocator)).toBeFalsy();
        await expandCollapseLocator.click();
        expect(await testPage.isExpandedForGivenTestRunCard(cardLocator)).toBeTruthy();
      });

      await test.step(`verify specific test case details for ${expectedSuiteName} suite run at ${expectedRunDate} are displayed when expanded`, async () => {

        for (const browser of constants.testResultsBrowsers) {
          const browserLabelLocator = testPage.getBrowserSectionLabelLocatorForGivenTestRun(cardLocator, browser);
          const browserCountLocator = testPage.getBrowserSectionCountLocatorForGivenTestRun(cardLocator, browser);
          const expectedBrowserCount = (testRun.tests as any[]).filter(t => t.name.startsWith(`${browser} > `)).length;
          await expect.soft(browserLabelLocator).toContainText(browser);
          await expect.soft(browserCountLocator).toHaveText(String(expectedBrowserCount) + ' tests');

          const specificTestCasesForBrowserLocator = testPage.getLocatorForSpecificTestCasesForGivenTestRunAndBrowser(cardLocator, browser);
          const browserTests = (testRun.tests as any[]).filter(t => t.name.startsWith(`${browser} > `));
          const statusIcon: Record<string, string> = { passed: '✓', failed: '✗', skipped: '—', timedOut: '⏱' };
          const statusBgClass: Record<string, string> = { passed: 'bg-green', failed: 'bg-red', skipped: 'bg-yellow', timedOut: 'bg-red' };

          for (let i = 0; i < browserTests.length; i++) {
            const t = browserTests[i];
            const parts = t.name.split(' > ');
            const displayName = parts.slice(-2).join(' › ');
            const expectedDuration = fmtDuration(t.durationMs);
            const testLocator = specificTestCasesForBrowserLocator.nth(i);

            await expect.soft(testLocator.locator('span').nth(0)).toHaveText(statusIcon[t.status] ?? '');
            await expect.soft(testLocator.locator('span').nth(1)).toHaveText(displayName);
            await expect.soft(testLocator.locator('span').nth(2)).toHaveText(expectedDuration);
            await expect.soft(testLocator).toHaveClass(new RegExp(statusBgClass[t.status]));
          }
        }
      });

      // Collapse the card after processing to prevent page from growing unboundedly
      await testPage.getTestRunExpandCollapseLocatorForGivenTestRun(cardLocator).click();
    }
  });
});