import type { Locator, Page } from '@playwright/test';

/** Product listing used by the home page and the products/search page. */
export class ProductGrid {
  readonly root: Locator;
  readonly title: Locator;
  readonly cards: Locator;

  constructor(page: Page) {
    this.root = page.locator('.features_items');
    this.title = this.root.locator('h2.title');
    this.cards = this.root.locator('.product-image-wrapper');
  }

  card(productId: number): Locator {
    return this.cards.filter({ has: this.root.page().locator(`a[href="/product_details/${productId}"]`) });
  }

  /**
   * Hovering a card slides an overlay (500ms CSS transition) over the card's own
   * button. Clicking the static button races that animation, so act like a user:
   * hover, then click the overlay's button once it has settled.
   */
  async addToCart(productId: number): Promise<void> {
    const card = this.card(productId);
    await card.hover();
    await card.locator('.product-overlay a.add-to-cart').click();
  }

  async viewProduct(productId: number): Promise<void> {
    await this.root.locator(`.choose a[href="/product_details/${productId}"]`).click();
  }

  /** Product ids in display order, read from each card's "View Product" link. */
  async productIds(): Promise<number[]> {
    const hrefs = await this.root
      .locator('.choose a[href^="/product_details/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    return hrefs.map((href) => Number(href.split('/').pop()));
  }
}
