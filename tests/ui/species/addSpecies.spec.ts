/**
 * Add species to a catch record.
 * Users search the approved species list, add one or more species, cannot add the same species twice,
 * keep previously selected species, and must select at least one species before continuing.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';

// Approved species are discovered from the live catalogue at runtime using these search terms
const firstSpeciesSearchTerm = 'at';
const secondSpeciesSearchTerm = 'ha';
const weightAboveMinimum = '5';
const unapprovedSpeciesPrefix = 'Not an approved species';

const duplicateSpeciesError = (species: string): string => `${species} has already been added.`;
const noSpeciesSelectedError = 'Select at least one species';
const unapprovedSpeciesError = 'Enter the species you want to add';

const speciesCodeOf = (speciesName: string): string => {
  const speciesCode = speciesName.match(/\((\w+)\)$/)?.[1];
  if (!speciesCode) throw new Error(`Expected a species code in "${speciesName}"`);
  return speciesCode;
};

test.describe('Add species to a catch record', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('The user is signed in', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add species UI tests'
      });
    });

    await test.step('The user is on the species selection page', async () => {
      await navigationFlow.openSpeciesSelectionForNewRecord();
    });
  });

  // Every test starts a catch record, so its draft is deleted after each test
  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Adds a species to the catch record when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let species: string;

      await test.step('The user wants to record a species they have caught', async () => {
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
      });

      await test.step('The user selects Add a species', async () => {
        await navigationFlow.openAddSpecies();
      });

      await test.step('The Add Species page is displayed', async () => {
        await addSpeciesPage.expectUrl(/\/add-species/);
        await expect(addSpeciesPage.pageHeading()).toBeVisible();
        await expect(addSpeciesPage.speciesInput()).toBeEditable();
      });

      await test.step('The user can search for a species by name', async () => {
        species = await speciesFlow.findSpecies(firstSpeciesSearchTerm);
      });

      await test.step('The user can select a species from the available list', async () => {
        await addSpeciesPage.selectSpeciesFromSuggestions(species);
      });

      await test.step('The selected species is added to the catch record', async () => {
        await addSpeciesPage.clickSaveAndContinue();
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
        await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
      });
    }
  );

  test(
    'Displays matching species when part of a species name is entered',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let species: string;
      let searchTerm: string;

      await test.step('The user is on the Add Species page', async () => {
        await navigationFlow.openAddSpecies();
        species = await speciesFlow.findSpecies(firstSpeciesSearchTerm);
        searchTerm = species.slice(0, 2);
      });

      await test.step('The user enters at least two characters', async () => {
        await addSpeciesPage.speciesInput().fill(searchTerm);
      });

      await test.step('Matching species are displayed', async () => {
        await speciesFlow.expectMatchingSpecies(searchTerm, species);
      });

      await test.step('The user can select a species from the results list', async () => {
        await addSpeciesPage.selectSpeciesFromSuggestions(species);
        await addSpeciesPage.clickSaveAndContinue();
        await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
      });
    }
  );

  test(
    'Preserves existing species when another species is added',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let firstSpecies: string;
      let secondSpecies: string;

      await test.step('The user has already added one species', async () => {
        await navigationFlow.openAddSpecies();
        firstSpecies = await speciesFlow.saveSpeciesFromSearch(firstSpeciesSearchTerm);
      });

      await test.step('The user selects Add Species again', async () => {
        await navigationFlow.openAddSpecies();
      });

      await test.step('The user can select another species', async () => {
        secondSpecies = await speciesFlow.findSpecies(secondSpeciesSearchTerm, (species) => species !== firstSpecies);
        await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
      });

      await test.step('The newly selected species is added to the existing species list', async () => {
        await addSpeciesPage.clickSaveAndContinue();
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
        await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
      });

      await test.step('Previously added species remain unchanged', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeVisible();
      });
    }
  );

  test(
    'Displays an error when the same species is added again',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let species: string;

      await test.step('A species has already been added', async () => {
        await navigationFlow.openAddSpecies();
        species = await speciesFlow.saveSpeciesFromSearch(firstSpeciesSearchTerm);
      });

      await test.step('The user attempts to add the same species again', async () => {
        await navigationFlow.openAddSpecies();
        await addSpeciesPage.speciesInput().fill(species);
        // The catalogue may hide species already on the record, so wait for either outcome before submitting
        const duplicateOption = addSpeciesPage.suggestionOption(species);
        await expect(duplicateOption.or(addSpeciesPage.noResultsMessage())).toBeVisible();
        if (await duplicateOption.isVisible()) await duplicateOption.click();
        await addSpeciesPage.clickSaveAndContinue();
      });

      await test.step('The system prevents duplicate entries', async () => {
        await addSpeciesPage.expectUrl(/\/add-species/);
      });

      await test.step('An error message is shown: "<species> has already been added."', async () => {
        await expect(addSpeciesPage.errorSummary()).toContainText(duplicateSpeciesError(species));
      });
    }
  );

  test(
    'Preserves the saved species selection when another species is added',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let firstSpecies: string;
      let secondSpecies: string;

      await test.step('The user has previously selected species', async () => {
        await navigationFlow.openAddSpecies();
        firstSpecies = await speciesFlow.saveSpeciesFromSearch(firstSpeciesSearchTerm);

        // A weight is required to persist the selection; weight entry itself is out of scope for this story
        await speciesSelectionPage.speciesCheckbox(firstSpecies).check();
        await speciesSelectionPage.weightAboveMinimumInput(speciesCodeOf(firstSpecies)).fill(weightAboveMinimum);
        await speciesSelectionPage.clickSaveAndContinue();
        await speciesSelectionPage.expectUrl(/\/catch-not-landed$/);
      });

      await test.step('The user returns to the species page', async () => {
        await navigationFlow.openSpeciesSelection();
      });

      await test.step('Previously selected species are displayed', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
      });

      await test.step('The user can add additional species', async () => {
        await navigationFlow.openAddSpecies();
        secondSpecies = await speciesFlow.saveSpeciesFromSearch(
          secondSpeciesSearchTerm,
          (species) => species !== firstSpecies
        );

        await expect(speciesSelectionPage.speciesCheckbox(firstSpecies)).toBeChecked();
        await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
      });
    }
  );

  test(
    'Displays an error when no species is selected',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ speciesSelectionPage }) => {
      await test.step('No species have been selected', async () => {
        for (const checkbox of await speciesSelectionPage.speciesCheckboxes().all()) {
          await checkbox.uncheck();
        }
      });

      await test.step('The user selects Save and Continue', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step(`An error message is displayed: "${noSpeciesSelectedError}."`, async () => {
        await expect(speciesSelectionPage.errorSummary()).toContainText(noSpeciesSelectedError);
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
      });
    }
  );

  test(
    'Adds a matching species when the search term is changed and a new result is selected',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let firstSpecies: string;
      let secondSpecies: string;
      let firstSearchTerm: string;
      let secondSearchTerm: string;

      await test.step('The user is on the Add Species page', async () => {
        await navigationFlow.openAddSpecies();
        firstSpecies = await speciesFlow.findSpecies(firstSpeciesSearchTerm);
        firstSearchTerm = firstSpecies.slice(0, 2);
        secondSpecies = await speciesFlow.findSpecies(
          secondSpeciesSearchTerm,
          (species) =>
            species !== firstSpecies && species.slice(0, 2).toLocaleLowerCase() !== firstSearchTerm.toLocaleLowerCase()
        );
        secondSearchTerm = secondSpecies.slice(0, 2);
      });

      await test.step('The user enters a search term', async () => {
        await addSpeciesPage.speciesInput().fill(firstSearchTerm);
      });

      await test.step('Species matching the search term are displayed', async () => {
        await speciesFlow.expectMatchingSpecies(firstSearchTerm, firstSpecies);
      });

      await test.step('The user changes the search term', async () => {
        await addSpeciesPage.speciesInput().fill(secondSearchTerm);
      });

      await test.step('Species matching the new search term are displayed', async () => {
        await speciesFlow.expectMatchingSpecies(secondSearchTerm, secondSpecies);
      });

      await test.step('The user selects a species matching the new search term', async () => {
        await addSpeciesPage.selectSpeciesFromSuggestions(secondSpecies);
      });

      await test.step('The user selects Save and Continue', async () => {
        await addSpeciesPage.clickSaveAndContinue();
      });

      await test.step('The selected species is added to the catch record', async () => {
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
        await expect(speciesSelectionPage.speciesCheckbox(secondSpecies)).toBeVisible();
      });
    }
  );

  test(
    'Rejects species entries when the text is outside the approved catalogue',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, addSpeciesPage, speciesSelectionPage }) => {
      let unapprovedSpecies: string;

      await test.step('The user is on the Add Species page', async () => {
        await navigationFlow.openAddSpecies();
        unapprovedSpecies = `${unapprovedSpeciesPrefix} ${Date.now()}`;
      });

      await test.step('The user enters text that is not an approved species and submits it', async () => {
        await addSpeciesPage.speciesInput().fill(unapprovedSpecies);
        await addSpeciesPage.speciesInput().press('Enter');
      });

      await test.step(`An error message is displayed: "${unapprovedSpeciesError}"`, async () => {
        await expect(addSpeciesPage.errorSummary()).toContainText(unapprovedSpeciesError);
        await addSpeciesPage.expectUrl(/\/add-species/);
      });

      await test.step('The text is not added to the catch record', async () => {
        await navigationFlow.openSpeciesSelection();
        await expect(speciesSelectionPage.speciesCheckbox(unapprovedSpecies)).toHaveCount(0);
      });
    }
  );
});
