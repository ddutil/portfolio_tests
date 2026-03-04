import { Page } from '@playwright/test';

export class BasePage {

  constructor(protected readonly page: Page) {}

  get browserTabTitle() {
    return this.page.title();
  }

  get navBar() {
    return this.page.locator('nav');
  }

  get homeLinkIcon() {
    return this.navBar.locator('a[data-testid="nav-home-link"]');
  }

  get experienceTabLink() {
    return this.navBar.locator('a[data-testid="nav-link-experience"]');
  }

  get contactTabLink() {
    return this.navBar.locator('a[data-testid="nav-link-contact"]');
  }

  get pageTitle() {
    return this.page.locator('h1').first();
  }

  async navigateHomeViaIcon() {
    await this.homeLinkIcon.click();
  }

  async navigateToExperienceViaTab() {
    await this.experienceTabLink.click();
  }

  async navigateToContactViaTab() {
    await this.contactTabLink.click();
  }

  async navigateToUrl(url: string) {
    await this.page.goto(url);
  }

  async scrollIntoViewIfNeeded(locator: ReturnType<Page['locator']>) {
    await locator.scrollIntoViewIfNeeded();
  }
}

export default BasePage;