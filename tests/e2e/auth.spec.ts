import { uniqueEmail } from '../../src/data/factories';
import type { Credentials, TestUser } from '../../src/data/types';
import { expect, test } from '../../src/fixtures/test';

test.describe('Authentication', () => {
  test('registers a new account through the signup form @smoke', async ({
    loginPage,
    signupPage,
    accountStatusPage,
    storeApi,
    newUser,
  }) => {
    await loginPage.open();
    await loginPage.startSignup(newUser);

    await expect(signupPage.heading).toBeVisible();
    await expect(signupPage.nameInput).toHaveValue(newUser.name);
    await expect(signupPage.emailInput).toHaveValue(newUser.email);

    await signupPage.createAccount(newUser);
    await expect(accountStatusPage.accountCreated).toHaveText('Account Created!', { ignoreCase: true });

    await accountStatusPage.continue();
    await accountStatusPage.header.expectLoggedInAs(newUser.name);

    // The backend stored what the form submitted.
    const stored = await storeApi.getUserDetailByEmail(newUser.email);
    expect(stored.user).toMatchObject({
      email: newUser.email,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      country: newUser.country,
      city: newUser.city,
      zipcode: newUser.zipcode,
    });
  });

  test('logs in and out with an existing account @smoke', async ({ page, loginPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.login(registeredUser);
    await loginPage.header.expectLoggedInAs(registeredUser.name);

    await loginPage.header.logout();
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.header.expectLoggedOut();
  });

  test('deletes the signed-in account', async ({ loginPage, accountStatusPage, storeApi, registeredUser }) => {
    await loginPage.open();
    await loginPage.login(registeredUser);
    await loginPage.header.expectLoggedInAs(registeredUser.name);

    await loginPage.header.deleteAccount();
    await expect(accountStatusPage.accountDeleted).toHaveText('Account Deleted!', { ignoreCase: true });
    await accountStatusPage.continue();
    await accountStatusPage.header.expectLoggedOut();

    expect(await storeApi.verifyLogin(registeredUser)).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  const invalidLogins: { title: string; credentials: (user: TestUser) => Credentials }[] = [
    { title: 'a wrong password', credentials: (user) => ({ email: user.email, password: `${user.password}-wrong` }) },
    { title: 'an unregistered email', credentials: (user) => ({ email: uniqueEmail('unknown'), password: user.password }) },
  ];

  for (const { title, credentials } of invalidLogins) {
    test(`rejects login with ${title}`, async ({ loginPage, registeredUser }) => {
      await loginPage.open();
      await loginPage.login(credentials(registeredUser));

      await expect(loginPage.loginError).toBeVisible();
      await loginPage.header.expectLoggedOut();
    });
  }

  test('blocks signup with an email that is already registered', async ({ page, loginPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.startSignup({ name: 'Duplicate Shopper', email: registeredUser.email });

    await expect(loginPage.signupError).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
