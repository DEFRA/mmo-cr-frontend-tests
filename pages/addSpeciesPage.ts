import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddSpeciesPage extends BasePage {
  // Uses a regex because the "New catch record" caption is part of the heading's accessible name
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /What species did you catch\?/ });

  public readonly speciesInput = (): Locator => this.page.locator('#species');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorMessage = (): Locator => this.page.locator('#species-error');

  public readonly searchResults = (): Locator => this.page.getByRole('listbox').getByRole('option');

  public readonly suggestionOption = (speciesName: string): Locator =>
    this.page.getByRole('option', { name: speciesName, exact: true });

  async searchAndSelectSpecies(speciesName: string) {
    await this.speciesInput().fill(speciesName.slice(0, 2));
    const option = this.suggestionOption(speciesName);
    await option.scrollIntoViewIfNeeded();
    await option.click();
    await expect(this.speciesInput()).toHaveValue(speciesName);
  }

  async searchSpeciesOptions(searchTerm: string): Promise<string[]> {
    await this.speciesInput().fill(searchTerm);
    await expect(this.searchResults().first()).toBeVisible();
    return (await this.searchResults().allTextContents()).map((species) => species.trim());
  }

  async selectSpeciesFromSuggestions(speciesName: string): Promise<void> {
    await this.speciesInput().fill(speciesName.slice(0, 2));
    const option = this.suggestionOption(speciesName);
    await expect(option).toBeVisible();
    await option.click();
    await expect(this.speciesInput()).toHaveValue(speciesName);
  }
}
