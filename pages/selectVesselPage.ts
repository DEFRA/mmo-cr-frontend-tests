import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class SelectVesselPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'Select your vessel' });
  // Allows selecting a specific vessel by its label text (e.g., 'OLGA')
  public readonly vesselRadio = (vesselName: string): Locator => this.page.getByLabel(vesselName);
}
