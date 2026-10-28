import { expect, test } from '../../../fixtures/commonfixture';
import { email, password, setupFavouriteGears, removeGears } from './helpers';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords({ email, password });
  });

  test.describe('Empty State and Search', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Pots']);
    });

    test('Verify User Can Remove All Favourite Gears', async ({ accountPage, removeGearPage }) => {
      await accountPage.clickRemoveGear();
      await removeGearPage.gearCheckboxes().first().waitFor();
      for (const checkbox of await removeGearPage.gearCheckboxes().all()) {
        await checkbox.check();
      }
      await removeGearPage.clickContinue();

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
      await expect(accountPage.addGearLink()).toBeVisible();
    });

    test('Verify Removed Gear is Available Through Normal Gear Search', async ({
      accountPage,
      removeGearPage,
      addGearPage
    }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');

      await accountPage.clickAddGear();
      await expect(addGearPage.pageHeading()).toBeVisible();

      await addGearPage.searchAndSelectGear('Pots');
      await addGearPage.clickSaveAndContinue();

      await expect(accountPage.gearOnboardValue()).toContainText('Pots');
    });
  });
});
