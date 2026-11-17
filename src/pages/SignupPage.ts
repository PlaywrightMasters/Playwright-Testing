import type { Locator, Page } from '@playwright/test';
import type { TestUser } from '../data/types';
import { BasePage } from './BasePage';

/** Second signup step (`/signup`), reached from {@link LoginPage.startSignup}. */
export class SignupPage extends BasePage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Enter Account Information' });
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
  }

  async fillAccountDetails(user: TestUser): Promise<void> {
    const qa = (id: string) => this.page.locator(`[data-qa="${id}"]`);

    await this.page.locator(user.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await qa('password').fill(user.password);
    await qa('days').selectOption(String(user.birthDate.day));
    await qa('months').selectOption(String(user.birthDate.month));
    await qa('years').selectOption(String(user.birthDate.year));
    await this.page.locator('#newsletter').check();
    await this.page.locator('#optin').check();
    await qa('first_name').fill(user.firstName);
    await qa('last_name').fill(user.lastName);
    await qa('company').fill(user.company);
    await qa('address').fill(user.address1);
    await qa('address2').fill(user.address2);
    await qa('country').selectOption(user.country);
    await qa('state').fill(user.state);
    await qa('city').fill(user.city);
    await qa('zipcode').fill(user.zipcode);
    await qa('mobile_number').fill(user.mobileNumber);
  }

  async createAccount(user: TestUser): Promise<void> {
    await this.fillAccountDetails(user);
    await this.createAccountButton.click();
  }
}
