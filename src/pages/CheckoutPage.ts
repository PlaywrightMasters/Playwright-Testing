import { expect, type Locator, type Page } from '@playwright/test';
import type { TestUser } from '../data/types';
import { BasePage } from './BasePage';

/** Address block lines exactly as the store renders them for a user. */
export function expectedAddressLines(user: TestUser): string[] {
  return [
    `${user.title}. ${user.firstName} ${user.lastName}`,
    user.company,
    user.address1,
    user.address2,
    `${user.city} ${user.state} ${user.zipcode}`,
    user.country,
    user.mobileNumber,
  ];
}

export class CheckoutPage extends BasePage {
  readonly deliveryAddress: Locator;
  readonly invoiceAddress: Locator;
  readonly orderTable: Locator;
  readonly totalAmount: Locator;
  readonly commentInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.invoiceAddress = page.locator('#address_invoice');
    this.orderTable = page.locator('#cart_info');
    this.totalAmount = this.orderTable.locator('tr', { hasText: 'Total Amount' }).locator('.cart_total_price');
    this.commentInput = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
  }

  async expectAddressesOf(user: TestUser): Promise<void> {
    const lines = expectedAddressLines(user);
    await expect(this.deliveryAddress.locator('li:not(.address_title)')).toHaveText(lines);
    await expect(this.invoiceAddress.locator('li:not(.address_title)')).toHaveText(lines);
  }

  async placeOrder(comment: string): Promise<void> {
    await this.commentInput.fill(comment);
    await this.placeOrderButton.click();
  }
}
