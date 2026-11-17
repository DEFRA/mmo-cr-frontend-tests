/**
 * Remove species from a catch record.
 * Removing a species also removes its catch-weight data and hides it from the selected list;
 * removing all species returns the user to Add Species until at least one is selected.
 *
 * @author Randhir Patel
 * @since 2026-11-11
 */
import { expect, test } from '../../../fixtures/commonfixture';

type SpeciesData = { name: string; code: string; weight: string };

const cod: SpeciesData = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const mackerel: SpeciesData = { name: 'Atlantic mackerel (MAC)', code: 'MAC', weight: '50' };
// Placeholder until a third vessel species is confirmed; only used by the fixme test
const thirdSpecies: SpeciesData = { name: '<THIRD_SPECIES>', code: '<THIRD_CODE>', weight: '' };

test.describe('Remove species', () => {
  // Removing species here updates the vessel's saved species, so restore them around every test
  test.beforeEach(async ({ navigationFlow, favouritesFlow, speciesSelectionPage }) => {
    await test.step('The user has one or more species displayed', async () => {
      await navigationFlow.signInAndOpenAccount({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Remove species UI tests'
      });
      for (const species of [cod, mackerel]) {
        await favouritesFlow.ensureSpeciesAdded(species.name);
      }
      await navigationFlow.openSpeciesSelectionForNewRecord();
      for (const species of [cod, mackerel]) {
        await speciesSelectionPage.selectSpecies(species.name);
        await speciesSelectionPage.enterSpeciesWeights(species.code, species.weight);
      }
      await speciesSelectionPage.saveAndReturn();
    });
  });

  test.afterEach(async ({ navigationFlow, favouritesFlow }) => {
    await navigationFlow.openAccount();
    for (const species of [cod, mackerel]) {
      await favouritesFlow.ensureSpeciesAdded(species.name);
    }
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
        await expect(removeSpeciesPage.speciesCheckbox(cod.name)).toBeVisible();
        await expect(removeSpeciesPage.speciesCheckbox(mackerel.name)).toBeVisible();
      });

      await test.step('The user can select one or more species to remove', async () => {
        await removeSpeciesPage.selectSpeciesToRemove(cod.name);
        await removeSpeciesPage.selectSpeciesToRemove(mackerel.name);
        await expect(removeSpeciesPage.speciesCheckbox(cod.name)).toBeChecked();
        await expect(removeSpeciesPage.speciesCheckbox(mackerel.name)).toBeChecked();
      });
    }
  );

  test(
    'Removes selected species and their catch weights when removal is confirmed',
    { tag: ['@ui', '@regression', '@removeSpecies'] },
    async ({ speciesSelectionPage, removeSpeciesPage }) => {
      test.fixme(true, 'Needs a third species on the vessel so removing two does not remove all (AC5)');

      await test.step('The user has multiple species selected', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(cod.weight);
        await expect(speciesSelectionPage.weightAboveMinimumInput(mackerel.code)).toHaveValue(mackerel.weight);
      });

      await test.step('The user selects more than one species for removal', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
        await removeSpeciesPage.selectSpeciesToRemove(cod.name);
        await removeSpeciesPage.selectSpeciesToRemove(thirdSpecies.name);
      });

      await test.step('The user confirms removal', async () => {
        await removeSpeciesPage.clickSaveAndContinue();
      });

      await test.step('All selected species are removed from the catch record', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(cod.name)).toBeHidden();
        await expect(speciesSelectionPage.speciesCheckbox(thirdSpecies.name)).toBeHidden();
      });

      await test.step('Associated catch-weight data is removed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toBeHidden();
        await expect(speciesSelectionPage.weightAboveMinimumInput(thirdSpecies.code)).toBeHidden();
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
        await removeSpeciesPage.selectSpeciesToRemove(cod.name);
        await removeSpeciesPage.common.backLink().click();
      });

      await test.step('No species are removed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(cod.weight);
        await expect(speciesSelectionPage.weightAboveMinimumInput(mackerel.code)).toHaveValue(mackerel.weight);
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
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(cod.weight);
      });

      await test.step('The user returns to the species page', async () => {
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('Previously selected species are displayed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(cod.weight);
        await expect(speciesSelectionPage.weightAboveMinimumInput(mackerel.code)).toHaveValue(mackerel.weight);
      });

      await test.step('The user can remove existing species', async () => {
        await speciesSelectionPage.clickRemoveSpecies();
        await removeSpeciesPage.selectSpeciesToRemove(cod.name);
        await removeSpeciesPage.clickSaveAndContinue();
        await expect(speciesSelectionPage.speciesCheckbox(cod.name)).toBeHidden();
        await expect(speciesSelectionPage.speciesCheckbox(mackerel.name)).toBeVisible();
      });
    }
  );
});
