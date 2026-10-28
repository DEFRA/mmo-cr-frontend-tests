import { expect, test } from '../../../fixtures/commonfixture';

const accountPath = '/account';

test.describe('Favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount();
  });

  test.describe('View favourites', () => {
    test('account page groups favourites into ports, gear and species with add and remove links', async ({
      accountPage
    }) => {
      for (const key of ['Ports used', 'Gear onboard', 'Species caught']) {
        await expect(accountPage.summaryRow(key)).toBeVisible();
      }
      await expect(accountPage.addPortLink()).toBeVisible();
      await expect(accountPage.removePortLink()).toBeVisible();
      await expect(accountPage.addGearLink()).toBeVisible();
      await expect(accountPage.removeGearLink()).toBeVisible();
      await expect(accountPage.addSpeciesLink()).toBeVisible();
      await expect(accountPage.removeSpeciesLink()).toBeVisible();
    });
  });
});
