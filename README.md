# 🛒 E-Commerce Test Automation Suite

[![E2E tests](https://github.com/PlaywrightMasters/Playwright-Testing/actions/workflows/e2e.yml/badge.svg)](https://github.com/PlaywrightMasters/Playwright-Testing/actions/workflows/e2e.yml)

End-to-end and API test automation for an online store, built with **Playwright** and **TypeScript**.
It targets the public practice store [automationexercise.com](https://automationexercise.com) and
covers the journeys a shopper depends on: signing up, logging in, finding products, managing the cart
and paying for an order.

## ✨ Highlights

| Area | What it does |
| --- | --- |
| **Page Object Model** | One class per page, plus shared components (`Header`, `ProductGrid`, `CartModal`). |
| **Custom fixtures** | Tests receive ready page objects, an API client and test users. They never wire objects up themselves. |
| **UI + API layers** | 16 API tests and 21 browser tests. The API also works as a *test oracle*, so UI prices, search results and product details are checked against it. |
| **Self-cleaning data** | Users are generated with Faker, created through the API when a test needs one, and **deleted after every test**, even a failing one. |
| **Data-driven** | Search terms and cart contents live in `test-data/*.json`. Each entry produces its own test. |
| **Network interception** | Asserts the add-to-cart AJAX request, simulates a backend 500 for the cart, and blocks ad and tracker hosts. |
| **Resilience** | Ads block clicks at random, so they're blocked. The store sometimes answers "queue full", so navigation and API calls back off and retry. |
| **Multi-environment** | `ENV=dev\|test` picks a config file, and `BASE_URL` overrides the target URL. |
| **Cross-browser** | Chromium by default, with Firefox and WebKit available on demand. |
| **Docker + CI** | Runs in the official Playwright image. GitHub Actions runs typecheck/lint, then the suite in Docker, and uploads the reports. |
| **Static checks** | Strict TypeScript, typed ESLint (`no-floating-promises` catches missing `await`s) and `eslint-plugin-playwright`. |

## 🧪 What is covered

| Suite | File | Scenarios |
| --- | --- | --- |
| Products API | `tests/api/products.api.spec.ts` | Catalogue shape and unique ids, brands match products, search per term, 400 for a missing parameter, 405 for unsupported methods |
| Account API | `tests/api/account.api.spec.ts` | Full lifecycle (create → verify → read → update → delete), duplicate email, wrong password, missing email, unknown email |
| Authentication | `tests/e2e/auth.spec.ts` | Signup form (checked against the backend), login/logout, account deletion, invalid logins, duplicate signup |
| Catalogue | `tests/e2e/products.spec.ts` | All products listed, product details equal API data, UI search results equal API search results |
| Cart | `tests/e2e/cart.spec.ts` | Add from home, quantity/price/total maths for several items, remove to empty, guest checkout prompt |
| Checkout | `tests/e2e/checkout.spec.ts` | Log in → cart → address and total review → payment → order confirmation → invoice download |
| Network | `tests/e2e/network.spec.ts` | Quantity sent in the request, failed cart request shows no confirmation, store works with ads blocked |

Tests tagged `@smoke` form a quick critical-path run.

## 📁 Project structure

```
├── config/environments.ts        # ENV → base URL
├── src/
│   ├── api/StoreApiClient.ts     # typed client for the store API, with overload retry
│   ├── data/                     # TestUser types and Faker factories
│   ├── fixtures/test.ts          # custom `test`: page objects, API client, users, ad blocking
│   ├── pages/                    # page objects
│   │   └── components/           # Header, ProductGrid, CartModal
│   └── utils/                    # navigation retry, network blocking, price parsing
├── test-data/                    # data-driven inputs (JSON)
├── tests/
│   ├── api/                      # API tests (no browser)
│   └── e2e/                      # browser tests
├── playwright.config.ts
├── Dockerfile / docker-compose.yml
└── .github/workflows/e2e.yml
```

## 🚀 Getting started

Requirements: **Node.js 20.19+** (22 or 24 recommended).

```bash
git clone https://github.com/PlaywrightMasters/Playwright-Testing.git
cd Playwright-Testing
npm ci
npx playwright install --with-deps chromium
```

## ▶️ Running the tests

| Command | Runs |
| --- | --- |
| `npm test` | API and Chromium suites |
| `npm run test:api` | API tests only |
| `npm run test:e2e` | Browser tests in Chromium |
| `npm run test:smoke` | `@smoke` tests only |
| `npm run test:headed` | Chromium with a visible browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:cross-browser` | Chromium, Firefox and WebKit (run `npx playwright install firefox webkit` first) |
| `npm run report` | Open the last HTML report |
| `npm run check` | TypeScript typecheck and ESLint |

### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `ENV` | `dev` | Environment from `config/environments.ts` (`dev`, `test`) |
| `BASE_URL` | from `ENV` | Point the suite at another copy of the store |
| `WORKERS` | `1` | Parallel workers. Keep it low on the shared public site. |
| `CI` | unset | Enables CI behaviour: 2 retries, JUnit output, no `test.only` |

PowerShell example: `$env:ENV = "test"; npm test`. Bash: `ENV=test npm test`.

## 🐳 Running with Docker

```bash
docker compose build
docker compose run --rm tests
```

The HTML report lands in `./playwright-report`, and traces, screenshots, videos and `junit.xml` land in
`./test-results`. On Linux, create both folders with write access before the first run, because the
container runs as an unprivileged user.

## 🔁 Continuous integration

`.github/workflows/e2e.yml` runs on every push and pull request to `main`:

1. **Typecheck and lint** on Node 22.
2. **API and Chromium tests** inside the Docker image.
3. Uploads `playwright-report` and `test-results` as build artifacts, kept for 30 days.

## ✍️ Writing a new test

Import `test` and `expect` from the custom fixtures and ask for what you need:

```ts
import { expect, test } from '../../src/fixtures/test';

test('shows the cart total for a logged-in shopper', async ({ loginPage, productDetailsPage, cartPage, registeredUser }) => {
  await loginPage.open();
  await loginPage.login(registeredUser); // created via the API, deleted after the test

  await productDetailsPage.open(1);
  await productDetailsPage.addToCart(2);
  await productDetailsPage.cartModal.expectProductAdded();

  await cartPage.open();
  expect((await cartPage.line(1)).quantity).toBe(2);
});
```

Guidelines:

- Keep selectors inside page objects, and prefer `data-qa` attributes and roles.
- Use `registeredUser` when a test needs an existing account, and `newUser` when the test creates one.
- Check UI data against `storeApi` instead of hard-coding catalogue values.
- Never use fixed sleeps. Wait for a locator, URL, request or response instead.

## ⚠️ About the target site

automationexercise.com is a free, shared practice site. The suite runs with one worker by default,
blocks ads, and deletes every account it creates. Its occasional "queue full" responses are retried
automatically. If a run still fails on that page, the site was overloaded, which isn't a defect in
the tests.
