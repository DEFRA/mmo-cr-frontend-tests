import { type Locator } from '@playwright/test';
import { PortSelectionPage } from './basePage';

export class ReturnPortPage extends PortSelectionPage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Select the port you returned to' });
}
