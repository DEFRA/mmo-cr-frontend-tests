import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Above Minimum Size Retained Weight', () => {
    test('above-minimum weight is mandatory when a species is selected', async ({ speciesSelectionPage }) => {
      await test.step('Select Cod and continue without entering a weight', async () => {
        await speciesSelectionPage.selectSpecies('Cod (COD)');
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('Show the required weight error for Cod', async () => {
        await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
      });
    });

    test('above-minimum weight is mandatory for every selected species', async ({ speciesSelectionPage }) => {
      await test.step('Select Cod and Haddock, then enter only Cod weight', async () => {
        await speciesSelectionPage.selectSpecies('Cod (COD)');
        await speciesSelectionPage.selectSpecies('Haddock (HAD)');
        await speciesSelectionPage.enterSpeciesWeights('COD', '100');
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('Show the required weight error for Haddock', async () => {
        await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        await expect(speciesSelectionPage.weightAboveMinimumError('HAD')).toBeVisible();
      });
    });

    test('entering above-minimum weight for all species allows continuation', async ({ speciesSelectionPage }) => {
      await test.step('Select Cod and enter its above-minimum weight', async () => {
        await speciesSelectionPage.selectSpecies('Cod (COD)');
        await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      });

      await test.step('Select Haddock and enter its above-minimum weight', async () => {
        await speciesSelectionPage.selectSpecies('Haddock (HAD)');
        await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      });

      await test.step('Continue without validation errors', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
        await expect(speciesSelectionPage.errorSummary()).toBeHidden();
      });
    });
  });
});
