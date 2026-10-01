import { expect, test } from '../../fixtures/commonfixture';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ speciesSelectionPage }) => {
    await speciesSelectionPage.goto('/species-selection');
  });

  test.describe('Species Removal', () => {
    test('removing a species removes its associated catch-weight information', async ({
      speciesSelectionPage,
      removeSpeciesPage,
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toBeVisible();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.speciesCheckbox('Cod (COD)')).toBeHidden();
      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();
    });

    test('removing a species clears below-minimum and discarded weights too', async ({
      speciesSelectionPage,
      removeSpeciesPage,
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100', '10', '5');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightBelowMinimumInput('COD')).toBeVisible();
      await expect(speciesSelectionPage.weightDiscardedInput('COD')).toBeVisible();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeHidden();
      await expect(speciesSelectionPage.weightBelowMinimumInput('COD')).toBeHidden();
      await expect(speciesSelectionPage.weightDiscardedInput('COD')).toBeHidden();
    });
  });

  test.describe('Species Persistence', () => {
    test('remaining species are still displayed after removing another species', async ({
      speciesSelectionPage,
      removeSpeciesPage,
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.selectSpecies('Salmon (SAL)');
      await speciesSelectionPage.enterSpeciesWeights('SAL', '25');
      await speciesSelectionPage.saveAndReturn();

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.speciesCheckbox('Haddock (HAD)')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toBeVisible();
      await expect(speciesSelectionPage.speciesCheckbox('Salmon (SAL)')).toBeVisible();
      await expect(speciesSelectionPage.weightAboveMinimumInput('SAL')).toBeVisible();

      await expect(speciesSelectionPage.speciesCheckbox('Cod (COD)')).toBeHidden();
    });

    test('weight data for remaining species is preserved after a removal', async ({
      speciesSelectionPage,
      removeSpeciesPage,
    }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.selectSpecies('Haddock (HAD)');
      await speciesSelectionPage.enterSpeciesWeights('HAD', '50');
      await speciesSelectionPage.saveAndReturn();

      await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toHaveValue('100');
      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('50');

      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.weightAboveMinimumInput('HAD')).toHaveValue('50');
    });
  });

  test.describe('Remove All Species', () => {
    test('removing all species redirects to the Add Species page', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage,
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();
      await addSpeciesPage.page.waitForTimeout(1000);
      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });

    test('user cannot continue from Add Species page without adding a species', async ({ addSpeciesPage }) => {
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });

    test('after removing all species, adding a new species allows continuation', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage,
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();

      const speciesCheckboxes = await addSpeciesPage.page.getByRole('checkbox').all();
      for (const checkbox of speciesCheckboxes) {
        await checkbox.check();
      }
      await addSpeciesPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeVisible();
    });
  });

  test.describe('Minimum Species Requirement', () => {
    test('Save and continue is blocked when no species are selected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeVisible();
    });

    test('catch record proceeds when at least one species is selected', async ({ speciesSelectionPage }) => {
      await speciesSelectionPage.selectSpecies('Cod (COD)');
      await speciesSelectionPage.enterSpeciesWeights('COD', '100');
      await speciesSelectionPage.clickSaveAndContinue();

      await expect(speciesSelectionPage.pageHeading()).toBeHidden();
    });

    test('removing species down to zero prevents continuation from species selection', async ({
      speciesSelectionPage,
      removeSpeciesPage,
      addSpeciesPage,
    }) => {
      await speciesSelectionPage.clickRemoveSpecies();
      await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.pageHeading()).toBeVisible();
    });
  });
});
