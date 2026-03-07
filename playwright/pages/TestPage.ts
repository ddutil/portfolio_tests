import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';


export class TestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get testResultsDescription() {
    return this.page.getByTestId('test-results-description');
  }

  get testResultsInfo() {
    return this.page.getByTestId('test-results-info');
  }

  get repoLink() {
    return this.page.getByTestId('test-results-repo-link');
  }

  getTestRunCardLocatorForGivenTestRun(testRunId: number) {
    return this.page.getByTestId(`test-run-card-${testRunId}`);
  }

  getTestRunDateLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-date"]');
  }

  getTestRunSuitesLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-suite-"]');
  }

  getTestRunEnvironmentLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-env"]');
  }
  
  getTestRunReportLinkLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-report-link"]');
  }

  getTestRunDurationLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-duration"]');
  }

  getTestRunPassRateLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-pass-rate"]:not([data-testid*="test-run-pass-rate-percent"])');
  }

  getTestRunPassedTestsLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-passed"]');
  }

  getTestRunFailedTestsLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-failed"]');
  }

  getTestRunSkippedTestsLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-skipped"]:not([data-testid*="test-run-skipped-bar"])');
  }

  getTestRunPassRatePercentLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-pass-rate-percent"]');
  }

  getTestRunPassBarLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-pass-bar"]');
  }

  getTestRunFailBarLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-fail-bar"]');
  }

  getTestRunSkipBarLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-skipped-bar"]');
  }

  getTestRunExpandCollapseLocatorForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-expanded"], [data-testid*="test-run-collapsed"]');
  }

  getBrowserSectionLabelLocatorForGivenTestRun(cardLocator: Locator, browserName: string) {
    return cardLocator.locator(`[data-testid*="browser-section-${browserName}-label"]`);
  }

  getBrowserSectionCountLocatorForGivenTestRun(cardLocator: Locator, browserName: string) {
    return cardLocator.locator(`[data-testid*="browser-section-${browserName}-count"]`);
  }

  getLocatorForAllSpecificTestCasesForGivenTestRun(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-specific-test"]');
  }

  getLocatorForSpecificTestCasesForGivenTestRunAndBrowser(cardLocator: Locator, browserName: string) {
    return cardLocator.locator(`[data-testid*="test-run-specific-test"][data-testid*="browser-${browserName}"]`);
  }

  async getTestStatusCounts(testLocators: Locator) {
    const [greenCount, redCount, yellowCount] = await Promise.all([
      testLocators.locator('[class*="bg-green"]').count(),
      testLocators.locator('[class*="bg-red"]').count(),
      testLocators.locator('[class*="bg-yellow"]').count(),
    ]);

    return { greenCount, redCount, yellowCount };
  }

  async clickTestRunReportLinkForGivenTestRun(cardLocator: Locator) {
    await this.getTestRunReportLinkLocatorForGivenTestRun(cardLocator).click();
  }

  async clickRepoLink() {
    await this.repoLink.click();
  }

  async clickExpandCollapseForGivenTestRun(cardLocator: Locator) {
    await this.getTestRunExpandCollapseLocatorForGivenTestRun(cardLocator).click();
  }

  async expandOrCollapseTestRunCard(cardLocator: Locator, expand: boolean) {
    const isExpanded = await this.isExpandedForGivenTestRunCard(cardLocator);

    if (isExpanded !== expand) {
      await this.getTestRunExpandCollapseLocatorForGivenTestRun(cardLocator).click();
    }
  }

  async isExpandedForGivenTestRunCard(cardLocator: Locator) {
    return cardLocator.locator('[data-testid*="test-run-expanded"]').isVisible();
  }

}

export default TestPage;