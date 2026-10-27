import { expect, test } from '../../../fixtures/commonfixture';
import { email, password, setupFavouriteGears, removeGears } from './helpers';
import { NavigationFlow } from '../helpers/navigationFlow';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ signInPage, recordsPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccountFromRecords(signInPage, recordsPage, accountPage, { email, password });
  });

  test.describe('Journey Integration', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Dredge', 'Pots']);
    });

    test('Verify Removed Gear is Not Displayed in New Catch Record Journey', async ({
      accountPage,
      removeGearPage,
      gearSelectionPage
    }) => {
      await removeGears(accountPage, removeGearPage, 'Dredge');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Dredge');

      await gearSelectionPage.goto('/gear-selection');

      await expect(gearSelectionPage.pageHeading()).toBeVisible();
      await expect(gearSelectionPage.gearCheckbox('Dredge')).toBeHidden();
    });

    test('Verify Remaining Favourite Gears Are Usable', async ({ accountPage, removeGearPage, gearSelectionPage }) => {
      await removeGears(accountPage, removeGearPage, 'Dredge');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Dredge');

      await gearSelectionPage.goto('/gear-selection');

      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeVisible();
      await gearSelectionPage.selectGear('Pots');
      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeChecked();
    });
  });
});
