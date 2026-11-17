import { readFile } from 'node:fs/promises';
import { productById } from '../../src/api/StoreApiClient';
import { buildPaymentCard } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures/test';
import { parsePrice } from '../../src/utils/price';

const ORDER = [
  { productId: 1, quantity: 2 },
  { productId: 2, quantity: 1 },
];

test.describe('Checkout', () => {
  test('places an order end-to-end and downloads the invoice @smoke', async ({
    page,
    loginPage,
    productDetailsPage,
    cartPage,
    checkoutPage,
    paymentPage,
    storeApi,
    registeredUser,
  }) => {
    const catalogue = await storeApi.listProducts();
    const expectedTotal = ORDER.reduce(
      (sum, { productId, quantity }) => sum + parsePrice(productById(catalogue, productId).price) * quantity,
      0,
    );

    await test.step('log in', async () => {
      await loginPage.open();
      await loginPage.login(registeredUser);
      await loginPage.header.expectLoggedInAs(registeredUser.name);
    });

    await test.step('add products to the cart', async () => {
      for (const { productId, quantity } of ORDER) {
        await productDetailsPage.open(productId);
        await productDetailsPage.addToCart(quantity);
        await productDetailsPage.cartModal.expectProductAdded();
        await productDetailsPage.cartModal.continueShopping();
      }
    });

    await test.step('review the order', async () => {
      await cartPage.open();
      await expect(cartPage.rows).toHaveCount(ORDER.length);
      await cartPage.proceedToCheckout();

      await expect(page).toHaveURL(/\/checkout$/);
      await checkoutPage.expectAddressesOf(registeredUser);
      await expect(checkoutPage.totalAmount).toHaveText(`Rs. ${expectedTotal}`);
    });

    await test.step('pay', async () => {
      await checkoutPage.placeOrder('Please leave the parcel at the front desk.');
      await expect(page).toHaveURL(/\/payment$/);
      await paymentPage.pay(buildPaymentCard(registeredUser));

      await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });
      await expect(paymentPage.confirmationMessage).toBeVisible();
    });

    await test.step('download the invoice', async () => {
      const downloadEvent = page.waitForEvent('download');
      await paymentPage.downloadInvoiceLink.click();
      const invoice = await readFile(await (await downloadEvent).path(), 'utf8');

      expect(invoice).toContain(`${registeredUser.firstName} ${registeredUser.lastName}`);
      expect(invoice).toContain(String(expectedTotal));
    });
  });
});
