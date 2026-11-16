import { type Locator } from '@playwright/test';
import { DateInputPage } from './basePage';

/**
 * Enter the date the fishing trip returned.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class TripReturnDatePage extends DateInputPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which date did you return from your trip?' });
}
