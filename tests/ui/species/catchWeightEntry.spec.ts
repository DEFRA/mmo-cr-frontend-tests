/**
 * Record and amend catch weights for selected species in kilograms.
 * Covers required above-minimum weight, optional weights, persistence, and validation rules.
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';

type Species = {
  name: string;
  code: string;
};

type WeightValidationCase = {
  name: string;
  value: string;
};

type WeightComparisonCase = {
  name: string;
  aboveMinimum: string;
  discarded: string;
  valid: boolean;
};

type OptionalWeightCase = {
  name: string;
  value: string;
  field: 'belowMinimum' | 'discarded';
};

const cod: Species = { name: 'Cod (COD)', code: 'COD' };

const initialWeights = { aboveMinimum: '100', belowMinimum: '10', discarded: '5' };
const editedWeights = { aboveMinimum: '120', belowMinimum: '15', discarded: '6' };
const requiredWeight = '100';

const validWeightCases: WeightValidationCase[] = [
  { name: 'a whole number', value: '1' },
  { name: 'one decimal place', value: '10.5' },
  { name: 'the value just above zero', value: '0.1' },
  { name: 'the maximum value', value: '10000' },
  { name: 'one decimal place below the maximum', value: '9999.9' }
];

const invalidWeightCases: WeightValidationCase[] = [
  { name: 'two decimal places', value: '10.55' },
  { name: 'zero', value: '0' },
  { name: 'a value over 10000', value: '10001' },
  { name: 'a negative value', value: '-5' },
  { name: 'nonnumeric input', value: 'abc' }
];

const weightComparisonCases: WeightComparisonCase[] = [
  { name: 'less than discarded weight', aboveMinimum: '5', discarded: '10', valid: false },
  { name: 'equal to discarded weight', aboveMinimum: '10', discarded: '10', valid: false },
  { name: 'greater than discarded weight', aboveMinimum: '100', discarded: '10', valid: true }
];

const invalidOptionalWeightCases: OptionalWeightCase[] = [
  { name: 'below-minimum weight', value: '5.55', field: 'belowMinimum' },
  { name: 'discarded weight', value: '5.55', field: 'discarded' }
];

test.describe('Species catch weight entry', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('The user is on the species selection page', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for catch weight UI tests'
      });
      await navigationFlow.openSpeciesSelectionForNewRecord();
    });
  });

  test(
    'Displays editable catch-weight fields when a species is selected',
    { tag: ['@ui', '@regression', '@catchWeightRecording'] },
    async ({ speciesSelectionPage }) => {
      await test.step(`The user selects ${cod.name}`, async () => {
        await speciesSelectionPage.selectSpecies(cod.name);
      });

      await test.step('The selected species and required weight field are displayed', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(cod.name)).toBeChecked();
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toBeVisible();
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toBeEditable();
      });

      await test.step('The optional weight fields are initially hidden', async () => {
        await expect(speciesSelectionPage.weightBelowMinimumInput(cod.code)).toBeHidden();
        await expect(speciesSelectionPage.weightDiscardedInput(cod.code)).toBeHidden();
      });

      await test.step('The user reveals the optional weight fields', async () => {
        await speciesSelectionPage.addWeightBelowMinimumLink(cod.code).click();
        await speciesSelectionPage.addWeightDiscardedLink(cod.code).click();
      });

      await test.step('The optional weight fields are displayed and editable', async () => {
        await expect(speciesSelectionPage.weightBelowMinimumInput(cod.code)).toBeVisible();
        await expect(speciesSelectionPage.weightBelowMinimumInput(cod.code)).toBeEditable();
        await expect(speciesSelectionPage.weightDiscardedInput(cod.code)).toBeVisible();
        await expect(speciesSelectionPage.weightDiscardedInput(cod.code)).toBeEditable();
      });
    }
  );

  test(
    'Preserves saved catch weights when the species page is reopened',
    { tag: ['@ui', '@smoke', '@catchWeightRecording'] },
    async ({ speciesSelectionPage }) => {
      await test.step(`The user selects ${cod.name} and enters all three weights`, async () => {
        await speciesSelectionPage.selectSpecies(cod.name);
        await speciesSelectionPage.enterSpeciesWeights(
          cod.code,
          initialWeights.aboveMinimum,
          initialWeights.belowMinimum,
          initialWeights.discarded
        );
      });

      await test.step('The user saves and continues', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The user returns to the species selection page', async () => {
        await speciesSelectionPage.expectUrl(/\/catch-not-landed$/);
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('The species and saved weights are displayed', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(cod.name)).toBeChecked();
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(initialWeights.aboveMinimum);
        await expect(speciesSelectionPage.weightBelowMinimumInput(cod.code)).toHaveValue(initialWeights.belowMinimum);
        await expect(speciesSelectionPage.weightDiscardedInput(cod.code)).toHaveValue(initialWeights.discarded);
      });
    }
  );

  test(
    'Updates saved values when all catch weights are edited',
    { tag: ['@ui', '@regression', '@catchWeightRecording'] },
    async ({ speciesSelectionPage }) => {
      await test.step('The user has saved all three weights for Cod', async () => {
        await speciesSelectionPage.selectSpecies(cod.name);
        await speciesSelectionPage.enterSpeciesWeights(
          cod.code,
          initialWeights.aboveMinimum,
          initialWeights.belowMinimum,
          initialWeights.discarded
        );
        await speciesSelectionPage.saveAndReturn();
      });

      await test.step('The user edits each weight', async () => {
        await speciesSelectionPage.weightAboveMinimumInput(cod.code).fill(editedWeights.aboveMinimum);
        await speciesSelectionPage.weightBelowMinimumInput(cod.code).fill(editedWeights.belowMinimum);
        await speciesSelectionPage.weightDiscardedInput(cod.code).fill(editedWeights.discarded);
      });

      await test.step('The user saves the edited weights and returns to the species page', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
        await speciesSelectionPage.expectUrl(/\/catch-not-landed$/);
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('The edited values are displayed', async () => {
        await expect(speciesSelectionPage.weightAboveMinimumInput(cod.code)).toHaveValue(editedWeights.aboveMinimum);
        await expect(speciesSelectionPage.weightBelowMinimumInput(cod.code)).toHaveValue(editedWeights.belowMinimum);
        await expect(speciesSelectionPage.weightDiscardedInput(cod.code)).toHaveValue(editedWeights.discarded);
      });
    }
  );

  test(
    'Displays an error when a selected species has no above-minimum weight',
    { tag: ['@ui', '@regression', '@catchWeightRecording'] },
    async ({ speciesSelectionPage }) => {
      await test.step(`The user selects ${cod.name} without entering an above-minimum weight`, async () => {
        await speciesSelectionPage.selectSpecies(cod.name);
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The page shows the validation error for the required weight', async () => {
        await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        await expect(speciesSelectionPage.weightAboveMinimumError(cod.code)).toBeVisible();
      });
    }
  );

  for (const comparison of weightComparisonCases) {
    test(
      `${comparison.valid ? 'Accepts' : 'Rejects'} above-minimum weight when it is ${comparison.name}`,
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('The user enters above-minimum and discarded weights', async () => {
          await speciesSelectionPage.selectSpecies(cod.name);
          await speciesSelectionPage.enterSpeciesWeights(
            cod.code,
            comparison.aboveMinimum,
            undefined,
            comparison.discarded
          );
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows whether the weights satisfy the comparison rule', async () => {
          if (comparison.valid) {
            await expect(speciesSelectionPage.errorSummary()).toBeHidden();
          } else {
            await expect(speciesSelectionPage.errorSummary()).toBeVisible();
          }
        });
      }
    );
  }

  for (const weightCase of validWeightCases) {
    test(
      `Accepts above-minimum weight with ${weightCase.name}`,
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('The user enters the weight and saves', async () => {
          await speciesSelectionPage.selectSpecies(cod.name);
          await speciesSelectionPage.enterSpeciesWeights(cod.code, weightCase.value);
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page has no validation errors', async () => {
          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );
  }

  for (const weightCase of invalidWeightCases) {
    test(
      `Rejects above-minimum weight with ${weightCase.name}`,
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('The user enters the weight and saves', async () => {
          await speciesSelectionPage.selectSpecies(cod.name);
          await speciesSelectionPage.enterSpeciesWeights(cod.code, weightCase.value);
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows a validation error', async () => {
          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
          await expect(speciesSelectionPage.weightAboveMinimumError(cod.code)).toBeVisible();
        });
      }
    );
  }

  for (const optionalWeightCase of invalidOptionalWeightCases) {
    test(
      `Rejects optional ${optionalWeightCase.name} when it has two decimal places`,
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('The user enters the optional weight and saves', async () => {
          await speciesSelectionPage.selectSpecies(cod.name);

          if (optionalWeightCase.field === 'belowMinimum') {
            await speciesSelectionPage.enterSpeciesWeights(cod.code, requiredWeight, optionalWeightCase.value);
          } else {
            await speciesSelectionPage.enterSpeciesWeights(
              cod.code,
              requiredWeight,
              undefined,
              optionalWeightCase.value
            );
          }

          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows a validation error for the optional weight', async () => {
          await expect(speciesSelectionPage.errorSummary()).toBeVisible();

          if (optionalWeightCase.field === 'belowMinimum') {
            await expect(speciesSelectionPage.weightBelowMinimumError(cod.code)).toBeVisible();
          } else {
            await expect(speciesSelectionPage.weightDiscardedError(cod.code)).toBeVisible();
          }
        });
      }
    );
  }
});
