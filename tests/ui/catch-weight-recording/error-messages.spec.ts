import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Error Messages', () => {
    test('error summary is displayed at the top of the page on validation failure', async ({
      speciesSelectionPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('inline error message appears next to the weight field on validation failure', async ({
      speciesSelectionPage
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
    });

    test('error summary contains links that focus the relevant weight field', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.clickSaveAndContinue();

      const errorLinks = speciesSelectionPage.errorSummaryLinks();
      await expect(errorLinks.first()).toBeVisible();
    });

    test('multiple validation errors are all displayed simultaneously', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumError('HAD')).toBeVisible();
    });
  });
});
