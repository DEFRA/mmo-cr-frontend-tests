import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * View and manage catch records.
 * Display the records list, pagination and actions to create a new record.
 *
 * @author Randhir Patel
 * @since 2026-09-03
 */
export class RecordsPage extends BasePage {
  public readonly pageTitle = (): Locator => this.page.getByTestId('app-heading-title');
  public readonly pageCaption = (): Locator => this.page.getByTestId('app-heading-caption');

  public readonly notificationBanner = (): Locator => this.page.locator('.govuk-notification-banner');
  public readonly phaseBanner = (): Locator => this.page.locator('.govuk-phase-banner');

  public readonly topMenu = {
    home: (): Locator => this.page.getByRole('link', { name: 'Home' }),
    yourAccount: (): Locator => this.page.getByRole('link', { name: 'Your account' }),
    signOutButton: (): Locator => this.page.getByRole('button', { name: 'Sign out' })
  };

  public readonly recordsTable = (): Locator => this.page.getByTestId('app-records-table');
  public readonly recordsRows = (): Locator => this.page.getByTestId('app-records-row');
  public readonly recordsResultsText = (): Locator => this.page.getByTestId('app-records-results');

  public readonly recordRow = (reference: string): Locator =>
    this.recordsRows().filter({ has: this.page.getByRole('link', { name: reference, exact: true }) });

  public readonly recordStatusTag = (reference: string): Locator => this.recordRow(reference).locator('.govuk-tag');

  public readonly statusTags = (): Locator => this.recordsRows().locator('.govuk-tag');

  async getStatusTexts(): Promise<string[]> {
    const texts = await this.statusTags().allTextContents();
    return texts.map((text) => text.trim());
  }

  async getStatusTagCountsPerRow(): Promise<number[]> {
    const rows = await this.recordsRows().all();
    return Promise.all(rows.map((row) => row.locator('.govuk-tag').count()));
  }

  public readonly pagination = (): Locator => this.page.locator('.govuk-pagination');

  public readonly createNewRecordButton = (): Locator =>
    this.page.getByRole('button', { name: 'Create a new catch record' });

  public readonly howToRecordDetails = (): Locator => this.page.locator('.govuk-details');
  public readonly howToRecordSummary = (): Locator => this.page.locator('.govuk-details__summary-text');
}
