import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Above-Minimum vs Discarded Weight Validation', () => {
    test('above-minimum weight less than discarded weight shows error', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '5', undefined, '10');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('above-minimum weight equal to discarded weight shows error', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10', undefined, '10');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('above-minimum weight greater than discarded weight is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', undefined, '10');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('above-minimum vs discarded validation applies per species', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', undefined, '10');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '5', undefined, '20');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });
  });
});
