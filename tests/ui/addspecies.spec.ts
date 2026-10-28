import { expect, test } from '../../fixtures/commonfixture';
import { type SpeciesSelectionPage } from '../../pages/speciesSelectionPage';

test.describe('Add species to a catch record', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signIn({
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add species UI tests'
    });
    await navigationFlow.openSpeciesSelection();
  });

  test('species search is displayed and accepts user input', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage
  }) => {
    await navigationFlow.openAddSpecies();
    const speciesInput = addSpeciesPage.speciesInput();
    const species = await speciesFlow.findSpecies('at');
    const searchTerm = species.slice(0, 2);

    await expect(speciesInput).toBeVisible();
    await expect(speciesInput).toBeEditable();
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
  });

  test('changing the search term allows another matching catalogue species to be selected', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const speciesInput = addSpeciesPage.speciesInput();
    const firstSpecies = await speciesFlow.findSpecies('at');
    const firstSearchTerm = firstSpecies.slice(0, 2);
    const secondSpecies = await speciesFlow.findSpecies(
      'ha',
      (species) =>
        species !== firstSpecies && species.slice(0, 2).toLocaleLowerCase() !== firstSearchTerm.toLocaleLowerCase()
    );
    const secondSearchTerm = secondSpecies.slice(0, 2);

    await speciesInput.fill(firstSearchTerm);
    await expect(speciesInput).toHaveValue(firstSearchTerm);
    await speciesFlow.expectMatchingSpecies(firstSearchTerm, firstSpecies);
    await speciesInput.fill(secondSearchTerm);
    await expect(speciesInput).toHaveValue(secondSearchTerm);
    await speciesFlow.expectMatchingSpecies(secondSearchTerm, secondSpecies);
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();

    await speciesSelectionPage.expectUrl(/\/species-selection$/);
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('opens Add Species and adds a selected species to the current catch record', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const species = await speciesFlow.findSpecies('at');
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();

    await speciesSelectionPage.expectUrl(/\/species-selection$/);
    await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
  });

  test('searches the approved species list after entering at least two characters', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const speciesInput = addSpeciesPage.speciesInput();
    const species = await speciesFlow.findSpecies('at');
    const searchTerm = species.slice(0, 2);
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
    await speciesFlow.expectMatchingSpecies(searchTerm, species);

    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
  });

  test('adds multiple species while retaining previously added species', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const firstSpecies = await speciesFlow.findSpecies('at');
    await addSpeciesPage.selectSpeciesFromSuggestions(firstSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);

    await navigationFlow.openAddSpecies();
    const secondSpecies = await speciesFlow.findSpecies('ha');
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);

    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeVisible();
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('an already-added species remains available in search suggestions', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const addedSpecies = await speciesFlow.findSpecies('at');
    await addSpeciesPage.selectSpeciesFromSuggestions(addedSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);
    await navigationFlow.openAddSpecies();
    const remainingOptions = await addSpeciesPage.searchSpeciesOptions(addedSpecies.slice(0, 2));
    expect(remainingOptions).toContain(addedSpecies);
  });

  test('arbitrary text that is not an approved species cannot be added', async ({
    navigationFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const invalidSpecies = `Not an approved species ${Date.now()}`;
    await addSpeciesPage.speciesInput().fill(invalidSpecies);
    await addSpeciesPage.speciesInput().press('Enter');

    await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
    await addSpeciesPage.expectUrl(/\/add-species/);
    await navigationFlow.openSpeciesSelection();
    await expect(speciesSelectionPage.speciesCheckbox(invalidSpecies)).toHaveCount(0);
  });

  test('prevents a duplicate species and displays the duplicate message', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const species = await speciesFlow.findSpecies('at');
    await addSpeciesPage.selectSpeciesFromSuggestions(species);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);
    await navigationFlow.openAddSpecies();
    await addSpeciesPage.speciesInput().fill(species);
    const duplicateOption = addSpeciesPage.suggestionOption(species);
    if (await duplicateOption.isVisible()) await duplicateOption.click();
    await addSpeciesPage.clickSaveAndContinue();

    await expect(addSpeciesPage.errorSummary()).toContainText('This species has already been added.');
    await addSpeciesPage.expectUrl(/\/add-species/);
  });

  test('retains existing species selection when adding another species', async ({
    navigationFlow,
    speciesFlow,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await navigationFlow.openAddSpecies();
    const firstSpecies = await speciesFlow.findSpecies('at');
    await addSpeciesPage.selectSpeciesFromSuggestions(firstSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);

    const firstCheckbox = speciesSelectionPage.speciesCheckbox(firstSpecies);
    await firstCheckbox.check();
    const speciesId = await firstCheckbox.getAttribute('value');
    if (!speciesId) throw new Error('Expected the species checkbox to have an ID value');
    await speciesSelectionPage.weightAboveMinimumInput(speciesId).fill('5');
    await speciesSelectionPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/catch-not-landed$/);

    await navigationFlow.openSpeciesSelection();
    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
    await navigationFlow.openAddSpecies();
    const secondSpecies = await speciesFlow.findSpecies('ha');
    await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
    await addSpeciesPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);

    await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
    await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
  });

  test('requires at least one species before continuing', async ({ speciesSelectionPage }) => {
    await speciesSelectionPage.clickSaveAndContinue();

    await expect(speciesSelectionPage.errorSummary()).toContainText('Select at least one species');
    await speciesSelectionPage.expectUrl(/\/species-selection$/);
  });
});
