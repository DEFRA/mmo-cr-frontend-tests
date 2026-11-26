/**
 * Reusable journeys for searching for and selecting species.
 *
 * @author Randhir Patel
 * @since 2026-10-28
 */
import { expect } from '@playwright/test';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type SpeciesSelectionPage } from '../../../pages/speciesSelectionPage';

export class SpeciesFlow {
  constructor(private readonly pages: { addSpeciesPage: AddSpeciesPage; speciesSelectionPage: SpeciesSelectionPage }) {}

  async findSpecies(searchTerm: string, matches: (species: string) => boolean = () => true): Promise<string> {
    const { addSpeciesPage } = this.pages;

    const species = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).find(matches);
    if (!species) throw new Error('Expected a matching species in the current catalogue');
    return species;
  }

  // Requires the Add Species page to be open; returns the species that was saved
  async saveSpeciesFromSearch(searchTerm: string, matches: (species: string) => boolean = () => true): Promise<string> {
    const { addSpeciesPage, speciesSelectionPage } = this.pages;

    const species = await this.findSpecies(searchTerm, matches);
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectOnPage();
    return species;
  }

  async expectMatchingSpecies(searchTerm: string, species: string): Promise<void> {
    const { addSpeciesPage } = this.pages;

    const matchingSpecies = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).filter((option) =>
      option.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
    );
    expect(matchingSpecies, `Matching species to contain ${species}`).toContain(species);
  }

  // Requires the Add Species page to be open; submits a species that may already be added (hidden from the catalogue)
  async submitSpecies(speciesName: string): Promise<void> {
    const { addSpeciesPage } = this.pages;

    await addSpeciesPage.speciesInput().fill(speciesName);
    const option = addSpeciesPage.suggestionOption(speciesName);
    await expect(option.or(addSpeciesPage.noResultsMessage()), 'Or to be visible').toBeVisible();
    if (await option.isVisible()) {
      await option.click();
    } else {
      await addSpeciesPage.speciesInput().press('Tab');
    }
    await addSpeciesPage.clickSaveAndContinue();
  }
}
