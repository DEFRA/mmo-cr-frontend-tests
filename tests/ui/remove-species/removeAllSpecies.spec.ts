import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Remove All Species', () => {
    test(
      'removing all species redirects to the Add Species page',
      { tag: ['@ui', '@regression', '@removeSpecies'] },
      async ({ speciesSelectionPage, removeSpeciesPage, addSpeciesPage }) => {
        await test.step('Scenario: removing all species redirects to the Add Species page', async () => {
          await speciesSelectionPage.clickRemoveSpecies();
          await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
          await removeSpeciesPage.clickSaveAndContinue();
          await expect(addSpeciesPage.pageHeading()).toBeVisible();
        });
      }
    );

    test(
      'user cannot continue from Add Species page without adding a species',
      { tag: ['@ui', '@regression', '@removeSpecies'] },
      async ({ addSpeciesPage }) => {
        await test.step('Scenario: user cannot continue from Add Species page without adding a species', async () => {
          await addSpeciesPage.clickSaveAndContinue();

          await expect(addSpeciesPage.pageHeading()).toBeVisible();
        });
      }
    );

    test(
      'after removing all species, adding a new species allows continuation',
      { tag: ['@ui', '@smoke', '@removeSpecies'] },
      async ({ speciesSelectionPage, removeSpeciesPage, addSpeciesPage }) => {
        await test.step('Scenario: after removing all species, adding a new species allows continuation', async () => {
          await speciesSelectionPage.clickRemoveSpecies();
          await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
          await removeSpeciesPage.clickSaveAndContinue();

          await expect(addSpeciesPage.pageHeading()).toBeVisible();

          const speciesCheckboxes = await speciesSelectionPage.speciesCheckboxes().all();
          for (const checkbox of speciesCheckboxes) {
            await checkbox.check();
          }
          await addSpeciesPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.pageHeading()).toBeVisible();
        });
      }
    );
  });
});
