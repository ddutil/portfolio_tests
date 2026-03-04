import { Page } from '@playwright/test';
import { BasePage } from './BasePage';


export class ErrorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get goHomeButton() {
    return this.page.getByRole('link', { name: /go home/i });
  }

  async clickGoHomeButton() {
    await this.goHomeButton.click();
  }

}

export default ErrorPage;