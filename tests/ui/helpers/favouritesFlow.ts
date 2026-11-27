/**
 * Reusable journeys for adding and removing favourite ports, gear and species on the account page.
 *
 * @author Randhir Patel
 * @since 2026-10-28
 */
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
    await addSpeciesPage.expectOnPage();
    await addSpeciesPage.searchAndSelectSpecies(speciesName);
    await addSpeciesPage.clickSaveAndContinue();
    await accountPage.expectOnPage();
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
    await accountPage.expectOnPage();
    await expect(
      accountPage.speciesCaughtValue(),
      `Species caught no longer includes ${speciesName}`
    ).not.toContainText(speciesName);
  }

  async addGearToAccount(gearName: string): Promise<void> {
    const { accountPage } = this.pages;

    await accountPage.clickAddGear();
    await this.gearFlow.saveGearFromAddPage(gearName);
    await accountPage.expectOnPage();
    await expect(accountPage.gearOnboardValue(), `Gear onboard includes ${gearName}`).toContainText(gearName);
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
    await accountPage.expectOnPage();
    await expect(accountPage.gearOnboardValue(), `Gear onboard no longer includes ${gearName}`).not.toContainText(
      gearName
    );
  }

  async setupFavouriteGears(gears: string[]): Promise<void> {
    for (const gear of gears) {
      await this.ensureGearAdded(gear);
    }
  }

  async removeGears(...gears: string[]): Promise<void> {
    const { accountPage, removeGearPage } = this.pages;

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(...gears);
    await removeGearPage.clickContinue();
  }

  async addPortToAccount(portName: string): Promise<void> {
    const { accountPage, addPortPage } = this.pages;

    await accountPage.addPortLink().click();
    await expect(addPortPage.favouritesHeading(), 'Add port heading to be visible').toBeVisible();
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await accountPage.expectOnPage();
    await expect(accountPage.portsUsedValue(), `Ports used includes ${portName}`).toContainText(portName);
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
    await removePortPage.expectOnPage();
    await removePortPage.removePorts(portName);
    await accountPage.expectOnPage();
    await expect(accountPage.portsUsedValue(), `Ports used no longer includes ${portName}`).not.toContainText(portName);
  }
}
