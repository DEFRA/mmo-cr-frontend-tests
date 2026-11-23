import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export const recordReferencePattern = /GBR-[A-Z0-9]+-\d{6}-\d{6}/;

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

  async getRecordReference(): Promise<string> {
    const reference = (await this.pageHeading().innerText()).match(recordReferencePattern)?.[0];
    if (!reference) throw new Error('The trip date heading did not include a catch record reference');
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
