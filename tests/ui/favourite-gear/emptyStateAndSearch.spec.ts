import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords();
  });

  test.describe('Empty State and Search', () => {
    test.beforeEach(async ({ favouritesFlow }) => {
      await favouritesFlow.setupFavouriteGears(['Pots']);
    });

    test(
      'Verify User Can Remove All Favourite Gears',
      { tag: ['@ui', '@regression', '@favouriteGear'] },
      async ({ accountPage, removeGearPage }) => {
        await test.step('Scenario: Verify User Can Remove All Favourite Gears', async () => {
          await accountPage.clickRemoveGear();
          await removeGearPage.gearCheckboxes().first().waitFor();
          for (const checkbox of await removeGearPage.gearCheckboxes().all()) {
            await checkbox.check();
          }
          await removeGearPage.clickContinue();

          await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
          await expect(accountPage.addGearLink()).toBeVisible();
        });
      }
    );

    test(
      'Verify Removed Gear is Available Through Normal Gear Search',
      { tag: ['@ui', '@regression', '@favouriteGear'] },
      async ({ accountPage, addGearPage, favouritesFlow, gearFlow }) => {
        await test.step('Scenario: Verify Removed Gear is Available Through Normal Gear Search', async () => {
          await favouritesFlow.removeGears('Pots');
          await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');

          await accountPage.clickAddGear();
          await expect(addGearPage.pageHeading()).toBeVisible();

          await gearFlow.saveGearFromAddPage('Pots');

          await expect(accountPage.gearOnboardValue()).toContainText('Pots');
        });
      }
    );
  });
});
