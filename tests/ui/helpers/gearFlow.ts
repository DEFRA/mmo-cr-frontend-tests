import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';

export class GearFlow {
  constructor(
    private readonly pages: { addGearPage: AddGearPage; accountPage: AccountPage; removeGearPage: RemoveGearPage }
  ) {}

  async findGear(searchTerm: string, matches: (name: string) => boolean): Promise<string> {
    const { addGearPage } = this.pages;

    const gearName = (await addGearPage.searchGearOptions(searchTerm)).find(matches);
    if (!gearName) throw new Error(`No gear option matched search term "${searchTerm}"`);
    return gearName;
  }

  async selectLineGear(): Promise<string> {
    const { addGearPage } = this.pages;

    const gearName = await this.findGear('lo', (name) => /line/i.test(name));
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading()).toBeVisible();
    return gearName;
  }

  async saveLineGear(): Promise<string> {
    const { addGearPage } = this.pages;

    const gearName = await this.selectLineGear();
    for (const input of await addGearPage.measurementInputs().all()) {
      await input.fill('1');
    }
    await addGearPage.clickSaveAndContinue();
    await addGearPage.expectUrl(/\/account$/);
    return gearName;
  }

  async savePots(gearDimension: string): Promise<void> {
    const { addGearPage } = this.pages;

    await addGearPage.searchAndSelectGear('Pots');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading('pots')).toBeVisible();
    await addGearPage.gearDimensionInput().fill(gearDimension);
    await addGearPage.clickSaveAndContinue();
    await addGearPage.expectUrl(/\/account$/);
  }

  async saveGearFromAddPage(gearName: string): Promise<void> {
    const { addGearPage } = this.pages;

    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();

    if (await addGearPage.measurementsHeading().isVisible()) {
      for (const input of await addGearPage.measurementInputs().all()) {
        await input.fill('1');
      }
      await addGearPage.clickSaveAndContinue();
    }
  }

  async removeSavedGears(gearNames: string[]): Promise<void> {
    const { accountPage, removeGearPage } = this.pages;

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
