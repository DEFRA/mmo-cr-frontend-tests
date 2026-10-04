import { type Locator } from '@playwright/test';
import { DateInputPage } from './basePage';

export class TripReturnDatePage extends DateInputPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which date did you return from your trip?' });
}
