import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';


export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get allFieldLabels() {
    return this.page.locator('label[data-testid^="label-"]');
  }

  get fieldLabelForFirstName() {
    return this.page.getByTestId('label-firstName');
  }

  get fieldLabelForLastName() {
    return this.page.getByTestId('label-lastName');
  }

  get fieldLabelForEmail() {
    return this.page.getByTestId('label-email');
  }

  get fieldLabelForCompany() {
    return this.page.getByTestId('label-company');
  }

  get fieldLabelForMessage() {
    return this.page.getByTestId('label-message');
  }

  get firstNameTextBox() {
    return this.page.getByTestId('input-firstName');
  }

  get lastNameTextBox() {
    return this.page.getByTestId('input-lastName');
  }

  get emailTextBox() {
    return this.page.getByTestId('input-email');
  }

  get companyTextBox() {
    return this.page.getByTestId('input-company');
  }

  get messageTextArea() {
    return this.page.getByTestId('input-message');
  }
  
  get sendMessageButton() {
    return this.page.getByTestId('submit-button');
  }

  get allVisibleErrorMessages() {
    return this.page.locator('[data-testid*="error"]');
  }

  get errorMessageForFirstName() {
    return this.page.getByTestId('error-firstName');
  }

  get errorMessageForLastName() {
    return this.page.getByTestId('error-lastName');
  }

  get errorMessageForEmail() {
    return this.page.getByTestId('error-email');
  }

  get errorMessageForCompany() {
    return this.page.getByTestId('error-company');
  }

  get errorMessageForMessage() {
    return this.page.getByTestId('error-message');
  }

  get errorMessageForGeneralErrors() {
    return this.page.getByTestId('error-general');
  }

  async insertTextIntoField(field: Locator, text: string) {
    await field.fill(text);
  }

  async insertTextIntoAllFields(firstName: string, lastName: string, email: string, message: string, company = '') {
    await this.insertTextIntoField(this.firstNameTextBox, firstName);
    await this.insertTextIntoField(this.lastNameTextBox, lastName);
    await this.insertTextIntoField(this.emailTextBox, email);
    await this.insertTextIntoField(this.messageTextArea, message);
    await this.insertTextIntoField(this.companyTextBox, company);
  }

  async getAllErrorMessagesText() {
    const errors = await this.allVisibleErrorMessages.all();
    return Promise.all(errors.map(e => e.textContent()));
  }

  async getErrorMessageByLocator(fieldLabelLocator: Locator) {
    return fieldLabelLocator.textContent();
  }


  async clickSendMessageButton() {
    await this.sendMessageButton.click();
  }

  async waitForContactApiResponse() {
    return this.page.waitForResponse(resp =>
        resp.url().includes('/api/contact')
    );
  }

  async clickSendMessageAndWaitForResponse() {
    const responsePromise = this.waitForContactApiResponse();
    await this.clickSendMessageButton();
    return responsePromise;
  }

  // successful form submission locators and actions
  get messageSentConfirmationTitle() {
    return this.page.getByTestId('messageSentTitle');
  }

  get messageSentConfirmationContent() {
    return this.page.getByTestId('messageSentBody');
  }

  get backToHomeButton() {
    return this.page.getByTestId('messageSentBackButton');
  }

  async clickBackToHomeButton() {
    await this.backToHomeButton.click();
  }
}

export default ContactPage;