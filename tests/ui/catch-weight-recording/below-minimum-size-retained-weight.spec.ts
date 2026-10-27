import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
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
});
