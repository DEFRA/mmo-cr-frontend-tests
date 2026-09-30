import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class RecordsPage extends BasePage {
  public readonly pageTitle = (): Locator => this.page.getByTestId('app-heading-title');
  public readonly pageCaption = (): Locator => this.page.getByTestId('app-heading-caption');

  public readonly notificationBanner = (): Locator => this.page.locator('.govuk-notification-banner');
  public readonly phaseBanner = (): Locator => this.page.locator('.govuk-phase-banner');

  public readonly topMenu = {
    home: (): Locator => this.page.getByRole('link', { name: 'Home' }),
    yourAccount: (): Locator => this.page.getByRole('link', { name: 'Your account' }),
    signOutButton: (): Locator => this.page.getByRole('button', { name: 'Sign out' }),
  };

  public readonly recordsTable = (): Locator => this.page.getByTestId('app-records-table');
  public readonly recordsRows = (): Locator => this.page.getByTestId('app-records-row');
  public readonly recordsResultsText = (): Locator => this.page.getByTestId('app-records-results');

  public readonly pagination = (): Locator => this.page.locator('.govuk-pagination');

  public readonly createNewRecordButton = (): Locator =>
    this.page.getByRole('button', { name: 'Create a new catch record' });

  public readonly howToRecordDetails = (): Locator => this.page.locator('.govuk-details');
  public readonly howToRecordSummary = (): Locator => this.page.locator('.govuk-details__summary-text');
}
