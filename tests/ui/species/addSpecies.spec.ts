/**
 * Add species to a catch record.
 * Users search the approved species list, add one or more species, cannot add the same species twice,
 * keep previously selected species, and must select at least one species before continuing.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, noFavourites } from '../helpers/catchRecordFlow';
import { catchSpecies, errorMessages, gears, ports } from '../../../test-data/testData';
import { searchTermFor } from '../../../utils/search';

// Departure and return ports the journey saves as favourites; removed after each test unless already saved
const absentFavourites: Favourites = { ...noFavourites, ports: [ports.first, ports.third] };
// Gear the journey selects to reach the map; saved for the test and removed afterwards unless already saved
const testFavourites: Favourites = { ...noFavourites, gears: [gears.pots.name] };

// Approved species are discovered from the live catalogue at runtime using these search terms

const duplicateSpeciesError = (species: string): string => `${species}${errorMessages.species.duplicateSuffix}`;

const speciesCodeOf = (speciesName: string): string => {
  const speciesCode = speciesName.match(/\((\w+)\)$/)?.[1];
  if (!speciesCode) throw new Error(`Expected a species code in "${speciesName}"`);
  return speciesCode;
};

test.describe('Add species to a catch record', () => {
  test.use({ testFavourites, absentFavourites });

  // Requesting createdRecords signs in and restores the favourites and drafts after each test
  test.beforeEach(async ({ navigationFlow, createdRecords }) => {
    void createdRecords;
    await test.step('The user is signed in', async () => {
      void createdRecords;
    });

    await test.step('The user is on the species selection page', async () => {
      await navigationFlow.openSpeciesSelectionForNewRecord();
    });
  });

  test(
    'Adds a species to the catch record when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage, speciesSelectionPage }) => {
      let species: string;

      await test.step('The user wants to record a species they have caught', async () => {
        await speciesSelectionPage.expectOnPage();
      });

      await test.step('The user selects Add a species', async () => {
        await navigationFlow.openAddSpecies();
      });

      await test.step('The Add Species page is displayed', async () => {
        await addSpeciesPage.expectOnPage();
        await expect(addSpeciesPage.speciesInput(), 'Species input to be editable').toBeEditable();
      });

      await test.step('The user can search for a species by name', async () => {
        species = await speciesFlow.findSpecies(catchSpecies.searchTerms.first);
      });

      await test.step('The user can select a species from the available list', async () => {
        await addSpeciesPage.searchAndSelectSpecies(species);
      });

      await test.step('The selected species is added to the catch record', async () => {
        await addSpeciesPage.clickSaveAndContinue();
        await speciesSelectionPage.expectOnPage();
        await expect(speciesSelectionPage.speciesCheckbox(species), 'Species checkbox to be visible').toBeVisible();
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
        species = await speciesFlow.findSpecies(catchSpecies.searchTerms.first);
        searchTerm = searchTermFor(species);
      });

      await test.step('The user enters at least two characters', async () => {
        await addSpeciesPage.speciesInput().fill(searchTerm);
      });

      await test.step('Matching species are displayed', async () => {
        await speciesFlow.expectMatchingSpecies(searchTerm, species);
      });

      await test.step('The user can select a species from the results list', async () => {
        await addSpeciesPage.searchAndSelectSpecies(species);
        await addSpeciesPage.clickSaveAndContinue();
        await expect(speciesSelectionPage.speciesCheckbox(species), 'Species checkbox to be visible').toBeVisible();
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
        firstSpecies = await speciesFlow.saveSpeciesFromSearch(catchSpecies.searchTerms.first);
      });

      await test.step('The user selects Add Species again', async () => {
        await navigationFlow.openAddSpecies();
      });

      await test.step('The user can select another species', async () => {
        secondSpecies = await speciesFlow.findSpecies(
          catchSpecies.searchTerms.second,
          (species) => species !== firstSpecies
        );
        await addSpeciesPage.searchAndSelectSpecies(secondSpecies);
      });

      await test.step('The newly selected species is added to the existing species list', async () => {
        await addSpeciesPage.clickSaveAndContinue();
        await speciesSelectionPage.expectOnPage();
        await expect(
          speciesSelectionPage.speciesCheckbox(secondSpecies),
          'Species checkbox to be visible'
        ).toBeVisible();
      });

      await test.step('Previously added species remain unchanged', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(firstSpecies),
          'Species checkbox to be visible'
        ).toBeVisible();
      });
    }
  );

  test(
    'Displays an error when the same species is added again',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, addSpeciesPage }) => {
      let species: string;

      await test.step('A species has already been added', async () => {
        await navigationFlow.openAddSpecies();
        species = await speciesFlow.saveSpeciesFromSearch(catchSpecies.searchTerms.first);
      });

      await test.step('The user attempts to add the same species again', async () => {
        await navigationFlow.openAddSpecies();
        await speciesFlow.submitSpecies(species);
      });

      await test.step('The system prevents duplicate entries', async () => {
        await addSpeciesPage.expectOnPage();
      });

      await test.step('An error message is shown: "<species> has already been added."', async () => {
        await expect(addSpeciesPage.errorSummary(), 'Error summary to contain text').toContainText(
          duplicateSpeciesError(species)
        );
      });
    }
  );

  test(
    'Preserves the saved species selection when another species is added',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ navigationFlow, speciesFlow, speciesSelectionPage, catchNotLandedPage }) => {
      let firstSpecies: string;
      let secondSpecies: string;

      await test.step('The user has previously selected species', async () => {
        await navigationFlow.openAddSpecies();
        firstSpecies = await speciesFlow.saveSpeciesFromSearch(catchSpecies.searchTerms.first);

        // A weight is required to persist the selection; weight entry itself is out of scope for this story
        await speciesSelectionPage.speciesCheckbox(firstSpecies).check();
        await speciesSelectionPage
          .weightAboveMinimumInput(speciesCodeOf(firstSpecies))
          .fill(catchSpecies.weights.aboveMinimum);
        await speciesSelectionPage.clickSaveAndContinue();
        await catchNotLandedPage.expectOnPage();
      });

      await test.step('The user returns to the species page', async () => {
        await navigationFlow.returnToSpeciesSelection();
      });

      await test.step('Previously selected species are displayed', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(firstSpecies),
          'Species checkbox to be checked'
        ).toBeChecked();
      });

      await test.step('The user can add additional species', async () => {
        await navigationFlow.openAddSpecies();
        secondSpecies = await speciesFlow.saveSpeciesFromSearch(
          catchSpecies.searchTerms.second,
          (species) => species !== firstSpecies
        );

        await expect(
          speciesSelectionPage.speciesCheckbox(firstSpecies),
          'Species checkbox to be checked'
        ).toBeChecked();
        await expect(
          speciesSelectionPage.speciesCheckbox(secondSpecies),
          'Species checkbox to be visible'
        ).toBeVisible();
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

      await test.step(`An error message is displayed: "${errorMessages.species.noneSelected}."`, async () => {
        await expect(
          speciesSelectionPage.errorSummary(),
          `Error summary to contain text ${errorMessages.species.noneSelected}`
        ).toContainText(errorMessages.species.noneSelected);
        await speciesSelectionPage.expectOnPage();
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
        firstSpecies = await speciesFlow.findSpecies(catchSpecies.searchTerms.first);
        firstSearchTerm = searchTermFor(firstSpecies);
        secondSpecies = await speciesFlow.findSpecies(
          catchSpecies.searchTerms.second,
          (species) =>
            species !== firstSpecies &&
            searchTermFor(species).toLocaleLowerCase() !== firstSearchTerm.toLocaleLowerCase()
        );
        secondSearchTerm = searchTermFor(secondSpecies);
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
        await addSpeciesPage.searchAndSelectSpecies(secondSpecies);
      });

      await test.step('The user selects Save and Continue', async () => {
        await addSpeciesPage.clickSaveAndContinue();
      });

      await test.step('The selected species is added to the catch record', async () => {
        await speciesSelectionPage.expectOnPage();
        await expect(
          speciesSelectionPage.speciesCheckbox(secondSpecies),
          'Species checkbox to be visible'
        ).toBeVisible();
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
        unapprovedSpecies = `${catchSpecies.unapprovedPrefix} ${Date.now()}`;
      });

      await test.step('The user enters text that is not an approved species and submits it', async () => {
        await addSpeciesPage.speciesInput().fill(unapprovedSpecies);
        await addSpeciesPage.speciesInput().press('Enter');
      });

      await test.step(`An error message is displayed: "${errorMessages.species.unapproved}"`, async () => {
        await expect(
          addSpeciesPage.errorSummary(),
          `Error summary to contain text ${errorMessages.species.unapproved}`
        ).toContainText(errorMessages.species.unapproved);
        await addSpeciesPage.expectOnPage();
      });

      await test.step('The text is not added to the catch record', async () => {
        await navigationFlow.returnToSpeciesSelection();
        await expect(
          speciesSelectionPage.speciesCheckbox(unapprovedSpecies),
          'Species checkbox to have count'
        ).toHaveCount(0);
      });
    }
  );
});
