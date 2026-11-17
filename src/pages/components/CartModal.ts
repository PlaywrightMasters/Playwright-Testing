import { expect, type Locator, type Page } from '@playwright/test';

/** "Added!" confirmation shown after a successful add-to-cart request. */
export class CartModal {
  readonly root: Locator;
  readonly title: Locator;
  readonly viewCartLink: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
    this.title = this.root.locator('.modal-title');
    this.viewCartLink = this.root.getByRole('link', { name: 'View Cart' });
    this.continueShoppingButton = this.root.getByRole('button', { name: 'Continue Shopping' });
  }

  async expectProductAdded(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Added!');
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.root).toBeHidden();
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
  }
}
