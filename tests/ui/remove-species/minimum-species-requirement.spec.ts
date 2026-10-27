import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Minimum Species Requirement', () => {
    test('Save and continue is blocked when no species are selected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeVisible();
    });

    test('catch record proceeds when at least one species is selected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeHidden();
    });

    test('removing species down to zero prevents continuation from species selection', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });
  });
});
