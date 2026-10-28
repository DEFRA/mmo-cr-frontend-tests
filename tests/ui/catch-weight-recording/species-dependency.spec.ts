import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
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
});
