import { expect } from '../../../fixtures/commonfixture';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';

export class GearFlow {
  static async findGear(
    addGearPage: AddGearPage,
    searchTerm: string,
    matches: (name: string) => boolean
  ): Promise<string> {
    const gearName = (await addGearPage.searchGearOptions(searchTerm)).find(matches);
    if (!gearName) throw new Error(`No gear option matched search term "${searchTerm}"`);
    return gearName;
  }

  static async selectLineGear(addGearPage: AddGearPage): Promise<string> {
    const gearName = await this.findGear(addGearPage, 'lo', (name) => /line/i.test(name));
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading()).toBeVisible();
    return gearName;
  }

  static async saveLineGear(addGearPage: AddGearPage): Promise<string> {
    const gearName = await this.selectLineGear(addGearPage);
    for (const input of await addGearPage.measurementInputs().all()) {
      await input.fill('1');
    }
    await addGearPage.clickSaveAndContinue();
    await addGearPage.expectUrl(/\/account$/);
    return gearName;
  }

  static async savePots(addGearPage: AddGearPage, gearDimension: string): Promise<void> {
    await addGearPage.searchAndSelectGear('Pots');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading('pots')).toBeVisible();
    await addGearPage.gearDimensionInput().fill(gearDimension);
    await addGearPage.clickSaveAndContinue();
    await addGearPage.expectUrl(/\/account$/);
  }

  static async saveGearFromAddPage(addGearPage: AddGearPage, gearName: string): Promise<void> {
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();

    if (await addGearPage.measurementsHeading().isVisible()) {
      for (const input of await addGearPage.measurementInputs().all()) {
        await input.fill('1');
      }
      await addGearPage.clickSaveAndContinue();
    }
  }

  static async removeSavedGears(
    accountPage: AccountPage,
    removeGearPage: RemoveGearPage,
    gearNames: string[]
  ): Promise<void> {
    await accountPage.goto('/account');
    const gearText = await accountPage.getGearOnboardText();
    const present = gearNames.filter((name) => gearText.includes(name));
    if (present.length === 0) return;

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(...present);
    await removeGearPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
  }
}
