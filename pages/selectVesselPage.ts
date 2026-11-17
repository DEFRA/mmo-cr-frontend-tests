import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Select the vessel used for a catch record.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class SelectVesselPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'Which vessel did you use?' });
  // Allows selecting a specific vessel by its label text (e.g., 'OLGA')
  public readonly vesselRadio = (vesselName: string): Locator => this.page.getByLabel(vesselName);

  public readonly firstVesselRadio = (): Locator => this.page.getByRole('radio').first();
}
