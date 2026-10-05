import { type Locator } from '@playwright/test';
import { PortSelectionPage } from './basePage';

export class DeparturePortPage extends PortSelectionPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Select the port you left from' });
}
