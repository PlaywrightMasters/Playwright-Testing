import type { APIRequestContext } from '@playwright/test';
import type { Credentials, TestUser } from '../data/types';
import { MAX_OVERLOAD_ATTEMPTS, OVERLOAD_MARKER, waitBeforeRetry } from '../utils/overload';

export interface Product {
  id: number;
  name: string;
  /** Formatted price, e.g. "Rs. 500". */
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface Brand {
  id: number;
  brand: string;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

/**
 * The store always answers HTTP 200 and reports the real outcome in
 * `responseCode`, alongside either a payload or a `message`.
 */
export interface StoreResponse {
  responseCode: number;
  message?: string;
  products?: Product[];
  brands?: Brand[];
  user?: UserDetails;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Form = Record<string, string>;

/** Thin client for https://automationexercise.com/api_list. */
export class StoreApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getAllProducts(): Promise<StoreResponse> {
    return this.send('GET', '/api/productsList');
  }

  getAllBrands(): Promise<StoreResponse> {
    return this.send('GET', '/api/brandsList');
  }

  /** Omit `term` to exercise the missing-parameter error. */
  searchProducts(term?: string): Promise<StoreResponse> {
    return this.send('POST', '/api/searchProduct', term === undefined ? undefined : { search_product: term });
  }

  verifyLogin(credentials: Partial<Credentials>): Promise<StoreResponse> {
    return this.send('POST', '/api/verifyLogin', definedOnly(credentials));
  }

  createAccount(user: TestUser): Promise<StoreResponse> {
    return this.send('POST', '/api/createAccount', toAccountForm(user));
  }

  updateAccount(user: TestUser): Promise<StoreResponse> {
    return this.send('PUT', '/api/updateAccount', toAccountForm(user));
  }

  deleteAccount(credentials: Credentials): Promise<StoreResponse> {
    return this.send('DELETE', '/api/deleteAccount', { email: credentials.email, password: credentials.password });
  }

  getUserDetailByEmail(email: string): Promise<StoreResponse> {
    return this.send('GET', '/api/getUserDetailByEmail', { email });
  }

  // ---- Strict helpers for tests that use the API as setup or as a test oracle ----

  async listProducts(): Promise<Product[]> {
    return requireField(await this.getAllProducts(), 'products', 'list products');
  }

  async findProducts(term: string): Promise<Product[]> {
    return requireField(await this.searchProducts(term), 'products', `search for "${term}"`);
  }

  async findProduct(id: number): Promise<Product> {
    return productById(await this.listProducts(), id);
  }

  async registerUser(user: TestUser): Promise<void> {
    const response = await this.createAccount(user);
    if (response.responseCode !== 201) {
      throw new Error(`Could not register ${user.email}: ${JSON.stringify(response)}`);
    }
  }

  /** Cleanup helper: treats an already-deleted account as success. */
  async deleteAccountIfExists(credentials: Credentials): Promise<StoreResponse> {
    const response = await this.deleteAccount(credentials);
    if (response.responseCode !== 200 && response.responseCode !== 404) {
      throw new Error(`Could not delete ${credentials.email}: ${JSON.stringify(response)}`);
    }
    return response;
  }

  /** Sends a request and parses the JSON body, retrying while the store is overloaded. */
  async send(method: HttpMethod, path: string, form?: Form): Promise<StoreResponse> {
    for (let attempt = 1; ; attempt++) {
      const response = await this.request.fetch(path, {
        method,
        ...(method === 'GET' ? { params: form } : { form }),
      });
      const body = await response.text();

      if (body.includes(OVERLOAD_MARKER)) {
        if (attempt >= MAX_OVERLOAD_ATTEMPTS) {
          throw new Error(`${method} ${path}: store still overloaded after ${attempt} attempts`);
        }
        // The overload page comes from the store's front proxy, so the request is
        // assumed not to have been processed. Should a retried create land twice,
        // registerUser() fails loudly on the duplicate-email response.
        await waitBeforeRetry(attempt);
        continue;
      }

      try {
        return JSON.parse(body) as StoreResponse;
      } catch {
        throw new Error(`${method} ${path} returned HTTP ${response.status()} with a non-JSON body: ${body.slice(0, 200)}`);
      }
    }
  }
}

function toAccountForm(user: TestUser): Form {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: user.title,
    birth_date: String(user.birthDate.day),
    birth_month: String(user.birthDate.month),
    birth_year: String(user.birthDate.year),
    firstname: user.firstName,
    lastname: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    zipcode: user.zipcode,
    state: user.state,
    city: user.city,
    mobile_number: user.mobileNumber,
  };
}

function definedOnly(values: Partial<Credentials>): Form {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export function productById(catalogue: Product[], id: number): Product {
  const product = catalogue.find((candidate) => candidate.id === id);
  if (!product) {
    throw new Error(`Product ${id} is not in the catalogue`);
  }
  return product;
}

function requireField<K extends 'products' | 'brands' | 'user'>(
  response: StoreResponse,
  field: K,
  action: string,
): NonNullable<StoreResponse[K]> {
  const value = response[field];
  if (response.responseCode !== 200 || value === undefined) {
    throw new Error(`Could not ${action}: ${JSON.stringify(response)}`);
  }
  return value;
}
