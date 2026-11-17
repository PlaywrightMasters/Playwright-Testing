import { productById } from '../../src/api/StoreApiClient';
import { expect, test } from '../../src/fixtures/test';
import { parsePrice } from '../../src/utils/price';
import cartItems from '../../test-data/cart-items.json';

test.describe('Shopping cart', () => {
  test('adds a product from the home page and shows it in the cart @smoke', async ({ page, homePage, cartPage, storeApi }) => {
    const product = await storeApi.findProduct(1);

    await homePage.open();
    const addRequest = page.waitForResponse((response) => response.url().includes(`/add_to_cart/${product.id}`));
    await homePage.grid.addToCart(product.id);
    expect((await addRequest).ok()).toBe(true);

    await homePage.cartModal.expectProductAdded();
    await homePage.cartModal.viewCart();

    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.row(product.id)).toContainText(product.name);
  });

  test('keeps unit price, quantity and line total consistent for several products', async ({
    productDetailsPage,
    cartPage,
    storeApi,
  }) => {
    const catalogue = await storeApi.listProducts();

    for (const { productId, quantity } of cartItems) {
      await productDetailsPage.open(productId);
      await productDetailsPage.addToCart(quantity);
      await productDetailsPage.cartModal.expectProductAdded();
      await productDetailsPage.cartModal.continueShopping();
    }

    await cartPage.open();
    expect((await cartPage.productIds()).toSorted((a, b) => a - b)).toEqual(
      cartItems.map((item) => item.productId).toSorted((a, b) => a - b),
    );

    for (const { productId, quantity } of cartItems) {
      const product = productById(catalogue, productId);
      const unitPrice = parsePrice(product.price);

      expect(await cartPage.line(productId)).toEqual({
        name: product.name,
        category: `${product.category.usertype.usertype} > ${product.category.category}`,
        unitPrice,
        quantity,
        total: unitPrice * quantity,
      });
    }
  });

  test('removes the last product and shows the empty-cart message', async ({ productDetailsPage, cartPage }) => {
    await productDetailsPage.open(2);
    await productDetailsPage.addToCart();
    await productDetailsPage.cartModal.expectProductAdded();

    await cartPage.open();
    await cartPage.removeProduct(2);

    await expect(cartPage.emptyCartMessage).toContainText('Cart is empty!');
    await expect(cartPage.rows).toHaveCount(0);
  });

  test('asks guests to register or log in before checkout', async ({ page, productDetailsPage, cartPage }) => {
    await productDetailsPage.open(1);
    await productDetailsPage.addToCart();
    await productDetailsPage.cartModal.expectProductAdded();

    await cartPage.open();
    await cartPage.proceedToCheckout();

    await expect(cartPage.checkoutModal).toBeVisible();
    await expect(cartPage.checkoutModal).toContainText('Register / Login account to proceed on checkout.');
    await cartPage.checkoutModalLoginLink.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
