import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
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
});
