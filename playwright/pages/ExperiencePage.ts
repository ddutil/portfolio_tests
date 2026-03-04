import { Page } from '@playwright/test';
import { BasePage } from './BasePage';


export class ExperiencePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get allTabs() {
    return this.page.locator('button[data-testid^="experience-tab-"]');
  }

  get workHistoryTab() {
    return this.page.getByTestId('experience-tab-work');
  }

  get personalProjectsTab() {
    return this.page.getByTestId('experience-tab-projects');
  }

  get educationAndCertsTab() {
    return this.page.getByTestId('experience-tab-education');
  }

  get activeTab() {
    return this.page.locator('button[data-testid^="experience-tab-"][data-active]');
  }

  get workHistoryContentHeaders() {
    return this.page.locator('h4[data-testid^="companyHeader"]');
  }

  get personalProjectsContentHeaders() {
    return this.page.locator('h4[data-testid^="projectTitle"]');
  }

  get educationAndCertsContentHeaders() {
    return this.page.locator('h4[data-testid^="educationInstitution"]');
  }

  getTabLocatorByName(tabName: string) {
    return this.page.getByRole('button', { name: new RegExp(tabName, 'i') });
  }

  async selectTab(tabName: string) {
    const tabToSelect = this.getTabLocatorByName(tabName);
    await tabToSelect.click();
  }

}

export default ExperiencePage;