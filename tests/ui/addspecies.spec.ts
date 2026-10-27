import { expect, test } from '../../fixtures/commonfixture';
import { type AddSpeciesPage } from '../../pages/addSpeciesPage';
import { type SpeciesSelectionPage } from '../../pages/speciesSelectionPage';
import { NavigationFlow } from './helpers/navigationFlow';

async function findSpecies(
  addSpeciesPage: AddSpeciesPage,
  searchTerm: string,
  matches: (species: string) => boolean = () => true
): Promise<string> {
  const species = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).find(matches);
  if (!species) throw new Error('Expected a matching species in the current catalogue');
  return species;
}

async function expectMatchingSpecies(
  addSpeciesPage: AddSpeciesPage,
  searchTerm: string,
  species: string
): Promise<void> {
  const matchingSpecies = (await addSpeciesPage.searchSpeciesOptions(searchTerm)).filter((option) =>
    option.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
  );
  expect(matchingSpecies).toContain(species);
}

test.describe('Add species to a catch record', () => {
  test.beforeEach(async ({ signInPage, speciesSelectionPage }) => {
    await NavigationFlow.signIn(signInPage, {
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add species UI tests'
    });
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test('species search is displayed and accepts user input', async ({ addSpeciesPage, speciesSelectionPage }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const speciesInput = addSpeciesPage.speciesInput();
    const species = await findSpecies(addSpeciesPage, 'at');
    const searchTerm = species.slice(0, 2);

    await expect(speciesInput).toBeVisible();
    await expect(speciesInput).toBeEditable();
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
  });

  test('changing the search term allows another matching catalogue species to be selected', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const speciesInput = addSpeciesPage.speciesInput();
    const firstSpecies = await findSpecies(addSpeciesPage, 'at');
    const firstSearchTerm = firstSpecies.slice(0, 2);
    const secondSpecies = await findSpecies(
      addSpeciesPage,
      'ha',
      (species) =>
        species !== firstSpecies && species.slice(0, 2).toLocaleLowerCase() !== firstSearchTerm.toLocaleLowerCase()
    );
    const secondSearchTerm = secondSpecies.slice(0, 2);

    await speciesInput.fill(firstSearchTerm);
    await expect(speciesInput).toHaveValue(firstSearchTerm);
    await expectMatchingSpecies(addSpeciesPage, firstSearchTerm, firstSpecies);
    await speciesInput.fill(secondSearchTerm);
    await expect(speciesInput).toHaveValue(secondSearchTerm);
    await expectMatchingSpecies(addSpeciesPage, secondSearchTerm, secondSpecies);
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('opens Add Species and adds a selected species to the current catch record', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const species = await findSpecies(addSpeciesPage, 'at');
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
  });

  test('searches the approved species list after entering at least two characters', async ({
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const speciesInput = addSpeciesPage.speciesInput();
    const species = await findSpecies(addSpeciesPage, 'at');
    const searchTerm = species.slice(0, 2);
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
    await expectMatchingSpecies(addSpeciesPage, searchTerm, species);

    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
  });

  test('adds multiple species while retaining previously added species', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const firstSpecies = await findSpecies(addSpeciesPage, 'at');
    await addSpeciesPage.selectSpeciesFromSuggestions(firstSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);

    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const secondSpecies = await findSpecies(addSpeciesPage, 'ha');
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);

    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeVisible();
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('an already-added species remains available in search suggestions', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const addedSpecies = await findSpecies(addSpeciesPage, 'at');
    await addSpeciesPage.selectSpeciesFromSuggestions(addedSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const remainingOptions = await addSpeciesPage.searchSpeciesOptions(addedSpecies.slice(0, 2));
    expect(remainingOptions).toContain(addedSpecies);
  });

  test('arbitrary text that is not an approved species cannot be added', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const invalidSpecies = `Not an approved species ${Date.now()}`;
    await addSpeciesPage.speciesInput().fill(invalidSpecies);
    await addSpeciesPage.speciesInput().press('Enter');

    await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
    await expect(page).toHaveURL(/\/add-species/);
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
    await expect(speciesSelectionPage.speciesCheckbox(invalidSpecies)).toHaveCount(0);
  });

  test('prevents a duplicate species and displays the duplicate message', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const species = await findSpecies(addSpeciesPage, 'at');
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    await addSpeciesPage.speciesInput().fill(species);
    const duplicateOption = addSpeciesPage.suggestionOption(species);
    if (await duplicateOption.isVisible()) await duplicateOption.click();
    await addSpeciesPage.clickSaveAndContinue();

    await expect(addSpeciesPage.errorSummary()).toContainText('This species has already been added.');
    await expect(page).toHaveURL(/\/add-species/);
  });

  test('retains existing species selection when adding another species', async ({
    page,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const firstSpecies = await findSpecies(addSpeciesPage, 'at');
    await addSpeciesPage.selectSpeciesFromSuggestions(firstSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);

    const firstCheckbox = speciesSelectionPage.speciesCheckbox(firstSpecies);
    await firstCheckbox.check();
    const speciesId = await firstCheckbox.getAttribute('value');
    if (!speciesId) throw new Error('Expected the species checkbox to have an ID value');
    await speciesSelectionPage.weightAboveMinimumInput(speciesId).fill('5');
    await speciesSelectionPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/catch-not-landed$/);

    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
    await NavigationFlow.openAddSpecies(speciesSelectionPage, addSpeciesPage);
    const secondSpecies = await findSpecies(addSpeciesPage, 'ha');
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/species-selection$/);

    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('requires at least one species before continuing', async ({ page, speciesSelectionPage }) => {
    await speciesSelectionPage.clickSaveAndContinue();

    await expect(speciesSelectionPage.errorSummary()).toContainText('Select at least one species');
    await expect(page).toHaveURL(/\/species-selection$/);
  });
});
