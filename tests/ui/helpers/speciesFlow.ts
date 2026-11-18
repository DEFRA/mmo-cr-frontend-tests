import { expect } from '@playwright/test';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';

export class SpeciesFlow {
  constructor(private readonly pages: { addSpeciesPage: AddSpeciesPage }) {}

  async findSpecies(searchTerm: string, matches: (species: string) => boolean = () => true): Promise<string> {
    const { addSpeciesPage } = this.pages;

    const species = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).find(matches);
    if (!species) throw new Error('Expected a matching species in the current catalogue');
    return species;
  }

  // Requires the Add Species page to be open; returns the species that was saved
  async saveSpeciesFromSearch(searchTerm: string, matches: (species: string) => boolean = () => true): Promise<string> {
    const { addSpeciesPage } = this.pages;

    const species = await this.findSpecies(searchTerm, matches);
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await addSpeciesPage.expectUrl(/\/species-selection$/);
    return species;
  }

  async expectMatchingSpecies(searchTerm: string, species: string): Promise<void> {
    const { addSpeciesPage } = this.pages;

    const matchingSpecies = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).filter((option) =>
      option.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
    );
    expect(matchingSpecies).toContain(species);
  }
}
