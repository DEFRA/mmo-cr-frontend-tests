/**
 * Record and amend catch weights for selected species in kilograms.
 * Covers required above-minimum weight, optional weights, persistence, and validation rules.
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, noFavourites } from '../helpers/catchRecordFlow';
import { catchSpecies, ports } from '../../../test-data/testData';

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

// Departure and return ports the journey saves as favourites; removed after each test unless already saved
const absentFavourites: Favourites = { ...noFavourites, ports: [ports.first, ports.third] };
const testFavourites: Favourites = { ...noFavourites, species: [catchSpecies.cod.name] };

test.describe('Species catch weight entry', () => {
  test.use({ testFavourites, absentFavourites });

  // Requesting createdRecords signs in, saves Cod and restores favourites and drafts after each test
  test.beforeEach(async ({ navigationFlow, createdRecords }) => {
    void createdRecords;
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
      await test.step(`The user selects ${catchSpecies.cod.name}`, async () => {
        await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
      });

      await test.step('The selected species and required weight field are displayed', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          'Species checkbox to be checked'
        ).toBeChecked();
        await expect(
          speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code),
          'Weight above minimum input to be visible'
        ).toBeVisible();
        await expect(
          speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code),
          'Weight above minimum input to be editable'
        ).toBeEditable();
      });

      await test.step('The optional weight fields are initially hidden', async () => {
        await expect(
          speciesSelectionPage.weightBelowMinimumInput(catchSpecies.cod.code),
          'Weight below minimum input to be hidden'
        ).toBeHidden();
        await expect(
          speciesSelectionPage.weightDiscardedInput(catchSpecies.cod.code),
          'Weight discarded input to be hidden'
        ).toBeHidden();
      });

      await test.step('The user reveals the optional weight fields', async () => {
        await speciesSelectionPage.addWeightBelowMinimumLink(catchSpecies.cod.code).click();
        await speciesSelectionPage.addWeightDiscardedLink(catchSpecies.cod.code).click();
      });

      await test.step('The optional weight fields are displayed and editable', async () => {
        await expect(
          speciesSelectionPage.weightBelowMinimumInput(catchSpecies.cod.code),
          'Weight below minimum input to be visible'
        ).toBeVisible();
        await expect(
          speciesSelectionPage.weightBelowMinimumInput(catchSpecies.cod.code),
          'Weight below minimum input to be editable'
        ).toBeEditable();
        await expect(
          speciesSelectionPage.weightDiscardedInput(catchSpecies.cod.code),
          'Weight discarded input to be visible'
        ).toBeVisible();
        await expect(
          speciesSelectionPage.weightDiscardedInput(catchSpecies.cod.code),
          'Weight discarded input to be editable'
        ).toBeEditable();
      });
    }
  );

  test(
    'Preserves saved catch weights when the species page is reopened',
    { tag: ['@ui', '@smoke', '@catchWeightRecording'] },
    async ({ speciesSelectionPage, catchNotLandedPage }) => {
      await test.step(`The user selects ${catchSpecies.cod.name} and enters all three weights`, async () => {
        await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
        await speciesSelectionPage.enterSpeciesWeights(
          catchSpecies.cod.code,
          catchSpecies.weights.initial.aboveMinimum,
          catchSpecies.weights.initial.belowMinimum,
          catchSpecies.weights.initial.discarded
        );
      });

      await test.step('The user saves and continues', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The user returns to the species selection page', async () => {
        await catchNotLandedPage.expectOnPage();
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('The species and saved weights are displayed', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          'Species checkbox to be checked'
        ).toBeChecked();
        await expect(
          speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code),
          `Weight above minimum input to have value ${catchSpecies.weights.initial.aboveMinimum}`
        ).toHaveValue(catchSpecies.weights.initial.aboveMinimum);
        await expect(
          speciesSelectionPage.weightBelowMinimumInput(catchSpecies.cod.code),
          `Weight below minimum input to have value ${catchSpecies.weights.initial.belowMinimum}`
        ).toHaveValue(catchSpecies.weights.initial.belowMinimum);
        await expect(
          speciesSelectionPage.weightDiscardedInput(catchSpecies.cod.code),
          `Weight discarded input to have value ${catchSpecies.weights.initial.discarded}`
        ).toHaveValue(catchSpecies.weights.initial.discarded);
      });
    }
  );

  test(
    'Updates saved values when all catch weights are edited',
    { tag: ['@ui', '@regression', '@catchWeightRecording'] },
    async ({ speciesSelectionPage, catchNotLandedPage }) => {
      await test.step('The user has saved all three weights for Cod', async () => {
        await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
        await speciesSelectionPage.enterSpeciesWeights(
          catchSpecies.cod.code,
          catchSpecies.weights.initial.aboveMinimum,
          catchSpecies.weights.initial.belowMinimum,
          catchSpecies.weights.initial.discarded
        );
        await speciesSelectionPage.saveAndReturn();
      });

      await test.step('The user edits each weight', async () => {
        await speciesSelectionPage
          .weightAboveMinimumInput(catchSpecies.cod.code)
          .fill(catchSpecies.weights.edited.aboveMinimum);
        await speciesSelectionPage
          .weightBelowMinimumInput(catchSpecies.cod.code)
          .fill(catchSpecies.weights.edited.belowMinimum);
        await speciesSelectionPage
          .weightDiscardedInput(catchSpecies.cod.code)
          .fill(catchSpecies.weights.edited.discarded);
      });

      await test.step('The user saves the edited weights and returns to the species page', async () => {
        await speciesSelectionPage.clickSaveAndContinue();
        await catchNotLandedPage.expectOnPage();
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('The edited values are displayed', async () => {
        await expect(
          speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code),
          `Weight above minimum input to have value ${catchSpecies.weights.edited.aboveMinimum}`
        ).toHaveValue(catchSpecies.weights.edited.aboveMinimum);
        await expect(
          speciesSelectionPage.weightBelowMinimumInput(catchSpecies.cod.code),
          `Weight below minimum input to have value ${catchSpecies.weights.edited.belowMinimum}`
        ).toHaveValue(catchSpecies.weights.edited.belowMinimum);
        await expect(
          speciesSelectionPage.weightDiscardedInput(catchSpecies.cod.code),
          `Weight discarded input to have value ${catchSpecies.weights.edited.discarded}`
        ).toHaveValue(catchSpecies.weights.edited.discarded);
      });
    }
  );

  test(
    'Displays an error when a selected species has no above-minimum weight',
    { tag: ['@ui', '@regression', '@catchWeightRecording'] },
    async ({ speciesSelectionPage }) => {
      await test.step(`The user selects ${catchSpecies.cod.name} without entering an above-minimum weight`, async () => {
        await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The page shows the validation error for the required weight', async () => {
        await expect(speciesSelectionPage.errorSummary(), 'Error summary to be visible').toBeVisible();
        await expect(
          speciesSelectionPage.weightAboveMinimumError(catchSpecies.cod.code),
          'Weight above minimum error to be visible'
        ).toBeVisible();
      });
    }
  );

  for (const comparison of weightComparisonCases) {
    test(
      `${comparison.valid ? 'Accepts' : 'Rejects'} above-minimum weight when it is ${comparison.name}`,
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('The user enters above-minimum and discarded weights', async () => {
          await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
          await speciesSelectionPage.enterSpeciesWeights(
            catchSpecies.cod.code,
            comparison.aboveMinimum,
            undefined,
            comparison.discarded
          );
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows whether the weights satisfy the comparison rule', async () => {
          if (comparison.valid) {
            await expect(speciesSelectionPage.errorSummary(), 'Error summary to be hidden').toBeHidden();
          } else {
            await expect(speciesSelectionPage.errorSummary(), 'Error summary to be visible').toBeVisible();
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
          await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
          await speciesSelectionPage.enterSpeciesWeights(catchSpecies.cod.code, weightCase.value);
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page has no validation errors', async () => {
          await expect(speciesSelectionPage.errorSummary(), 'Error summary to be hidden').toBeHidden();
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
          await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
          await speciesSelectionPage.enterSpeciesWeights(catchSpecies.cod.code, weightCase.value);
          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows a validation error', async () => {
          await expect(speciesSelectionPage.errorSummary(), 'Error summary to be visible').toBeVisible();
          await expect(
            speciesSelectionPage.weightAboveMinimumError(catchSpecies.cod.code),
            'Weight above minimum error to be visible'
          ).toBeVisible();
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
          await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);

          if (optionalWeightCase.field === 'belowMinimum') {
            await speciesSelectionPage.enterSpeciesWeights(
              catchSpecies.cod.code,
              catchSpecies.weights.required,
              optionalWeightCase.value
            );
          } else {
            await speciesSelectionPage.enterSpeciesWeights(
              catchSpecies.cod.code,
              catchSpecies.weights.required,
              undefined,
              optionalWeightCase.value
            );
          }

          await speciesSelectionPage.clickSaveAndContinue();
        });

        await test.step('The page shows a validation error for the optional weight', async () => {
          await expect(speciesSelectionPage.errorSummary(), 'Error summary to be visible').toBeVisible();

          if (optionalWeightCase.field === 'belowMinimum') {
            await expect(
              speciesSelectionPage.weightBelowMinimumError(catchSpecies.cod.code),
              'Weight below minimum error to be visible'
            ).toBeVisible();
          } else {
            await expect(
              speciesSelectionPage.weightDiscardedError(catchSpecies.cod.code),
              'Weight discarded error to be visible'
            ).toBeVisible();
          }
        });
      }
    );
  }
});
