import { expect, test } from '../../fixtures/commonfixture';
import { type AccountPage } from '../../pages/accountPage';
import { type AddGearPage } from '../../pages/addGearPage';
import { type RemoveGearPage } from '../../pages/removeGearPage';

const email = process.env.CATCH_RECORDING_EMAIL ?? 'test@example.com';
const password = process.env.CATCH_RECORDING_PASSWORD ?? 'password';

const setupFavouriteGears = async (accountPage: AccountPage, addGearPage: AddGearPage, gears: string[]) => {
  for (const gear of gears) {
    if ((await accountPage.getGearOnboardText()).includes(gear)) continue;
    await accountPage.clickAddGear();
    await addGearPage.searchAndSelectGear(gear);
    await addGearPage.clickSaveAndContinue();
    await expect(accountPage.gearOnboardValue()).toContainText(gear);
  }
};

const removeGears = async (accountPage: AccountPage, removeGearPage: RemoveGearPage, ...gears: string[]) => {
  await accountPage.clickRemoveGear();
  await removeGearPage.selectGearToRemove(...gears);
  await removeGearPage.clickContinue();
};

test.describe('Favourite Gear Management (Account Page)', () => {
  // All tests share one account's gear list, so parallel runs would interfere
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ signInPage, recordsPage, accountPage }) => {
    await signInPage.goto('/sign-in');
    await signInPage.login(email, password);
    await recordsPage.topMenu.yourAccount().click();
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
  });

  test('TS01 - Verify Favourite Gear List is Displayed', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.gearOnboardValue()).toBeVisible();
  });

  test('TS02 - Verify Remove Option is Available for Favourite Gear', async ({ accountPage }) => {
    await expect(accountPage.removeGearLink()).toBeVisible();
  });

  test.describe('Removal Flow', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Pots', 'Traps']);
    });

    test('TS03 - Verify Remove Gear Page Lists Saved Gears', async ({ accountPage, removeGearPage }) => {
      await accountPage.clickRemoveGear();

      await expect(removeGearPage.pageHeading()).toBeVisible();
      await expect(removeGearPage.gearCheckbox('Pots')).not.toBeChecked();
      await expect(removeGearPage.gearCheckbox('Traps')).not.toBeChecked();
    });

    test('TS04 - Verify Successful Removal of Single Favourite Gear', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');

      await expect(accountPage.pageHeading()).toBeVisible();
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });

    test('TS06 - Verify One Favourite Removal from Multiple Saved Gears', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
      await expect(accountPage.gearOnboardValue()).toContainText('Traps');
    });

    test('TS07 - Verify Removed Gear Does Not Reappear After Page Refresh', async ({ accountPage, removeGearPage }) => {
      await removeGears(accountPage, removeGearPage, 'Pots');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');

      await accountPage.page.reload();

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
    });
  });

  test.describe('Journey Integration', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Dredge', 'Pots']);
    });

    test('TS08 - Verify Removed Gear is Not Displayed in New Catch Record Journey', async ({
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

    test('TS09 - Verify Remaining Favourite Gears Are Usable', async ({
      accountPage,
      removeGearPage,
      gearSelectionPage
    }) => {
      await removeGears(accountPage, removeGearPage, 'Dredge');
      await expect(accountPage.gearOnboardValue()).not.toContainText('Dredge');

      await gearSelectionPage.goto('/gear-selection');

      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeVisible();
      await gearSelectionPage.selectGear('Pots');
      await expect(gearSelectionPage.gearCheckbox('Pots')).toBeChecked();
    });
  });

  test.describe('Empty State and Search', () => {
    test.beforeEach(async ({ accountPage, addGearPage }) => {
      await setupFavouriteGears(accountPage, addGearPage, ['Pots']);
    });

    test('TS10 & TS12 - Verify User Can Remove All Favourite Gears', async ({ accountPage, removeGearPage }) => {
      await accountPage.clickRemoveGear();
      await removeGearPage.gearCheckboxes().first().waitFor();
      for (const checkbox of await removeGearPage.gearCheckboxes().all()) {
        await checkbox.check();
      }
      await removeGearPage.clickContinue();

      await expect(accountPage.gearOnboardValue()).not.toContainText('Pots');
      await expect(accountPage.addGearLink()).toBeVisible();
    });

    test('TS11 - Verify Removed Gear is Available Through Normal Gear Search', async ({
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
