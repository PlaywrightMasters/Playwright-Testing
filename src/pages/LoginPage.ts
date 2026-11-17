import type { Locator, Page } from '@playwright/test';
import type { Credentials, TestUser } from '../data/types';
import { BasePage } from './BasePage';

/** `/login` holds two forms: log in for existing users, and the first signup step. */
export class LoginPage extends BasePage {
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;
  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly signupButton: Locator;
  readonly signupError: Locator;

  constructor(page: Page) {
    super(page);
    const loginForm = page.locator('.login-form');
    this.loginEmail = loginForm.locator('[data-qa="login-email"]');
    this.loginPassword = loginForm.locator('[data-qa="login-password"]');
    this.loginButton = loginForm.locator('[data-qa="login-button"]');
    this.loginError = loginForm.getByText('Your email or password is incorrect!');

    const signupForm = page.locator('.signup-form');
    this.signupName = signupForm.locator('[data-qa="signup-name"]');
    this.signupEmail = signupForm.locator('[data-qa="signup-email"]');
    this.signupButton = signupForm.locator('[data-qa="signup-button"]');
    this.signupError = signupForm.getByText('Email Address already exist!');
  }

  async open(): Promise<void> {
    await this.visit('/login');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.loginEmail.fill(credentials.email);
    await this.loginPassword.fill(credentials.password);
    await this.loginButton.click();
  }

  async startSignup(user: Pick<TestUser, 'name' | 'email'>): Promise<void> {
    await this.signupName.fill(user.name);
    await this.signupEmail.fill(user.email);
    await this.signupButton.click();
  }
}
