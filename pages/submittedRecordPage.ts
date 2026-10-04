import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class SubmittedRecordPage extends BasePage {
  // Uses a regex because the vessel name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /Catch record for .*/ });

  public readonly recordReference = (): Locator => this.page.getByTestId('app-record-reference');

  public readonly recordStatus = (): Locator => this.page.locator('.govuk-tag');

  public readonly summaryRow = (key: string): Locator =>
    this.page.locator('.govuk-summary-list__row').filter({
      has: this.page.locator('.govuk-summary-list__key', { hasText: key })
    });

  public readonly summaryValue = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__value');

  public readonly editCatchRecordButton = (): Locator => this.page.getByRole('button', { name: 'Edit catch record' });

  public readonly downloadPdfButton = (): Locator => this.page.getByRole('button', { name: 'Download PDF' });

  async getRecordReferenceText(): Promise<string> {
    const text = await this.recordReference().textContent();
    return text ? text.trim() : '';
  }

  async getRecordStatusText(): Promise<string> {
    const text = await this.recordStatus().textContent();
    return text ? text.trim() : '';
  }

  async getSummaryValueText(key: string): Promise<string> {
    const text = await this.summaryValue(key).textContent();
    return text ? text.trim() : '';
  }

  async clickEditCatchRecord() {
    await this.editCatchRecordButton().click();
  }

  async clickDownloadPdf() {
    await this.downloadPdfButton().click();
  }
}
