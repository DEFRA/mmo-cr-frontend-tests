import { expect } from '../../../fixtures/commonfixture';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';

export class SpeciesFlow {
  static async findSpecies(
    addSpeciesPage: AddSpeciesPage,
    searchTerm: string,
    matches: (species: string) => boolean = () => true
  ): Promise<string> {
    const species = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).find(matches);
    if (!species) throw new Error('Expected a matching species in the current catalogue');
    return species;
  }

  static async expectMatchingSpecies(
    addSpeciesPage: AddSpeciesPage,
    searchTerm: string,
    species: string
  ): Promise<void> {
    const matchingSpecies = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).filter((option) =>
      option.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
    );
    expect(matchingSpecies).toContain(species);
  }
}
