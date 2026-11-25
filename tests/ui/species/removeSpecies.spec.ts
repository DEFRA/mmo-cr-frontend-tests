/**
 * Remove species from a catch record.
 * Removing a species also removes its catch-weight data and hides it from the selected list;
 * removing all species returns the user to Add Species until at least one is selected.
 *
 * @author Randhir Patel
 * @since 2026-11-11
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { catchSpecies } from '../../../test-data/testData';

type SpeciesData = { name: string; code: string; weight: string };

// A third vessel species, so removing two species never removes all of them (confirmed in the live catalogue)

test.describe('Remove species', () => {
  // Removing species here updates the vessel's saved species, so restore them around every test
  test.beforeEach(async ({ navigationFlow, favouritesFlow, speciesSelectionPage }) => {
    await test.step('The user has one or more species displayed', async () => {
      await navigationFlow.signInAndOpenAccount({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Remove species UI tests'
      });
      for (const species of [catchSpecies.cod, catchSpecies.mackerel]) {
        await favouritesFlow.ensureSpeciesAdded(species.name);
      }
      await navigationFlow.openSpeciesSelectionForNewRecord();
      for (const species of [catchSpecies.cod, catchSpecies.mackerel]) {
        await speciesSelectionPage.selectSpecies(species.name);
        await speciesSelectionPage.enterSpeciesWeights(species.code, species.weight);
      }
      await speciesSelectionPage.saveAndReturn();
    });
  });

  test.afterEach(async ({ navigationFlow, favouritesFlow, catchRecordFlow }) => {
    await navigationFlow.openAccount();
    for (const species of [catchSpecies.cod, catchSpecies.mackerel]) {
      await favouritesFlow.ensureSpeciesAdded(species.name);
    }
    await favouritesFlow.removeSpeciesFromAccount(catchSpecies.shads.name);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Displays saved species and allows selecting them for removal',
    { tag: ['@ui', '@regression', '@removeSpecies'] },
    async ({ speciesSelectionPage, removeSpeciesPage }) => {
      await test.step('The user selects Remove Species', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
      });

      await test.step('The user is taken to the Remove Species page', async () => {
        await expect(removeSpeciesPage.pageHeading()).toBeVisible();
      });

      await test.step('All selected species are displayed', async () => {
        await expect(removeSpeciesPage.speciesCheckbox(catchSpecies.cod.name)).toBeVisible();
        await expect(removeSpeciesPage.speciesCheckbox(catchSpecies.mackerel.name)).toBeVisible();
      });

      await test.step('The user can select one or more species to remove', async () => {
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.cod.name);
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.mackerel.name);
        await expect(removeSpeciesPage.speciesCheckbox(catchSpecies.cod.name)).toBeChecked();
        await expect(removeSpeciesPage.speciesCheckbox(catchSpecies.mackerel.name)).toBeChecked();
      });
    }
  );

  test(
    'Removes selected species and their catch weights when removal is confirmed',
    { tag: ['@ui', '@regression', '@removeSpecies'] },
    async ({ navigationFlow, favouritesFlow, speciesSelectionPage, removeSpeciesPage }) => {
      await test.step('The user has multiple species selected', async () => {
        // The Remove Species page lists the vessel's saved species, so the third species is saved to the account first
        await navigationFlow.openAccount();
        await favouritesFlow.ensureSpeciesAdded(catchSpecies.shads.name);
        await navigationFlow.openSpeciesSelection();
        await speciesSelectionPage.selectSpecies(catchSpecies.shads.name);
        await speciesSelectionPage.enterSpeciesWeights(catchSpecies.shads.code, catchSpecies.shads.weight);
        await speciesSelectionPage.saveAndReturn();
        for (const species of [catchSpecies.cod, catchSpecies.mackerel, catchSpecies.shads]) {
          await expect(speciesSelectionPage.weightAboveMinimumInput(species.code)).toHaveValue(species.weight);
        }
      });

      await test.step('The user selects more than one species for removal', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.cod.name);
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.shads.name);
      });

      await test.step('The user confirms removal', async () => {
        await removeSpeciesPage.clickSaveAndContinue();
      });

      await test.step('All selected species are removed from the catch record', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name)).toBeHidden();
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.shads.name)).toBeHidden();
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.mackerel.name)).toBeVisible();
      });

      await test.step('Associated catch-weight data is removed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code)).toBeHidden();
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.shads.code)).toBeHidden();
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.mackerel.code)).toHaveValue(
          catchSpecies.mackerel.weight
        );
      });
    }
  );

  test(
    'Preserves species and catch weights when removal is cancelled',
    { tag: ['@ui', '@regression', '@removeSpecies'] },
    async ({ speciesSelectionPage, removeSpeciesPage }) => {
      await test.step('The user has selected Remove Species', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
        await expect(removeSpeciesPage.pageHeading()).toBeVisible();
      });

      await test.step('The user selects Cancel or Back', async () => {
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.cod.name);
        await removeSpeciesPage.common.backLink().click();
      });

      await test.step('No species are removed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code)).toHaveValue(
          catchSpecies.cod.weight
        );
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.mackerel.code)).toHaveValue(
          catchSpecies.mackerel.weight
        );
      });

      await test.step('The user returns to the previous page', async () => {
        await expect(speciesSelectionPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Preserves the remaining species when a previously saved species is removed',
    { tag: ['@ui', '@regression', '@removeSpecies'] },
    async ({ speciesSelectionPage, removeSpeciesPage }) => {
      await test.step('The user has previously selected species', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code)).toHaveValue(
          catchSpecies.cod.weight
        );
      });

      await test.step('The user returns to the species page', async () => {
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('Previously selected species are displayed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code)).toHaveValue(
          catchSpecies.cod.weight
        );
        await expect(speciesSelectionPage.weightAboveMinimumInput(catchSpecies.mackerel.code)).toHaveValue(
          catchSpecies.mackerel.weight
        );
      });

      await test.step('The user can remove existing species', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
        await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.cod.name);
        await removeSpeciesPage.clickSaveAndContinue();
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name)).toBeHidden();
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.mackerel.name)).toBeVisible();
      });
    }
  );
});
