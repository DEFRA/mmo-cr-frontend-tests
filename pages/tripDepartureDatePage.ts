import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class TripDepartureDatePage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which date did you set off on your trip?' });

  public readonly dayInput = (): Locator => this.page.getByLabel('Day');
  public readonly monthInput = (): Locator => this.page.getByLabel('Month');
  public readonly yearInput = (): Locator => this.page.getByLabel('Year');

  async enterDate(day: string, month: string, year: string) {
    await this.dayInput().fill(day);
    await this.monthInput().fill(month);
    await this.yearInput().fill(year);
  }
}
