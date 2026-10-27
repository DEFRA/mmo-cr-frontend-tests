import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Above Minimum Size Retained Weight', () => {
    test('above-minimum weight is mandatory when a species is selected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
    });

    test('above-minimum weight is mandatory for every selected species', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumError('HAD')).toBeVisible();
    });

    test('entering above-minimum weight for all species allows continuation', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });
  });
});
