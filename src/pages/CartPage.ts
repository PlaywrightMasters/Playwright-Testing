import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/price';
import { BasePage } from './BasePage';

export interface CartLine {
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export class CartPage extends BasePage {
  readonly table: Locator;
  readonly rows: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly checkoutModal: Locator;
  readonly checkoutModalLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('#cart_info_table');
    this.rows = this.table.locator('tbody tr[id^="product-"]');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
    this.checkoutModal = page.locator('#checkoutModal');
    this.checkoutModalLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
  }

  async open(): Promise<void> {
    await this.visit('/view_cart');
  }

  row(productId: number): Locator {
    return this.table.locator(`#product-${productId}`);
  }

  async line(productId: number): Promise<CartLine> {
    const row = this.row(productId);
    const [name, category, price, quantity, total] = await Promise.all([
      row.locator('.cart_description h4').innerText(),
      row.locator('.cart_description p').innerText(),
      row.locator('.cart_price').innerText(),
      row.locator('.cart_quantity').innerText(),
      row.locator('.cart_total').innerText(),
    ]);
    return {
      name: name.trim(),
      category: category.trim(),
      unitPrice: parsePrice(price),
      quantity: Number(quantity.trim()),
      total: parsePrice(total),
    };
  }

  async productIds(): Promise<number[]> {
    const ids = await this.rows.evaluateAll((rows) => rows.map((row) => row.id));
    return ids.map((id) => Number(id.replace('product-', '')));
  }

  async removeProduct(productId: number): Promise<void> {
    await this.row(productId).locator('.cart_quantity_delete').click();
    await expect(this.row(productId)).toHaveCount(0);
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }
}
