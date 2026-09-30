import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class TripDatePage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Did your trip start and finish today?' });

  public readonly yesRadio = (): Locator => this.page.getByLabel('Yes');
  public readonly noRadio = (): Locator => this.page.getByLabel('No');

  async selectSameDate(isSameDate: boolean) {
    if (isSameDate) {
      await this.yesRadio().click();
    } else {
      await this.noRadio().click();
    }
  }
}
