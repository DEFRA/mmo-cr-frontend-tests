import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class SpeciesSelectionPage extends BasePage {
  // Uses a regex because the gear name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /What species did you catch using .*\?/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly weightAboveMinimumInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightAboveMinimum-${speciesCode.toLowerCase()}`);

  public readonly weightBelowMinimumInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightBelowMinimum-${speciesCode.toLowerCase()}`);

  public readonly weightDiscardedInput = (speciesCode: string): Locator =>
    this.page.locator(`#weightDiscarded-${speciesCode.toLowerCase()}`);

  public readonly addWeightBelowMinimumLink = (speciesCode: string): Locator =>
    this.page.locator(`.js-weight-toggle[data-target="weightBelowMinimum-${speciesCode.toLowerCase()}-group"]`);

  public readonly addWeightDiscardedLink = (speciesCode: string): Locator =>
    this.page.locator(`.js-weight-toggle[data-target="weightDiscarded-${speciesCode.toLowerCase()}-group"]`);

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorSummaryLinks = (): Locator => this.page.locator('.govuk-error-summary__list a');

  public readonly speciesErrorMessage = (): Locator => this.page.locator('#speciesIds-error');

  public readonly weightAboveMinimumError = (speciesCode: string): Locator =>
    this.page.locator(`#weightAboveMinimum-${speciesCode.toLowerCase()}-error`);

  public readonly weightBelowMinimumError = (speciesCode: string): Locator =>
    this.page.locator(`#weightBelowMinimum-${speciesCode.toLowerCase()}-error`);

  public readonly weightDiscardedError = (speciesCode: string): Locator =>
    this.page.locator(`#weightDiscarded-${speciesCode.toLowerCase()}-error`);

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

  // Unsaved selections are lost when leaving the page, so persist them before removing species
  async saveAndReturn() {
    await this.clickSaveAndContinue();
    await this.page.waitForURL(/catch-not-landed/);
    await this.goto('/species-selection');
  }

  async clickAddSpecies() {
    await this.addSpeciesLink().click();
  }

  async clickRemoveSpecies() {
    await this.removeSpeciesLink().click();
  }
}
