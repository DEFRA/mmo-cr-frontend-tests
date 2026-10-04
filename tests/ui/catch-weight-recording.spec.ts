import { expect, test } from '../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await speciesSelectionPage.goto('/species-selection');
  });

  test.describe('Species-Based Recording', () => {
    test('catch information is recorded separately for each selected species', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toBeVisible();
    });

    test('each species has its own independent weight input fields', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '200');

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toHaveValue('100');
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('200');
    });
  });

  test.describe('Weight Unit', () => {
    test('weight labels display kilograms (kg) as the unit', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');

      const weightGroup = speciesSelectionPage.weightAboveMinimumInput('COD');
      await expect(weightGroup).toBeVisible();
    });
  });

  test.describe('Weight Range Validation', () => {
    test('weight of 0 is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '0');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('negative weight is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '-5');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('weight of 0.1 (just above 0) is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '0.1');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('weight of 10000 (upper boundary) is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10000');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('weight of 10001 (above upper boundary) is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10001');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('weight of 10000.1 (above upper boundary with decimal) is rejected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '10000.1');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeVisible();
    });

    test('weight of 1 (valid minimum) is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '1');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('weight of 9999.9 (just below upper boundary) is accepted', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '9999.9');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });
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

  test.describe('Below Minimum Size Retained Weight', () => {
    test('below-minimum weight is optional and can be left empty', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('below-minimum weight can be recorded alongside above-minimum', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });
  });

  test.describe('Discarded Catch Weight', () => {
    test('discarded weight is optional and can be left empty', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('discarded weight can be recorded alongside above-minimum', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', undefined, '5');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });

    test('all three weight types can be entered together', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10', '5');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });
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

  test.describe('Species Dependency', () => {
    test('weight inputs are only visible when a species is selected', async ({ speciesSelectionPage }) => {
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();

      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
    });

    test('deselecting a species hides its weight fields', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();

      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();
    });
  });

  test.describe('Species-Level Recording', () => {
    test('weights entered for one species do not affect another species', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '200');

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toHaveValue('100');
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('200');
    });

    test('multiple species can each have all three weight types independently', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10', '5');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '200', '20', '8');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.errorSummary()).toBeHidden();
    });
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
