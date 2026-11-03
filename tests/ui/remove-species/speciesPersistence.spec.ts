import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Species Persistence', () => {
    test('remaining species are still displayed after removing another species', async ({
      speciesSelectionPage,
      removeSpeciesPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.saveAndReturn();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.speciesCheckbox('Haddock (HAD)')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toBeVisible();

      await expect(speciesSelectionPage.speciesCheckbox('Cod (COD)')).toBeHidden();
    });

    test('weight data for remaining species is preserved after a removal', async ({
      speciesSelectionPage,
      removeSpeciesPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toHaveValue('100');
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('50');

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('50');
    });
  });
});
