import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Confirm whether the trip started and finished today.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class TripDatePage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Did your trip start and finish today?' });

  public readonly yesRadio = (): Locator => this.page.getByLabel('Yes');
  public readonly noRadio = (): Locator => this.page.getByLabel('No');

  // The record reference (e.g. GBR-PH1234-171126-145204) is shown in the heading once a vessel is selected
  private readonly recordReferencePattern = /GBR-[A-Z0-9]+-\d{6}-\d{6}/;

  async getRecordReference(): Promise<string> {
    const headingText = (await this.pageHeading().textContent()) ?? '';
    const reference = headingText.match(this.recordReferencePattern)?.[0];
    if (!reference) {
      throw new Error(`No catch record reference found in the trip date heading: "${headingText.trim()}"`);
    }
    return reference;
  }

  async selectSameDate(isSameDate: boolean) {
    if (isSameDate) {
      await this.yesRadio().click();
    } else {
      await this.noRadio().click();
    }
  }
}
