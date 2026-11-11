import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Remove Species', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openSpeciesSelection();
  });

  test.describe('Minimum Species Requirement', () => {
    test(
      'Save and continue is blocked when no species are selected',
      { tag: ['@ui', '@regression', '@removeSpecies'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: Save and continue is blocked when no species are selected', async () => {
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.pageHeading()).toBeVisible();
        });
      }
    );

    test(
      'catch record proceeds when at least one species is selected',
      { tag: ['@ui', '@smoke', '@removeSpecies'] },
      async ({ speciesSelectionPage }) => {
        await test.step('Scenario: catch record proceeds when at least one species is selected', async () => {
          await speciesSelectionPage.selectSpecies('Cod (COD)');
          await speciesSelectionPage.enterSpeciesWeights('COD', '100');
          await speciesSelectionPage.clickSaveAndContinue();

          await expect(speciesSelectionPage.pageHeading()).toBeHidden();
        });
      }
    );

    test(
      'removing species down to zero prevents continuation from species selection',
      { tag: ['@ui', '@regression', '@removeSpecies'] },
      async ({ speciesSelectionPage, removeSpeciesPage, addSpeciesPage }) => {
        await test.step('Scenario: removing species down to zero prevents continuation from species selection', async () => {
          await speciesSelectionPage.clickRemoveSpecies();
          await removeSpeciesPage.selectSpeciesToRemove('Cod (COD)');
          await removeSpeciesPage.clickSaveAndContinue();

          await expect(addSpeciesPage.pageHeading()).toBeVisible();
        });
      }
    );
  });
});
