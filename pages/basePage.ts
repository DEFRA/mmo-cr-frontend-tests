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
    try {
      await this.page.goto(url, { waitUntil: 'load' });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw error;
      }

      await this.page.waitForTimeout(10_000);
      await this.page.goto(url, { waitUntil: 'load' });
    }
  }

  async goBack() {
    await this.page.goBack();
  }

  async reload() {
    await this.page.reload();
  }

  async resizeViewportAndReload(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
    await this.page.reload();
  }

  public readonly htmlRoot = (): Locator => this.page.locator('html');

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async tabUntilFocused(target: Locator, maxTabs = 20) {
    for (let tab = 0; tab < maxTabs && !(await target.evaluate((el) => el === document.activeElement)); tab++) {
      await this.pressKey('Tab');
    }
    await expect(target).toBeFocused();
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

  async expectUrl(url: string | RegExp) {
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
