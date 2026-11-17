import { expect, test } from '../../src/fixtures/test';
import { isBlockedHost } from '../../src/utils/network';

test.describe('Network interception', () => {
  test('sends the chosen quantity with the add-to-cart request', async ({ page, productDetailsPage }) => {
    await productDetailsPage.open(1);

    const addRequest = page.waitForRequest((request) => request.url().includes('/add_to_cart/1'));
    await productDetailsPage.addToCart(4);

    const request = await addRequest;
    expect(request.method()).toBe('GET');
    expect(new URL(request.url()).searchParams.get('quantity')).toBe('4');
    expect((await request.response())?.ok()).toBe(true);
    await productDetailsPage.cartModal.expectProductAdded();
  });

  test('shows no confirmation and keeps the cart empty when add-to-cart fails', async ({
    page,
    homePage,
    cartPage,
  }) => {
    // Simulate a backend outage for the cart endpoint only.
    await page.route('**/add_to_cart/**', (route) =>
      route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' }),
    );

    await homePage.open();
    const failedResponse = page.waitForResponse((response) => response.url().includes('/add_to_cart/'));
    await homePage.grid.addToCart(1);
    expect((await failedResponse).status()).toBe(500);

    await expect(homePage.cartModal.root).toBeHidden();

    await page.unroute('**/add_to_cart/**');
    await cartPage.open();
    await expect(cartPage.emptyCartMessage).toContainText('Cart is empty!');
  });

  test('keeps the store usable when third-party ads and trackers are blocked', async ({ page, homePage }) => {
    const reachedBlockedHosts: string[] = [];
    page.on('requestfinished', (request) => {
      const url = new URL(request.url());
      if (isBlockedHost(url)) {
        reachedBlockedHosts.push(url.hostname);
      }
    });

    await homePage.open();
    await expect(homePage.grid.cards.first()).toBeVisible();
    await homePage.grid.addToCart(1);
    await homePage.cartModal.expectProductAdded();

    expect(reachedBlockedHosts).toEqual([]);
  });
});
