export type Title = 'Mr' | 'Mrs';

/** Countries offered by the store's signup form. */
export const COUNTRIES = [
  'India',
  'United States',
  'Canada',
  'Australia',
  'Israel',
  'New Zealand',
  'Singapore',
] as const;
export type Country = (typeof COUNTRIES)[number];

export interface Credentials {
  email: string;
  password: string;
}

export interface TestUser extends Credentials {
  title: Title;
  /** Display name shown in the header as "Logged in as <name>". */
  name: string;
  birthDate: { day: number; month: number; year: number };
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: Country;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export interface PaymentCard {
  nameOnCard: string;
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}
