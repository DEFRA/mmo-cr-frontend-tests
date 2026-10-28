import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class SpeciesSelectionPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /What species did you catch\?/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly speciesCheckboxes = (): Locator => this.page.getByRole('checkbox');

  // Field IDs use a species GUID, so scope to the conditional block revealed by the species checkbox
  private readonly speciesSection = (speciesCode: string): Locator =>
    this.page.locator(
      `.govuk-checkboxes__item:has(label:has-text("(${speciesCode})")) + .govuk-checkboxes__conditional`
    );

  public readonly weightAboveMinimumInput = (speciesCode: string): Locator =>
    this.speciesSection(speciesCode).locator('input[id^="weightAboveMinimum-"]');

  public readonly weightBelowMinimumInput = (speciesCode: string): Locator =>
    this.speciesSection(speciesCode).locator('input[id^="weightBelowMinimum-"]');

  public readonly weightDiscardedInput = (speciesCode: string): Locator =>
    this.speciesSection(speciesCode).locator('input[id^="weightDiscarded-"]');

  public readonly addWeightBelowMinimumLink = (speciesCode: string): Locator =>
    this.speciesSection(speciesCode).locator('[data-target^="weightBelowMinimum-"]');

  public readonly addWeightDiscardedLink = (speciesCode: string): Locator =>
    this.speciesSection(speciesCode).locator('[data-target^="weightDiscarded-"]');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorSummaryLinks = (): Locator => this.page.locator('.govuk-error-summary__list a');

  public readonly speciesErrorMessage = (): Locator => this.page.locator('#speciesIds-error');

  public readonly weightAboveMinimumError = (speciesCode: string): Locator =>
    this.page.locator('.govuk-error-message[id^="weightAboveMinimum-"]').filter({ hasText: `(${speciesCode})` });

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
