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
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Your catch records', exact: true });
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
  public readonly catchRecordsTable = (): Locator => this.page.getByRole('table', { name: 'Catch records' });
  public readonly draftRecordRows = (): Locator =>
    this.catchRecordsTable()
      .getByRole('row')
      .filter({ has: this.page.locator('.app-records-status', { hasText: /^\s*Draft\s*$/ }) });

  // Data rows contain cells; the header row only contains column headers
  public readonly recordRows = (): Locator =>
    this.catchRecordsTable()
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') });

  public readonly recordRow = (reference: string): Locator =>
    this.recordRows().filter({ has: this.page.getByRole('link', { name: reference, exact: true }) });

  public readonly recordStatuses = (): Locator => this.recordRows().locator('.app-records-status');

  public readonly recordStatus = (reference: string): Locator =>
    this.recordRow(reference).locator('.app-records-status');

  public readonly draftRecordLinks = (): Locator => this.draftRecordRows().getByRole('link');

  async openRecord(reference: string) {
    await this.recordRow(reference).getByRole('link', { name: reference, exact: true }).click();
  }

  async openFirstDraftRecord(): Promise<string> {
    const referenceLink = this.draftRecordRows().first().getByRole('link');
    const reference = (await referenceLink.innerText()).trim();
    await referenceLink.click();
    return reference;
  }

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
