import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';
import { type RemovePortPage } from '../../../pages/removePortPage';
import { type RemoveSpeciesPage } from '../../../pages/removeSpeciesPage';
import { type GearFlow } from './gearFlow';

export class FavouritesFlow {
  constructor(
    private readonly pages: {
      accountPage: AccountPage;
      addSpeciesPage: AddSpeciesPage;
      removeSpeciesPage: RemoveSpeciesPage;
      removeGearPage: RemoveGearPage;
      addPortPage: AddPortPage;
      removePortPage: RemovePortPage;
    },
    private readonly gearFlow: GearFlow
  ) {}

  async addSpeciesToAccount(speciesName: string): Promise<void> {
    const { accountPage, addSpeciesPage } = this.pages;

    await accountPage.addSpeciesLink().click();
    await expect(accountPage.page).toHaveURL(/\/add-species\?return=\/account$/);
    await addSpeciesPage.searchAndSelectSpecies(speciesName);
    await addSpeciesPage.clickSaveAndContinue();
    await accountPage.expectUrl(/\/account$/);
  }

  async ensureSpeciesAdded(speciesName: string): Promise<void> {
    const { accountPage } = this.pages;

    const savedSpecies = (await accountPage.speciesCaughtValue().textContent()) ?? '';
    if (!savedSpecies.includes(speciesName)) {
      await this.addSpeciesToAccount(speciesName);
    }
  }

  async removeSpeciesFromAccount(speciesName: string): Promise<void> {
    const { accountPage, removeSpeciesPage } = this.pages;

    const savedSpecies = (await accountPage.speciesCaughtValue().textContent()) ?? '';
    if (!savedSpecies.includes(speciesName)) return;

    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.selectSpeciesToRemove(speciesName);
    await removeSpeciesPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
  }

  async addGearToAccount(gearName: string): Promise<void> {
    const { accountPage } = this.pages;

    await accountPage.clickAddGear();
    await this.gearFlow.saveGearFromAddPage(gearName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  }

  async ensureGearAdded(gearName: string): Promise<void> {
    const { accountPage } = this.pages;

    if (!(await accountPage.getGearOnboardText()).includes(gearName)) {
      await this.addGearToAccount(gearName);
    }
  }

  async removeGearFromAccount(gearName: string): Promise<void> {
    const { accountPage, removeGearPage } = this.pages;

    if (!(await accountPage.getGearOnboardText()).includes(gearName)) return;

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(gearName);
    await removeGearPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
  }

  async addPortToAccount(portName: string): Promise<void> {
    const { accountPage, addPortPage } = this.pages;

    await accountPage.addPortLink().click();
    await expect(accountPage.page).toHaveURL(/\/add-port/);
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.portsUsedValue()).toContainText(portName);
  }

  async ensurePortAdded(portName: string): Promise<void> {
    const { accountPage } = this.pages;

    const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
    if (!savedPorts.includes(portName)) {
      await this.addPortToAccount(portName);
    }
  }

  async removePortFromAccount(portName: string): Promise<void> {
    const { accountPage, removePortPage } = this.pages;

    const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
    if (!savedPorts.includes(portName)) return;

    await accountPage.removePortLink().click();
    await expect(accountPage.page).toHaveURL(/\/remove-port/);
    await removePortPage.removePorts(portName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.portsUsedValue()).not.toContainText(portName);
  }
}
