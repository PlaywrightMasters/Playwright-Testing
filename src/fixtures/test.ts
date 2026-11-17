import { test as base } from '@playwright/test';
import { StoreApiClient } from '../api/StoreApiClient';
import { buildUser } from '../data/factories';
import type { TestUser } from '../data/types';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SignupPage } from '../pages/SignupPage';
import { blockAdsAndTrackers } from '../utils/network';

interface StoreFixtures {
  storeApi: StoreApiClient;
  /** Fresh, unregistered user data. Any account created with it is deleted after the test. */
  newUser: TestUser;
  /** User registered through the API before the test and deleted after it. */
  registeredUser: TestUser;

  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
}

async function cleanUpAccount(storeApi: StoreApiClient, user: TestUser): Promise<void> {
  try {
    await storeApi.deleteAccountIfExists(user);
  } catch (error) {
    // Cleanup must not hide the test's own result, but a leaked account should be visible in the report.
    base.info().annotations.push({ type: 'cleanup-failed', description: `${user.email}: ${String(error)}` });
  }
}

export const test = base.extend<StoreFixtures>({
  // Every browser test runs without ads or trackers; API-only tests never start a browser.
  context: async ({ context }, use) => {
    await blockAdsAndTrackers(context);
    await use(context);
  },

  storeApi: async ({ request }, use) => {
    await use(new StoreApiClient(request));
  },

  newUser: async ({ storeApi }, use) => {
    const user = buildUser();
    await use(user);
    await cleanUpAccount(storeApi, user);
  },

  registeredUser: async ({ storeApi }, use) => {
    const user = buildUser();
    await storeApi.registerUser(user);
    await use(user);
    await cleanUpAccount(storeApi, user);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
});

export { expect } from '@playwright/test';
