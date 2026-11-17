import { expect, type Locator, type Page } from '@playwright/test';

/** Top navigation bar, present on every storefront page. */
export class Header {
  readonly loggedInAs: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly cartLink: Locator;
  readonly productsLink: Locator;

  constructor(page: Page) {
    const nav = page.locator('.shop-menu');
    this.loggedInAs = nav.locator('li', { hasText: 'Logged in as' });
    this.signupLoginLink = nav.getByRole('link', { name: 'Signup / Login' });
    this.logoutLink = nav.getByRole('link', { name: 'Logout' });
    this.deleteAccountLink = nav.getByRole('link', { name: 'Delete Account' });
    this.cartLink = nav.getByRole('link', { name: 'Cart' });
    this.productsLink = nav.getByRole('link', { name: 'Products' });
  }

  async expectLoggedInAs(name: string): Promise<void> {
    await expect(this.loggedInAs).toContainText(`Logged in as ${name}`);
    await expect(this.logoutLink).toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.signupLoginLink).toBeVisible();
    await expect(this.loggedInAs).toHaveCount(0);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }
}
