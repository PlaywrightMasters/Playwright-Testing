import { uniqueEmail } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures/test';

test.describe('Account API', () => {
  test('account lifecycle: create, verify, read, update and delete @smoke', async ({ storeApi, newUser }) => {
    await test.step('create the account', async () => {
      expect(await storeApi.createAccount(newUser)).toEqual({ responseCode: 201, message: 'User created!' });
    });

    await test.step('verify the credentials', async () => {
      expect(await storeApi.verifyLogin(newUser)).toEqual({ responseCode: 200, message: 'User exists!' });
    });

    await test.step('read the stored profile', async () => {
      const response = await storeApi.getUserDetailByEmail(newUser.email);
      expect(response.responseCode).toBe(200);
      expect(response.user).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        title: newUser.title,
        birth_day: String(newUser.birthDate.day),
        birth_month: String(newUser.birthDate.month),
        birth_year: String(newUser.birthDate.year),
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        company: newUser.company,
        address1: newUser.address1,
        address2: newUser.address2,
        country: newUser.country,
        state: newUser.state,
        city: newUser.city,
        zipcode: newUser.zipcode,
      });
    });

    await test.step('update the address', async () => {
      const moved = { ...newUser, city: `${newUser.city} Heights`, zipcode: '000111' };
      expect(await storeApi.updateAccount(moved)).toEqual({ responseCode: 200, message: 'User updated!' });

      const response = await storeApi.getUserDetailByEmail(newUser.email);
      expect(response.user).toMatchObject({ city: moved.city, zipcode: moved.zipcode });
    });

    await test.step('delete the account', async () => {
      expect(await storeApi.deleteAccount(newUser)).toEqual({ responseCode: 200, message: 'Account deleted!' });
      expect(await storeApi.verifyLogin(newUser)).toEqual({ responseCode: 404, message: 'User not found!' });
    });
  });

  test('POST /api/createAccount rejects an email that is already registered', async ({ storeApi, registeredUser }) => {
    expect(await storeApi.createAccount(registeredUser)).toEqual({ responseCode: 400, message: 'Email already exists!' });
  });

  test('POST /api/verifyLogin rejects a wrong password', async ({ storeApi, registeredUser }) => {
    const response = await storeApi.verifyLogin({ email: registeredUser.email, password: `${registeredUser.password}-wrong` });
    expect(response).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('POST /api/verifyLogin without an email is a bad request', async ({ storeApi }) => {
    expect(await storeApi.verifyLogin({ password: 'irrelevant' })).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });

  test('DELETE /api/verifyLogin is rejected as unsupported', async ({ storeApi }) => {
    expect(await storeApi.send('DELETE', '/api/verifyLogin')).toEqual({
      responseCode: 405,
      message: 'This request method is not supported.',
    });
  });

  test('GET /api/getUserDetailByEmail reports an unknown email', async ({ storeApi }) => {
    expect(await storeApi.getUserDetailByEmail(uniqueEmail('missing'))).toEqual({
      responseCode: 404,
      message: 'Account not found with this email, try another email!',
    });
  });
});
