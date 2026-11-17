import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';
import { ProductGrid } from './components/ProductGrid';

export class HomePage extends BasePage {
  readonly grid: ProductGrid;
  readonly cartModal: CartModal;

  constructor(page: Page) {
    super(page);
    this.grid = new ProductGrid(page);
    this.cartModal = new CartModal(page);
  }

  async open(): Promise<void> {
    await this.visit('/');
  }
}
