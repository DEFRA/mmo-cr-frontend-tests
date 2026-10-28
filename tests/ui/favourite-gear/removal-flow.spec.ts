import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourite Gear Management (Account Page)', () => {
  const traps = 'Traps (not specified)';

  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords();
  });

  test.describe('Removal Flow', () => {
    test.beforeEach(async ({ favouritesFlow }) => {
      await favouritesFlow.setupFavouriteGears(['Pots', traps]);
    });

    test('Verify Remove Gear Page Lists Saved Gears', async ({ accountPage, removeGearPage }) => {
      await accountPage.clickRemoveGear();

      await expect(removeGearPage.pageHeading()).toBeVisible();
      await expect(removeGearPage.gearCheckbox('Pots')).not.toBeChecked();
      await expect(removeGearPage.gearCheckbox(traps)).not.toBeChecked();
    });

    test('Verify Successful Removal of Single Favourite Gear', async ({ accountPage, favouritesFlow }) => {
      await favouritesFlow.removeGears('Pots');

      await expect(accountPage.pageHeading()).toBeVisible();
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });

    test('Verify One Favourite Removal from Multiple Saved Gears', async ({ accountPage, favouritesFlow }) => {
      await favouritesFlow.removeGears('Pots');

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
      await expect(accountPage.gearOnboardValue()).toContainText(traps);
    });

    test('Verify Removed Gear Does Not Reappear After Page Refresh', async ({ accountPage, favouritesFlow }) => {
      await favouritesFlow.removeGears('Pots');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');

      await accountPage.page.reload();

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });
  });
});
