import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords();
  });

  test.describe('Journey Integration', () => {
    test.beforeEach(async ({ favouritesFlow }) => {
      await favouritesFlow.setupFavouriteGears(['Dredge', 'Pots']);
    });

    test('Verify Removed Gear is Not Displayed in New Catch Record Journey', async ({
      accountPage,
      favouritesFlow,
      gearSelectionPage
    }) => {
      await favouritesFlow.removeGears('Dredge');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Dredge');

      await gearSelectionPage.goto('/gear-selection');

      await expect(gearSelectionPage.pageHeading()).toBeVisible();
      await expect(gearSelectionPage.gearCheckbox('Dredge')).toBeHidden();
    });

    test('Verify Remaining Favourite Gears Are Usable', async ({ accountPage, favouritesFlow, gearSelectionPage }) => {
      await favouritesFlow.removeGears('Dredge');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Dredge');

      await gearSelectionPage.goto('/gear-selection');

      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeVisible();
      await gearSelectionPage.selectGear('Pots');
      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeChecked();
    });
  });
});
