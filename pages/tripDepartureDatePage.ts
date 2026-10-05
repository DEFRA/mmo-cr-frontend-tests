import { type Locator } from '@playwright/test';
import { DateInputPage } from './basePage';

export class TripDepartureDatePage extends DateInputPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which date did you set off on your trip?' });
}
