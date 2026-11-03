import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount();
  });

  test.describe('Favourite species', () => {
    test('adds a species from the approved list to favourites', async ({ accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.searchAndSelectSpecies('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');
    });

    test('blocks a duplicate favourite species with an informative message', async ({
      accountPage,
      addSpeciesPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.searchAndSelectSpecies('Atlantic cod (COD)');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('This species has already been added.');
      await accountPage.goto('/account');
      expect((await accountPage.getSpeciesCaught()).filter((s) => s === 'Atlantic cod (COD)')).toHaveLength(1);
    });

    test('rejects a species that is not in the reference data', async ({ accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('Not a fish');
      await expect(addSpeciesPage.noResultsMessage()).toBeVisible();
      await addSpeciesPage.speciesInput().press('Escape');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
      await addSpeciesPage.expectUrl(/\/add-species/);
    });

    test('requires a species to be selected before removing', async ({ accountPage, removeSpeciesPage }) => {
      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(removeSpeciesPage.errorSummary()).toContainText('Select the species you want to remove');
    });

    test('removes a favourite species from the account', async ({ accountPage, addSpeciesPage, removeSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.searchAndSelectSpecies('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');

      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.selectSpeciesToRemove('European plaice (PLE)');
      await removeSpeciesPage.clickSaveAndContinue();

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).not.toContainText('European plaice (PLE)');
    });

    test('shows favourite species on the catch record species page', async ({
      accountPage,
      addSpeciesPage,
      speciesSelectionPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.searchAndSelectSpecies('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      const favourites = await accountPage.getSpeciesCaught();

      await speciesSelectionPage.goto('/species-selection');
      for (const species of favourites) {
        await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
      }
      await expect(speciesSelectionPage.addSpeciesLink()).toBeVisible();
    });
  });
});
