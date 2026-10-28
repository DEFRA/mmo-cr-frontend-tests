import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Species Removal', () => {
    test('removing a species removes its associated catch-weight information', async ({
      speciesSelectionPage,
      removeSpeciesPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toBeVisible();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.speciesCheckbox('Cod (COD)')).toBeHidden();
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();
    });

    test('removing a species clears below-minimum and discarded weights too', async ({
      speciesSelectionPage,
      removeSpeciesPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10', '5');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightBelowMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightDiscardedInput('COD')).toBeVisible();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();
      await expect(speciesSelectionPage.weightBelowMinimumInput('COD')).toBeHidden();
      await expect(speciesSelectionPage.weightDiscardedInput('COD')).toBeHidden();
    });
  });
});
