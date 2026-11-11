import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Below Minimum Size Retained Weight', () => {
    test(
      'below-minimum weight is optional and can be left empty',
      { tag: ['@ui', '@regression', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: below-minimum weight is optional and can be left empty', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '100');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );

    test(
      'below-minimum weight can be recorded alongside above-minimum',
      { tag: ['@ui', '@smoke', '@catchWeightRecording'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: below-minimum weight can be recorded alongside above-minimum', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.errorSummary()).toBeHidden();
        });
      }
    );
  });
});
