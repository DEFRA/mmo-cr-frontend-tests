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

  public readonly vesselRadio = (vesselName: string): Locator =>
    this.page.getByRole('radio', { name: vesselName, exact: true });

  async selectVessel(vesselName: string) {
    await this.vesselRadio(vesselName).check();
  }
}
