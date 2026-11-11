import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Error Messages', () => {
    test(
      'error summary is displayed at the top of the page on validation failure',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: error summary is displayed at the top of the page on validation failure', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'inline error message appears next to the weight field on validation failure',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: inline error message appears next to the weight field on validation failure', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
        });
      }
    );

    test(
      'error summary contains links that focus the relevant weight field',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: error summary contains links that focus the relevant weight field', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.clickSaveAndContinue();

          const errorLinks = speciesSelectionPage.errorSummaryLinks();
          await expect(errorLinks.first()).toBeVisible();
        });
      }
    );

    test(
      'multiple validation errors are all displayed simultaneously',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: multiple validation errors are all displayed simultaneously', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.selectSpecies('Haddock (HAD)');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
          await expect(speciesSelectionPage.weightAboveMinimumError('HAD')).toBeVisible();
        });
      }
    );
  });
});
