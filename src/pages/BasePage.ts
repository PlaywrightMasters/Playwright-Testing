import type { Page } from '@playwright/test';
import { gotoStorePage } from '../utils/navigation';
import { Header } from './components/Header';

export abstract class BasePage {
  readonly header: Header;

  constructor(protected readonly page: Page) {
    this.header = new Header(page);
  }

  protected async visit(path: string): Promise<void> {
    await gotoStorePage(this.page, path);
  }
}
