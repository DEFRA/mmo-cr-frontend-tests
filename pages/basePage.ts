import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public readonly header = {
    govukHeader: (): Locator => this.page.locator('.govuk-header.app-header'),
    serviceNavigation: (): Locator => this.page.getByRole('region', { name: 'Service information' }),
  };
  public readonly footer = {
    footerMeta: (): Locator => this.page.locator('.govuk-footer__meta'),
    licenceLink: (): Locator => this.page.getByRole('link', { name: 'Open Government Licence v3.0' }),
    copyrightLink: (): Locator => this.page.getByRole('link', { name: 'Crown copyright' }),
    feedbackLink: (): Locator => this.page.getByRole('link', { name: 'Feedback' }),
    privacyPolicyLink: (): Locator => this.page.getByRole('link', { name: 'Privacy policy' }),
    accessibilityStatementLink: (): Locator => this.page.getByRole('link', { name: 'Accessibility Statement' }),
  };
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
