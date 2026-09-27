import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {
  public readonly startNowButton = (): Locator => this.page.getByRole('button', { name: 'Start now' });
  public readonly privacyPolicyLink = (): Locator => this.page.getByRole('link', { name: 'Privacy policy' });

  public readonly guidanceContents = {
    whatWeNeedFromYouLink: (): Locator =>
      this.page.getByTestId('app-guidance-contents-link').filter({ hasText: 'What we need from you' }),
    whenToCreateYourRecordLink: (): Locator =>
      this.page.getByTestId('app-guidance-contents-link').filter({ hasText: 'When to create your record' }),
    specialCasesLink: (): Locator =>
      this.page.getByTestId('app-guidance-contents-link').filter({ hasText: 'Special cases' }),
    howToCreateARecordLink: (): Locator =>
      this.page.getByTestId('app-guidance-contents-link').filter({ hasText: 'How to create a record' }),
    getHelpLink: (): Locator => this.page.getByTestId('app-guidance-contents-link').filter({ hasText: 'Get help' }),
  };

  public readonly guidanceHeadings = {
    whatWeNeedFromYouHeading: (): Locator => this.page.locator('#what-we-need-from-you'),
    whenToCreateYourRecordHeading: (): Locator => this.page.locator('#when-to-create-your-record'),
    specialCasesHeading: (): Locator => this.page.locator('#special-cases-ices-areas'),
    howToCreateARecordHeading: (): Locator => this.page.locator('#how-to-create-a-record'),
    getHelpWithYourRecordHeading: (): Locator => this.page.locator('#get-help-with-your-record'),
  };
}
