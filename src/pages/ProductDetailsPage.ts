import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';

export class ProductDetailsPage extends BasePage {
  readonly name: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: CartModal;

  constructor(page: Page) {
    super(page);
    const info = page.locator('.product-information');
    this.name = info.locator('h2');
    this.category = info.locator('p', { hasText: 'Category:' });
    this.price = info.locator('span > span');
    this.availability = info.locator('p', { hasText: 'Availability:' });
    this.condition = info.locator('p', { hasText: 'Condition:' });
    this.brand = info.locator('p', { hasText: 'Brand:' });
    this.quantityInput = info.locator('#quantity');
    this.addToCartButton = info.getByRole('button', { name: 'Add to cart' });
    this.cartModal = new CartModal(page);
  }

  async open(productId: number): Promise<void> {
    await this.visit(`/product_details/${productId}`);
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await this.addToCartButton.click();
  }
}
