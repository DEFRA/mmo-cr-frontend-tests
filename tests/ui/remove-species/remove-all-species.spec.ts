import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Remove All Species', () => {
    test('removing all species redirects to the Add Species page', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();
      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });

    test('user cannot continue from Add Species page without adding a species', async ({ addSpeciesPage }) => {
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });

    test('after removing all species, adding a new species allows continuation', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();

      const speciesCheckboxes = await speciesSelectionPage.speciesCheckboxes().all();
      for (const checkbox of speciesCheckboxes) {
        await checkbox.check();
      }
      await addSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeVisible();
    });
  });
});
