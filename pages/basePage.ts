import { errors, expect, type Locator, type Page } from '@playwright/test';

/**
 * Provide shared page-object functionality.
 * Includes common navigation, layout, date-input and port-selection helpers.
 *
 * @author Randhir Patel
 * @since 2026-08-27
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Must be unique to the page so expectOnPage() proves which page is shown
  public abstract readonly pageHeading: () => Locator;

  public readonly header = {
    govukHeader: (): Locator => this.page.locator('.govuk-header.app-header'),
    homeLink: (): Locator => this.page.getByRole('link', { name: 'Home', exact: true }),
    accountLink: (): Locator => this.page.getByRole('link', { name: 'Your account', exact: true }),
    serviceNavigation: (): Locator => this.page.getByRole('region', { name: 'Service information' }),
    // Shown on journey pages such as /select-vessel; not shown on /records or /check-answers (OQ-7)
    signOutButton: (): Locator =>
      this.page.getByRole('region', { name: 'Service information' }).getByRole('button', { name: 'Sign out' })
  };

  public readonly common = {
    backLink: (): Locator => this.page.getByTestId('app-page-navigation-back-link'),
    saveAndContinueButton: (): Locator => this.page.getByRole('button', { name: 'Save and continue' }),
    phaseBanner: (): Locator => this.page.locator('.govuk-phase-banner'),
    workflowPageCaption: (): Locator => this.page.locator('.govuk-caption-l').filter({ hasText: 'New catch record' }),
    languageEnglish: (): Locator => this.page.getByTestId('app-page-navigation-language-current'),
    languageCymraeg: (): Locator => this.page.getByTestId('app-page-navigation-language-link'),
    errorSummary: (): Locator => this.page.locator('.govuk-error-summary'),
    errorMessage: (): Locator => this.page.locator('.govuk-error-message')
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
    const maxAttempts = 4;
    for (let attempt = 1; ; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'load' });
        return;
      } catch (error) {
        // The test environment's DNS intermittently fails to resolve; retry with a growing back-off
        const isDnsFailure = error instanceof Error && error.message.includes('ERR_NAME_NOT_RESOLVED');
        if (!isDnsFailure || attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(attempt * 3_000);
      }
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
    const tabKey = this.page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';
    for (let tab = 0; tab < maxTabs && !(await target.evaluate((el) => el === document.activeElement)); tab++) {
      await this.pressKey(tabKey);
    }
    await expect(target, 'Target to be focused').toBeFocused();
  }

  async acceptCookies() {
    const acceptButton = this.page.getByRole('button', { name: 'Accept additional cookies' });
    try {
      await acceptButton.click({ timeout: 3000 });
    } catch (error) {
      // The banner is only shown on a first visit, so a timeout means there is nothing to accept
      if (!(error instanceof errors.TimeoutError)) {
        throw error;
      }
    }
  }

  async clickSaveAndContinue() {
    await this.common.saveAndContinueButton().click();
  }

  async expectTitle(title: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page, `Page to have title ${title}`).toHaveTitle(title);
  }

  async expectOnPage() {
    await expect(this.pageHeading(), `${this.constructor.name} heading to be visible`).toBeVisible();
  }

  async expectUrl(url: string | RegExp) {
    await expect(this.page, `Page to have url ${url}`).toHaveURL(url);
  }
}

export abstract class DateInputPage extends BasePage {
  public readonly dayInput = (): Locator => this.page.getByLabel('Day');
  public readonly monthInput = (): Locator => this.page.getByLabel('Month');
  public readonly yearInput = (): Locator => this.page.getByLabel('Year');
  public readonly errorSummary = (): Locator => this.page.getByRole('alert');
  public readonly errorSummaryLink = (): Locator => this.errorSummary().getByRole('link');

  async enterDate(day: string, month: string, year: string) {
    await this.dayInput().fill(day);
    await this.monthInput().fill(month);
    await this.yearInput().fill(year);
  }

  async enterDateFrom(date: Date) {
    await this.enterDate(String(date.getDate()), String(date.getMonth() + 1), String(date.getFullYear()));
  }
}

/**
 * Choose a saved port on the departure-port and return-port screens, or add another port.
 *
 * @author Randhir Patel
 * @since 2026-10-05
 */
export abstract class PortSelectionPage extends BasePage {
  public readonly portRadio = (portName: string): Locator => this.page.getByLabel(portName);
  public readonly portRadios = (): Locator => this.page.getByRole('radio');
  public readonly checkedPortRadios = (): Locator => this.page.getByRole('radio', { checked: true });
  public readonly addPortLink = (): Locator => this.page.getByRole('link', { name: 'Add port' });

  async selectPort(portName: string) {
    await this.portRadio(portName).click();
  }

  async clickAddPort() {
    await this.addPortLink().click();
  }

  // True when the top of the Add port link is at or below the bottom of the last port radio
  async isAddPortLinkBelowPortOptions(): Promise<boolean> {
    const lastPortRadioBox = await this.portRadios().last().boundingBox();
    const addPortLinkBox = await this.addPortLink().boundingBox();
    if (!lastPortRadioBox || !addPortLinkBox) return false;
    return addPortLinkBox.y >= lastPortRadioBox.y + lastPortRadioBox.height;
  }
}
