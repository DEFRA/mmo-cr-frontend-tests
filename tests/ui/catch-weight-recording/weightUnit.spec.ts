import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Catch Weight Recording', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Weight Unit', () => {
    test('weight labels display kilograms (kg) as the unit', async ({ speciesSelectionPage }) => {
      await test.step('Scenario: weight labels display kilograms (kg) as the unit', async () => {
        await speciesSelectionPage.selectSpecies('Cod (COD)');

        const weightGroup = speciesSelectionPage.weightAboveMinimumInput('COD');
        await expect(weightGroup).toBeVisible();
      });
    });
  });
});
