import { type Locator } from '@playwright/test';
import { PortSelectionPage } from './basePage';

/**
 * Select the trip's departure port.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class DeparturePortPage extends PortSelectionPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Select the port you left from' });
}
