import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';
import { ProductGrid } from './components/ProductGrid';

export class ProductsPage extends BasePage {
  readonly grid: ProductGrid;
  readonly cartModal: CartModal;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.grid = new ProductGrid(page);
    this.cartModal = new CartModal(page);
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
  }

  async open(): Promise<void> {
    await this.visit('/products');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForURL((url) => url.searchParams.get('search') === term);
  }
}
