import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public readonly header = {
    govukHeader: (): Locator => this.page.locator('.govuk-header.app-header'),
    serviceNavigation: (): Locator => this.page.getByRole('region', { name: 'Service information' })
  };

  public readonly common = {
    backLink: (): Locator => this.page.getByTestId('app-page-navigation-back-link'),
    saveAndContinueButton: (): Locator => this.page.getByRole('button', { name: 'Save and continue' }),
    phaseBanner: (): Locator => this.page.locator('.govuk-phase-banner'),
    workflowPageCaption: (): Locator => this.page.locator('.govuk-caption-l').filter({ hasText: 'New catch record' }),
    languageEnglish: (): Locator => this.page.getByTestId('app-page-navigation-language-current'),
    languageCymraeg: (): Locator => this.page.getByTestId('app-page-navigation-language-link')
  };

  public readonly footer = {
    footerMeta: (): Locator => this.page.locator('.govuk-footer__meta'),
    licenceLink: (): Locator => this.page.getByRole('link', { name: 'Open Government Licence v3.0' }),
    copyrightLink: (): Locator => this.page.getByRole('link', { name: 'Crown copyright' }),
    feedbackLink: (): Locator => this.page.getByRole('link', { name: 'Feedback' }),
    privacyPolicyLink: (): Locator => this.page.getByRole('link', { name: 'Privacy policy' }),
    accessibilityStatementLink: (): Locator => this.page.getByRole('link', { name: 'Accessibility Statement' })
  };
  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async acceptCookies() {
    const acceptButton = this.page.getByRole('button', { name: 'Accept additional cookies' });
    try {
      await acceptButton.click({ timeout: 3000 });
    } catch {}
  }

  async clickSaveAndContinue() {
    await this.common.saveAndContinueButton().click();
  }

  async expectTitle(title: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveTitle(title);
  }

  async expectUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }
}

export abstract class DateInputPage extends BasePage {
  public readonly dayInput = (): Locator => this.page.getByLabel('Day');
  public readonly monthInput = (): Locator => this.page.getByLabel('Month');
  public readonly yearInput = (): Locator => this.page.getByLabel('Year');

  async enterDate(day: string, month: string, year: string) {
    await this.dayInput().fill(day);
    await this.monthInput().fill(month);
    await this.yearInput().fill(year);
  }
}

export abstract class PortSelectionPage extends BasePage {
  public readonly portRadio = (portName: string): Locator => this.page.getByLabel(portName);
  public readonly addPortButton = (): Locator => this.page.getByRole('button', { name: 'Add port' });

  async selectPort(portName: string) {
    await this.portRadio(portName).click();
  }

  async clickAddPort() {
    await this.addPortButton().click();
  }
}
