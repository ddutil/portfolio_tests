import { test, expect } from '../fixtures/base';
import { ContactPage } from '../pages/ContactPage';
import constants from '../../test-data/constants.json';
import { randomString } from '../../utils/stringUtils';
import { runQuery } from '../../utils/dbUtils';

const query = 'SELECT * FROM contact_submissions WHERE email = $1';

test.describe('Contact Page Layout, Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('form field labels are correct, text fields and buttons are visible', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await test.step('verify form field labels match expected values', async () => {
      expect.soft(await contactPage.fieldLabelForFirstName).toHaveText(constants.contactPageFirstNameLabel);
      expect.soft(await contactPage.fieldLabelForLastName).toHaveText(constants.contactPageLastNameLabel);
      expect.soft(await contactPage.fieldLabelForEmail).toHaveText(constants.contactPageEmailLabel);
      expect.soft(await contactPage.fieldLabelForCompany).toHaveText(constants.contactPageCompanyLabel);
      expect.soft(await contactPage.fieldLabelForMessage).toHaveText(constants.contactPageMessageLabel);
    });

    await test.step('verify text fields are visible', async () => {
      expect.soft(await contactPage.firstNameTextBox).toBeVisible();
      expect.soft(await contactPage.lastNameTextBox).toBeVisible();
      expect.soft(await contactPage.emailTextBox).toBeVisible();
      expect.soft(await contactPage.companyTextBox).toBeVisible();
      expect.soft(await contactPage.messageTextArea).toBeVisible();
    });

    await test.step('verify send message button is visible and has correct text', async () => {
      expect.soft(await contactPage.sendMessageButton).toBeVisible();
      expect.soft(await contactPage.sendMessageButton).toHaveText(constants.contactPageSendMessageButtonText);
    });
  });

  test('minimal happy path form submission, no company', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const randomStr = randomString(10);
    const firstName = `${randomStr}-firstNameTest`;
    const lastName = `${randomStr}-lastNameTest`;
    const email = `${randomStr}@test.com`;
    const message = 'This is a test message';

    await test.step('populate required fields with data', async () => {
      await contactPage.insertTextIntoAllFields(firstName, lastName, email, message);
    });

    await test.step('submit form and verify 200 status code', async () => {
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      const body = await response.text();
      expect(response.status(), `Response body: ${body}`).toBe(200);
    });

    await test.step('verify success message is visible after submission', async () => {
      expect(await contactPage.messageSentConfirmationTitle).toBeVisible();
      expect(await contactPage.messageSentConfirmationTitle).toHaveText(constants.contactPageSuccessTitle);
      expect(await contactPage.messageSentConfirmationContent).toBeVisible();
      expect(await contactPage.messageSentConfirmationContent).toContainText(constants.contactPageSuccessMessage);
    });

    await test.step('navigate back to contact page and verify form is reset', async () => {
      await contactPage.clickBackToHomeButton();
      expect(await contactPage.pageTitle).toHaveText(constants.contactPageTitle);
      expect(await contactPage.firstNameTextBox).toHaveValue('');
      expect(await contactPage.lastNameTextBox).toHaveValue('');
      expect(await contactPage.emailTextBox).toHaveValue('');
      expect(await contactPage.companyTextBox).toHaveValue('');
      expect(await contactPage.messageTextArea).toHaveValue('');
    });

    await test.step('check database entry for submitted message', async () => {
      const dbEntry = await runQuery(query, [`${randomStr}@test.com`]);

      expect.soft(dbEntry[0].firstName).toBe(firstName);
      expect.soft(dbEntry[0].lastName).toBe(lastName);
      expect.soft(dbEntry[0].email).toBe(email);
      expect.soft(dbEntry[0].message).toBe(message);
      expect.soft(dbEntry[0].company).toBe('');
      const submittedAt = new Date(dbEntry[0].submittedAt as string).getTime();
      const now = Date.now();
      expect.soft(now - submittedAt).toBeLessThan(60 * 1000);
    });

  });

  test('maximum happy path form submission with company', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const randomStr = randomString(10);
    const firstName = `${randomStr}-firstNameTest`;
    const lastName = `${randomStr}-lastNameTest`;
    const email = `${randomStr}@test.com`;
    const message = 'This is a test message';
    const company = `${randomStr}-companyTest`;

    await test.step('populate all fields with data', async () => {
      await contactPage.insertTextIntoAllFields(firstName, lastName, email, message, company);
    });

    await test.step('submit form and verify 200 status code', async () => {
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(200);
    });

    await test.step('verify success message is visible after submission', async () => {
      expect(await contactPage.messageSentConfirmationTitle).toBeVisible();
      expect(await contactPage.messageSentConfirmationTitle).toHaveText(constants.contactPageSuccessTitle);
      expect(await contactPage.messageSentConfirmationContent).toBeVisible();
      expect(await contactPage.messageSentConfirmationContent).toContainText(constants.contactPageSuccessMessage);
    });

    await test.step('check database entry for submitted message', async () => {
      const dbEntry = await runQuery(query, [`${email}`]);

      expect.soft(dbEntry[0].firstName).toBe(firstName);
      expect.soft(dbEntry[0].lastName).toBe(lastName);
      expect.soft(dbEntry[0].email).toBe(email);
      expect.soft(dbEntry[0].message).toBe(message);
      expect.soft(dbEntry[0].company).toBe(company);
      const submittedAt = new Date(dbEntry[0].submittedAt as string).getTime();
      const now = Date.now();
      expect.soft(now - submittedAt).toBeLessThan(60 * 1000);
    });
  });
});

test.describe('Contact Page Upper and Lower Boundary Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('upper bounds for all fields' , async ({ page }) => {
    const contactPage = new ContactPage(page);
    const firstName = randomString(50);
    const lastName = randomString(50);
    const email = `${randomString(244)}@${randomString(5)}.com`;
    const message = randomString(2000);
    const company = randomString(100);

    await test.step('populate all fields with maximum allowed characters and submit form', async () => {
      await contactPage.insertTextIntoAllFields(firstName, lastName, email, message, company);
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(200);
    });

    await test.step('verify success message is visible after submission', async () => {
      expect(await contactPage.messageSentConfirmationTitle).toBeVisible();
      expect(await contactPage.messageSentConfirmationTitle).toHaveText(constants.contactPageSuccessTitle);
      expect(await contactPage.messageSentConfirmationContent).toBeVisible();
      expect(await contactPage.messageSentConfirmationContent).toContainText(constants.contactPageSuccessMessage);
    });

    await test.step('check database entry for submitted message', async () => {
      const dbEntry = await runQuery(query, [`${email}`]);

      expect.soft(dbEntry[0].firstName).toBe(firstName);
      expect.soft(dbEntry[0].lastName).toBe(lastName);
      expect.soft(dbEntry[0].email).toBe(email);
      expect.soft(dbEntry[0].message).toBe(message);
      expect.soft(dbEntry[0].company).toBe(company);
      const submittedAt = new Date(dbEntry[0].submittedAt as string).getTime();
      const now = Date.now();
      expect.soft(now - submittedAt).toBeLessThan(60 * 1000);
    });

  });

  test('lower bounds for all fields' , async ({ page }) => {
    const contactPage = new ContactPage(page);
    const firstName = randomString(1);
    const lastName = randomString(1);
    const email = `${randomString(1)}@${randomString(1)}.cc`;
    const message = randomString(10);
    const company = randomString(1);

    await test.step('populate all fields with minimum allowed characters and submit form', async () => {
      await contactPage.insertTextIntoAllFields(firstName, lastName, email, message, company);
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(200);
    });

    await test.step('verify success message is visible after submission', async () => {
      expect(await contactPage.messageSentConfirmationTitle).toBeVisible();
      expect(await contactPage.messageSentConfirmationTitle).toHaveText(constants.contactPageSuccessTitle);
      expect(await contactPage.messageSentConfirmationContent).toBeVisible();
      expect(await contactPage.messageSentConfirmationContent).toContainText(constants.contactPageSuccessMessage);
    });

    await test.step('check database entry for submitted message', async () => {
      const dbEntry = await runQuery(query, [`${email}`]);

      expect.soft(dbEntry[0].firstName).toBe(firstName);
      expect.soft(dbEntry[0].lastName).toBe(lastName);
      expect.soft(dbEntry[0].email).toBe(email);
      expect.soft(dbEntry[0].message).toBe(message);
      expect.soft(dbEntry[0].company).toBe(company);
      const submittedAt = new Date(dbEntry[0].submittedAt as string).getTime();
      const now = Date.now();
      expect.soft(now - submittedAt).toBeLessThan(60 * 1000);
    });
  });
});

test.describe('Contact Page Failure Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('submit form with all fields empty and verify error messages', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await test.step('submit form with all fields empty', async () => {
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(400);
    });

    await test.step('verify error messages are visible for required fields', async () => {
      const errorMessages = await contactPage.getAllErrorMessagesText();
      expect.soft(errorMessages).toContain(constants.contactPageFirstNameRequiredError);
      expect.soft(errorMessages).toContain(constants.contactPageLastNameRequiredError);
      expect.soft(errorMessages).toContain(constants.contactPageEmailRequiredError);
      expect.soft(errorMessages).toContain(constants.contactPageMessageRequiredError);
    });
  });

  test('submit with message field under minimum characters and verify error message', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const email = `${randomString(10)}@test.com`;
    const message = randomString(9);

    await test.step('populate all fields with valid data except message field which is under minimum characters, then submit form', async () => {
      await contactPage.insertTextIntoAllFields('Test', 'User', email, message);
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(400);
    });

    await test.step('verify error message is visible for message field', async () => {
      const errorMessages = await contactPage.getAllErrorMessagesText();
      expect.soft(errorMessages).toContain(constants.contactPageMessageRequiredError);
      expect.soft(errorMessages.length).toBe(1);
    });

    await test.step('verify no entry was saved to the database', async () => {
      const dbEntry = await runQuery(query, [email]);
      expect(dbEntry.length).toBe(0);
    });
  });
  
  test('above maximum characters for all fields and verify error messages', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const firstName = randomString(51);
    const lastName = randomString(51);
    const email = `${randomString(245)}@${randomString(5)}.com`;
    const message = randomString(2001);
    const company = randomString(101);

    await test.step('populate all fields with above maximum allowed characters and submit form', async () => {
      await contactPage.insertTextIntoAllFields(firstName, lastName, email, message, company);
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(400);
    });

    await test.step('verify error messages are visible for all fields that exceed maximum characters', async () => {
      const errorMessages = await contactPage.getAllErrorMessagesText();
      expect.soft(errorMessages).toContain(constants.contactPageFirstNameMaxLengthError);
      expect.soft(errorMessages).toContain(constants.contactPageLastNameMaxLengthError);
      expect.soft(errorMessages).toContain(constants.contactPageEmailMaxLengthError);
      expect.soft(errorMessages).toContain(constants.contactPageMessageMaxLengthError);
      expect.soft(errorMessages).toContain(constants.contactPageCompanyMaxLengthError);
      expect.soft(errorMessages.length).toBe(5);
    });

    await test.step('verify no entry was saved to the database', async () => {
      const dbEntry = await runQuery(query, [email]);
      expect(dbEntry.length).toBe(0);
    });
  });

  test('invalid email format and verify error message', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const invalidEmails = ['invalidEmailFormat', 'test@domain', 'test@.com', 'test.domain.com',
      'test@@domain.com', '.test@domain.com', 'test..email@domain.com', 'test@domain..com',
      'test @domain.com', 'test@dom ain.com', 'test@domain.123', 'test@-domain.com',
      'test@domain.c', '@domain.com', 'test@domain'];

    for (const invalidEmail of invalidEmails) {
      await test.step(`populate email field with invalid email: ${invalidEmail} and submit form`, async () => {
        await contactPage.insertTextIntoAllFields('Test', 'User', invalidEmail, 'This is a test message');
        const response = await contactPage.clickSendMessageAndWaitForResponse();
        expect(response.status()).toBe(400);

        expect.soft(await contactPage.getErrorMessageByLocator(contactPage.errorMessageForEmail)).toContain(constants.contactPageInvalidEmailError);
        const errorMessages = await contactPage.getAllErrorMessagesText();
        expect.soft(errorMessages.length).toBe(1);
      });
    }
  });
});

test.describe('500 error handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('displays failed to send email error message on Resend failure', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.route('**/api/contact', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to send email' }),
    }));

    await test.step('populate all fields with valid data and submit form', async () => {
      await contactPage.insertTextIntoAllFields('Test', 'User', 'test@example.com', 'This is a test message');
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(500);
    });

    await test.step('verify failed to send email error message is displayed', async () => {
      const errorMessages = await contactPage.getAllErrorMessagesText();
      expect.soft(errorMessages).toContain(constants.contactPageEmailSendError);
      expect.soft(errorMessages.length).toBe(1);
    });
  });

  test('displays generic error message on unhandled server exception', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.route('**/api/contact', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    }));

    await test.step('populate all fields with valid data and submit form', async () => {
      await contactPage.insertTextIntoAllFields('Test', 'User', 'test@example.com', 'This is a test message');
      const response = await contactPage.clickSendMessageAndWaitForResponse();
      expect(response.status()).toBe(500);
    });

    await test.step('verify generic error message is displayed', async () => {
      const errorMessages = await contactPage.getAllErrorMessagesText();
      expect.soft(errorMessages).toContain(constants.contactPageGenericError);
      expect.soft(errorMessages.length).toBe(1);
    });
  });
});