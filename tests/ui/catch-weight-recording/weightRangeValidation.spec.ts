import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Weight Range Validation', () => {
    test(
      'weight of 0 is rejected',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 0 is rejected', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '0');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'negative weight is rejected',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: negative weight is rejected', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '-5');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'weight of 0.1 (just above 0) is accepted',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 0.1 (just above 0) is accepted', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '0.1');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );

    test(
      'weight of 10000 (upper boundary) is accepted',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 10000 (upper boundary) is accepted', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '10000');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );

    test(
      'weight of 10001 (above upper boundary) is rejected',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 10001 (above upper boundary) is rejected', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '10001');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'weight of 10000.1 (above upper boundary with decimal) is rejected',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 10000.1 (above upper boundary with decimal) is rejected', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '10000.1');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'weight of 1 (valid minimum) is accepted',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 1 (valid minimum) is accepted', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '1');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );

    test(
      'weight of 9999.9 (just below upper boundary) is accepted',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: weight of 9999.9 (just below upper boundary) is accepted', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '9999.9');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );
  });
});
