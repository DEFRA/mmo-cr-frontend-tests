import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await NavigationFlow.openSpeciesSelection(speciesSelectionPage);
  });

  test.describe('Weight Unit', () => {
    test('weight labels display kilograms (kg) as the unit', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');

      const weightGroup = speciesSelectionPage.weightAboveMinimumInput('COD');
      await expect(weightGroup).toBeVisible();
    });
  });
});
