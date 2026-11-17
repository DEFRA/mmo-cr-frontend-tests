import { type Locator } from '@playwright/test';
import { DateInputPage } from './basePage';

/**
 * Enter the date the fishing trip started.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class TripDepartureDatePage extends DateInputPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which date did you set off on your trip?' });
}
