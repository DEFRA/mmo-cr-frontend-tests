import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Numeric Validation', () => {
    test('whole number weight is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('one decimal place weight is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10.5');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('two decimal places weight is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10.55');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
    });

    test('negative number weight is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '-8');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('alphanumeric input is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', 'A1');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('alphabetic input is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', 'abc');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('special characters are rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10@#');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('three decimal places weight is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10.555');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('below-minimum weight also follows numeric validation', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10.55');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('discarded weight also follows numeric validation', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', undefined, '5.55');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });
  });
});
