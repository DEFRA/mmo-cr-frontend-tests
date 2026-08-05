import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(SpecificUrl: string) {
    await this.page.goto(SpecificUrl);
  }

  async acceptCookies() {
    const acceptButton = this.page.getByRole('button', { name: 'Accept additional cookies' });
    try {
      await acceptButton.click({ timeout: 3000 });
    } catch {}
  }

  async expectTitle(title: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveTitle(title);
  }

  async expectUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }
}
