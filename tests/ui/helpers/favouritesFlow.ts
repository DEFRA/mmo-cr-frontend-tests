import { expect } from '../../../fixtures/commonfixture';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';
import { type RemovePortPage } from '../../../pages/removePortPage';
import { type RemoveSpeciesPage } from '../../../pages/removeSpeciesPage';
import { GearFlow } from './gearFlow';

export class FavouritesFlow {
  static async addSpeciesToAccount(
    accountPage: AccountPage,
    addSpeciesPage: AddSpeciesPage,
    speciesName: string
  ): Promise<void> {
    await accountPage.addSpeciesLink().click();
    await expect(accountPage.page).toHaveURL(/\/add-species\?return=\/account$/);
    await addSpeciesPage.searchAndSelectSpecies(speciesName);
    await addSpeciesPage.clickSaveAndContinue();
    await accountPage.expectUrl(/\/account$/);
  }

  static async ensureSpeciesAdded(
    accountPage: AccountPage,
    addSpeciesPage: AddSpeciesPage,
    speciesName: string
  ): Promise<void> {
    const savedSpecies = (await accountPage.speciesCaughtValue().textContent()) ?? '';
    if (!savedSpecies.includes(speciesName)) {
      await this.addSpeciesToAccount(accountPage, addSpeciesPage, speciesName);
    }
  }

  static async removeSpeciesFromAccount(
    accountPage: AccountPage,
    removeSpeciesPage: RemoveSpeciesPage,
    speciesName: string
  ): Promise<void> {
    const savedSpecies = (await accountPage.speciesCaughtValue().textContent()) ?? '';
    if (!savedSpecies.includes(speciesName)) return;

    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.selectSpeciesToRemove(speciesName);
    await removeSpeciesPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
  }

  static async addGearToAccount(accountPage: AccountPage, addGearPage: AddGearPage, gearName: string): Promise<void> {
    await accountPage.clickAddGear();
    await GearFlow.saveGearFromAddPage(addGearPage, gearName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  }

  static async ensureGearAdded(accountPage: AccountPage, addGearPage: AddGearPage, gearName: string): Promise<void> {
    if (!(await accountPage.getGearOnboardText()).includes(gearName)) {
      await this.addGearToAccount(accountPage, addGearPage, gearName);
    }
  }

  static async removeGearFromAccount(
    accountPage: AccountPage,
    removeGearPage: RemoveGearPage,
    gearName: string
  ): Promise<void> {
    if (!(await accountPage.getGearOnboardText()).includes(gearName)) return;

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(gearName);
    await removeGearPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
  }

  static async addPortToAccount(accountPage: AccountPage, addPortPage: AddPortPage, portName: string): Promise<void> {
    await accountPage.addPortLink().click();
    await expect(accountPage.page).toHaveURL(/\/add-port/);
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.portsUsedValue()).toContainText(portName);
  }

  static async ensurePortAdded(accountPage: AccountPage, addPortPage: AddPortPage, portName: string): Promise<void> {
    const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
    if (!savedPorts.includes(portName)) {
      await this.addPortToAccount(accountPage, addPortPage, portName);
    }
  }

  static async removePortFromAccount(
    accountPage: AccountPage,
    removePortPage: RemovePortPage,
    portName: string
  ): Promise<void> {
    const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
    if (!savedPorts.includes(portName)) return;

    await accountPage.removePortLink().click();
    await expect(accountPage.page).toHaveURL(/\/remove-port/);
    await removePortPage.removePorts(portName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.portsUsedValue()).not.toContainText(portName);
  }
}
