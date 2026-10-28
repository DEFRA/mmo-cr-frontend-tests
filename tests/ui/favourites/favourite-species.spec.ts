import { expect, test } from '../../../fixtures/commonfixture';

const accountPath = '/account';

test.describe('Favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount();
  });

  test.describe('Favourite species', () => {
    test('adds a species from the approved list to favourites', async ({ accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await expect(addSpeciesPage.speciesOption('European plaice (PLE)')).toHaveCount(1);
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');
    });

    test('blocks a duplicate favourite species with an informative message', async ({
      page,
      accountPage,
      addSpeciesPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await expect(addSpeciesPage.speciesOption('Atlantic cod (COD)')).toHaveCount(0);
      await addSpeciesPage.speciesInput().fill('Atlantic cod (COD)');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('This species has already been added.');
      await page.goto(accountPath);
      const species = await accountPage.speciesCaughtValue().innerText();
      expect(species.split('Atlantic cod (COD)')).toHaveLength(2);
    });

    test('rejects a species that is not in the reference data', async ({ accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('Not a fish');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('Select a species to add');
      await addSpeciesPage.expectUrl(/\/add-species/);
    });

    test('requires a species to be selected before removing', async ({ accountPage, removeSpeciesPage }) => {
      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(removeSpeciesPage.errorSummary()).toContainText('Select the species you want to remove');
    });

    test('removes a favourite species from the account', async ({ accountPage, addSpeciesPage, removeSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');

      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.selectSpeciesToRemove('European plaice (PLE)');
      await removeSpeciesPage.clickSaveAndContinue();

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).not.toContainText('European plaice (PLE)');
    });

    test('shows favourite species on the catch record species page', async ({
      page,
      accountPage,
      addSpeciesPage,
      speciesSelectionPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      const favourites = (await accountPage.speciesCaughtValue().innerText())
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await page.goto('/species-selection');
      for (const species of favourites) {
        await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
      }
      await expect(speciesSelectionPage.addSpeciesLink()).toBeVisible();
    });
  });
});
