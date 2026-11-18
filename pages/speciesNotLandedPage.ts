import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Record species that will not be landed straight away.
 * Select the species kept onboard or in keep pots and enter the weight kept back.
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
export class SpeciesNotLandedPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Which species from this trip are you not landing straight away?' });

  public readonly speciesCheckbox = (speciesName: string): Locator =>
    this.page.getByRole('checkbox', { name: speciesName, exact: true });

  // Revealed when a species is selected; current scenarios select a single species
  public readonly weightKeptOnboardInput = (): Locator =>
    this.page.getByRole('textbox', { name: 'Weight above minimum size kept onboard or in keep pots (kg)' });

  async selectSpecies(speciesName: string) {
    await this.speciesCheckbox(speciesName).check();
  }

  async enterWeightKeptOnboard(weight: string) {
    await this.weightKeptOnboardInput().fill(weight);
  }
}
