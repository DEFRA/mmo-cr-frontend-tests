import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class SpeciesSelectionPage extends BasePage {
  // Uses a regex because the gear name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /What species did you catch using .*\?/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly weightAboveMinimumInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightAboveMinimum-${speciesCode}`);

  public readonly weightBelowMinimumInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightBelowMinimum-${speciesCode}`);

  public readonly weightDiscardedInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightDiscarded-${speciesCode}`);

  public readonly addWeightBelowMinimumLink = (speciesCode: string): Locator =>
    this.page.locator(`.js-weight-toggle[data-target="weightBelowMinimum-${speciesCode}-group"]`);

  public readonly addWeightDiscardedLink = (speciesCode: string): Locator =>
    this.page.locator(`.js-weight-toggle[data-target="weightDiscarded-${speciesCode}-group"]`);

  public readonly addSpeciesLink = (): Locator => this.page.getByRole('link', { name: 'Add species' });

  public readonly removeSpeciesLink = (): Locator => this.page.getByRole('link', { name: 'Remove species' });

  async selectSpecies(speciesName: string) {
    await this.speciesCheckbox(speciesName).click();
  }

  async enterSpeciesWeights(speciesCode: string, aboveMin: string, belowMin?: string, discarded?: string) {
    await this.weightAboveMinimumInput(speciesCode).fill(aboveMin);

    if (belowMin !== undefined) {
      // Reveal the input by clicking the toggle link
      await this.addWeightBelowMinimumLink(speciesCode).click();
      await this.weightBelowMinimumInput(speciesCode).fill(belowMin);
    }

    if (discarded !== undefined) {
      // Reveal the input by clicking the toggle link
      await this.addWeightDiscardedLink(speciesCode).click();
      await this.weightDiscardedInput(speciesCode).fill(discarded);
    }
  }

  async clickAddSpecies() {
    await this.addSpeciesLink().click();
  }

  async clickRemoveSpecies() {
    await this.removeSpeciesLink().click();
  }
}
