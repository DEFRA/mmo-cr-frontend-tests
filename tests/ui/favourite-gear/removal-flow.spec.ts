import { expect, test } from '../../../fixtures/commonfixture';
import { email, password, setupFavouriteGears, removeGears } from './helpers';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ signInPage, recordsPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccountFromRecords(signInPage, recordsPage, accountPage, { email, password });
  });

  test.describe('Removal Flow', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Pots', 'Traps']);
    });

    test('Verify Remove Gear Page Lists Saved Gears', async ({ accountPage, removeGearPage }) => {
      await accountPage.clickRemoveGear();

      await expect(removeGearPage.pageHeading()).toBeVisible();
      await expect(removeGearPage.gearCheckbox('Pots')).not.toBeChecked();
      await expect(removeGearPage.gearCheckbox('Traps')).not.toBeChecked();
    });

    test('Verify Successful Removal of Single Favourite Gear', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');

      await expect(accountPage.pageHeading()).toBeVisible();
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });

    test('Verify One Favourite Removal from Multiple Saved Gears', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
      await expect(accountPage.gearOnboardValue()).toContainText('Traps');
    });

    test('Verify Removed Gear Does Not Reappear After Page Refresh', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');

      await accountPage.page.reload();

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });
  });
});
