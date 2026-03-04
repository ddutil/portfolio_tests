import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';


export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get positionTitle() {
    return this.page.getByTestId('home-job-title');
  }

  get resumeButton() {
    return this.page.getByTestId('home-resume-button');
  }

  get linkedInButton() {
    return this.page.getByTestId('home-linkedin-button');
  }

  get emailButton() {
    return this.page.getByTestId('home-contact-button');
  }

  get sectionTitles() {
    return this.page.getByTestId(/^home-.*-title/)
      .filter({ hasText: /skills|summary/ });
  }

  get summarySectionContents() {
    return this.page.locator('[data-testid*="home-summary-"][data-testid*="-content"]');
  }

  get skillsSectionHeaders() {
    return this.page.locator('[data-testid*="home-skill-category"]');
  }

  async clickResumeButton() {
    await this.resumeButton.click();
  }

  async clickLinkedInButton() {
    await this.linkedInButton.click();
  }

  async clickEmailButton() {
    await this.emailButton.click();
  }

  skillEntriesLocatorForGivenSection(skillsSectionHeaderLocator: Locator) {
    return skillsSectionHeaderLocator.locator('..').locator(`[data-testid*="home-skill"]:not([data-testid*="category"])`);
  }
}

export default HomePage;
