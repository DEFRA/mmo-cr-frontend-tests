import { expect } from '../../../fixtures/commonfixture';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';

export const email = process.env.CATCH_RECORDING_EMAIL ?? 'test@example.com';
export const password = process.env.CATCH_RECORDING_PASSWORD ?? 'password';

export const setupFavouriteGears = async (accountPage: AccountPage, addGearPage: AddGearPage, gears: string[]) => {
  for (const gear of gears) {
    if ((await accountPage.getGearOnboardText()).includes(gear)) continue;
    await accountPage.clickAddGear();
    await addGearPage.searchAndSelectGear(gear);
    await addGearPage.clickSaveAndContinue();
    await expect(accountPage.gearOnboardValue()).toContainText(gear);
  }
};

export const removeGears = async (accountPage: AccountPage, removeGearPage: RemoveGearPage, ...gears: string[]) => {
  await accountPage.clickRemoveGear();
  await removeGearPage.selectGearToRemove(...gears);
  await removeGearPage.clickContinue();
};
