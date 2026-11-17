import { faker } from '@faker-js/faker';
import { COUNTRIES, type PaymentCard, type TestUser } from './types';

/** Unique per call, so parallel runs and retries never collide on the shared store. */
export function uniqueEmail(prefix = 'qa'): string {
  const suffix = faker.string.alphanumeric({ length: 6, casing: 'lower' });
  return `${prefix}.${Date.now()}.${suffix}@example.com`;
}

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const birth = faker.date.birthdate({ mode: 'age', min: 18, max: 70 });

  return {
    title: faker.helpers.arrayElement(['Mr', 'Mrs'] as const),
    name: `${firstName} ${lastName}`,
    email: uniqueEmail(),
    password: faker.internet.password({ length: 14 }),
    birthDate: { day: birth.getDate(), month: birth.getMonth() + 1, year: birth.getFullYear() },
    firstName,
    lastName,
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: faker.helpers.arrayElement(COUNTRIES),
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('######'),
    mobileNumber: faker.string.numeric(10),
    ...overrides,
  };
}

/** Test card details; the demo store accepts any well-formed values and charges nothing. */
export function buildPaymentCard(user: Pick<TestUser, 'firstName' | 'lastName'>): PaymentCard {
  return {
    nameOnCard: `${user.firstName} ${user.lastName}`,
    number: '4111111111111111',
    cvc: faker.string.numeric(3),
    expiryMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0'),
    expiryYear: String(new Date().getFullYear() + 3),
  };
}
