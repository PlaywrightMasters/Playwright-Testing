import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Confirmation pages shown after creating (`/account_created`) or deleting (`/delete_account`) an account. */
export class AccountStatusPage extends BasePage {
  readonly accountCreated: Locator;
  readonly accountDeleted: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountCreated = page.locator('[data-qa="account-created"]');
    this.accountDeleted = page.locator('[data-qa="account-deleted"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
}
