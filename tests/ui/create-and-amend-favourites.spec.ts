import { expect, test } from '../../fixtures/commonfixture';
import { NavigationFlow } from './helpers/navigationFlow';

const favouriteSpecies = 'Atlantic cod (COD)';
const favouriteGear = 'Pots';
const favouritePort = 'Plymouth';

async function addSpeciesToAccount(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  addSpeciesPage: import('../../pages/addSpeciesPage').AddSpeciesPage,
  speciesName: string
): Promise<void> {
  await accountPage.addSpeciesLink().click();
  await expect(page).toHaveURL(/\/add-species\?return=\/account$/);
  await addSpeciesPage.searchAndSelectSpecies(speciesName);
  await addSpeciesPage.clickSaveAndContinue();
  await accountPage.expectUrl(/\/account$/);
}

async function ensureSpeciesAdded(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  addSpeciesPage: import('../../pages/addSpeciesPage').AddSpeciesPage,
  speciesName: string
): Promise<void> {
  const savedSpecies = (await accountPage.speciesCaughtValue().textContent()) ?? '';
  if (!savedSpecies.includes(speciesName)) {
    await addSpeciesToAccount(page, accountPage, addSpeciesPage, speciesName);
  }
}

async function removeSpeciesFromAccount(
  accountPage: import('../../pages/accountPage').AccountPage,
  removeSpeciesPage: import('../../pages/removeSpeciesPage').RemoveSpeciesPage,
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

async function addGearToAccount(
  accountPage: import('../../pages/accountPage').AccountPage,
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  gearName: string
): Promise<void> {
  await accountPage.clickAddGear();
  await addGearPage.searchAndSelectGear(gearName);
  await addGearPage.clickSaveAndContinue();

  const measurementsHeading = addGearPage.measurementsHeading();
  if (await measurementsHeading.isVisible()) {
    for (const input of await addGearPage.measurementInputs().all()) {
      await input.fill('1');
    }
    await addGearPage.clickSaveAndContinue();
  }

  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.gearOnboardValue()).toContainText(gearName);
}

async function ensureGearAdded(
  accountPage: import('../../pages/accountPage').AccountPage,
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  gearName: string
): Promise<void> {
  if (!(await accountPage.getGearOnboardText()).includes(gearName)) {
    await addGearToAccount(accountPage, addGearPage, gearName);
  }
}

async function removeGearFromAccount(
  accountPage: import('../../pages/accountPage').AccountPage,
  removeGearPage: import('../../pages/removeGearPage').RemoveGearPage,
  gearName: string
): Promise<void> {
  if (!(await accountPage.getGearOnboardText()).includes(gearName)) return;

  await accountPage.clickRemoveGear();
  await removeGearPage.selectGearToRemove(gearName);
  await removeGearPage.clickContinue();
  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
}

async function addPortToAccount(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  addPortPage: import('../../pages/addPortPage').AddPortPage,
  portName: string
): Promise<void> {
  await accountPage.addPortLink().click();
  await expect(page).toHaveURL(/\/add-port/);
  await addPortPage.searchAndSelectPort(portName);
  await addPortPage.clickSaveAndContinue();
  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.portsUsedValue()).toContainText(portName);
}

async function ensurePortAdded(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  addPortPage: import('../../pages/addPortPage').AddPortPage,
  portName: string
): Promise<void> {
  const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
  if (!savedPorts.includes(portName)) {
    await addPortToAccount(page, accountPage, addPortPage, portName);
  }
}

async function removePortFromAccount(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  removePortPage: import('../../pages/removePortPage').RemovePortPage,
  portName: string
): Promise<void> {
  const savedPorts = (await accountPage.portsUsedValue().textContent()) ?? '';
  if (!savedPorts.includes(portName)) return;

  await accountPage.removePortLink().click();
  await expect(page).toHaveURL(/\/remove-port/);
  await removePortPage.removePorts(portName);
  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.portsUsedValue()).not.toContainText(portName);
}

test.describe('Create and amend favourites', () => {
  test.beforeEach(async ({ signInPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccount(signInPage, accountPage, {
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for favourites UI tests'
    });
  });

  test('TC1 - Display favourites grouped by species, ports, and gear', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
  });

  test('TC2 - Add an approved species favourite', async ({ page, accountPage, addSpeciesPage, removeSpeciesPage }) => {
    await removeSpeciesFromAccount(accountPage, removeSpeciesPage, favouriteSpecies);
    await addSpeciesToAccount(page, accountPage, addSpeciesPage, favouriteSpecies);

    await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
  });

  test('TC3 - Reject a duplicate species favourite', async ({ page, accountPage, addSpeciesPage }) => {
    await ensureSpeciesAdded(page, accountPage, addSpeciesPage, favouriteSpecies);
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.speciesInput().fill(favouriteSpecies);
    const duplicateOption = addSpeciesPage.suggestionOption(favouriteSpecies);
    if (await duplicateOption.isVisible()) {
      await duplicateOption.click();
    }
    await addSpeciesPage.clickSaveAndContinue();

    await expect(addSpeciesPage.errorSummary()).toContainText(/already/i);
    await expect(page).toHaveURL(/\/add-species/);
  });

  test('TC4 - Add an approved gear favourite', async ({ accountPage, addGearPage, removeGearPage }) => {
    await removeGearFromAccount(accountPage, removeGearPage, favouriteGear);
    await addGearToAccount(accountPage, addGearPage, favouriteGear);

    await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
  });

  test('TC5 - Add an approved port favourite', async ({ page, accountPage, addPortPage }) => {
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
  });

  test('TC6 - Reject a duplicate gear favourite with an informative message', async ({
    page,
    accountPage,
    addGearPage
  }) => {
    await ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill(favouriteGear);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText(`${favouriteGear} has already been added to your gear`);
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('TC7 - Reject a duplicate port favourite with an informative message', async ({
    page,
    accountPage,
    addPortPage
  }) => {
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await accountPage.addPortLink().click();
    await addPortPage.searchAndSelectPort(favouritePort);
    await addPortPage.clickSaveAndContinue();

    await expect(addPortPage.errorSummary()).toBeVisible();
    await expect(addPortPage.errorSummary()).toContainText(/already/i);
    await expect(page).toHaveURL(/\/add-port/);
  });

  test('TC8 - Remove a species favourite', async ({ page, accountPage, addSpeciesPage, removeSpeciesPage }) => {
    await ensureSpeciesAdded(page, accountPage, addSpeciesPage, favouriteSpecies);
    await removeSpeciesFromAccount(accountPage, removeSpeciesPage, favouriteSpecies);

    await expect(accountPage.speciesCaughtValue()).not.toContainText(favouriteSpecies);
  });

  test('TC9 - Remove a gear favourite', async ({ accountPage, addGearPage, removeGearPage }) => {
    await ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await removeGearFromAccount(accountPage, removeGearPage, favouriteGear);

    await expect(accountPage.gearOnboardValue()).not.toContainText(favouriteGear);
  });

  test('TC10 - Remove a port favourite', async ({ page, accountPage, addPortPage, removePortPage }) => {
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await removePortFromAccount(page, accountPage, removePortPage, favouritePort);

    await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
  });

  test('TC11 - Amend a port favourite by replacing it with another saved port', async ({
    page,
    accountPage,
    addPortPage,
    removePortPage
  }) => {
    const replacementPort = 'Lowestoft';
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await removePortFromAccount(page, accountPage, removePortPage, favouritePort);
    await addPortToAccount(page, accountPage, addPortPage, replacementPort);

    await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
    await expect(accountPage.portsUsedValue()).toContainText(replacementPort);
  });

  test('TC12 - Favourite gear is available during catch recording', async ({
    page,
    accountPage,
    addGearPage,
    gearSelectionPage
  }) => {
    await ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(favouriteGear)).toBeVisible();
  });

  test('TC13 - Favourite species is available during catch recording', async ({
    page,
    accountPage,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await ensureSpeciesAdded(page, accountPage, addSpeciesPage, favouriteSpecies);
    await page.goto('/species-selection');

    await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeVisible();
  });

  test('TC14 - Favourite port is suggested during departure-port entry', async ({
    page,
    accountPage,
    addPortPage,
    recordsPage,
    selectVesselPage,
    tripDatePage
  }) => {
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(selectVesselPage.pageHeading()).toBeVisible();
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/trip-date$/);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/add-port\?for=departure/);

    await addPortPage.portInput().fill(favouritePort);
    await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
  });

  test('TC15 - Port type-ahead search suggests a matching reference-data entry', async ({
    accountPage,
    addPortPage
  }) => {
    await accountPage.addPortLink().click();
    await addPortPage.portInput().fill(favouritePort.slice(0, 2));

    await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
  });

  test('TC16 - Reject free-text gear outside the approved catalogue', async ({ page, accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('TC17 - Reject free-text species outside the approved catalogue', async ({
    page,
    accountPage,
    addSpeciesPage
  }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.speciesInput().fill(`Not an approved species ${Date.now()}`);
    await addSpeciesPage.speciesInput().press('Enter');

    await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
    await expect(page).toHaveURL(/\/add-species/);
  });

  test('TC18 - Reject free-text port outside the approved catalogue', async ({ page, accountPage, addPortPage }) => {
    await accountPage.addPortLink().click();
    await addPortPage.portInput().fill(`Not a port ${Date.now()}`);
    await addPortPage.clickSaveAndContinue();

    await expect(addPortPage.errorSummary()).toContainText('Select a port from the list');
    await expect(page).toHaveURL(/\/add-port/);
  });

  test('TC19 - Favourites persist against the user account after reload', async ({
    page,
    accountPage,
    addSpeciesPage,
    addGearPage,
    removeGearPage,
    addPortPage
  }) => {
    await ensureSpeciesAdded(page, accountPage, addSpeciesPage, favouriteSpecies);
    await ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await ensurePortAdded(page, accountPage, addPortPage, favouritePort);
    await page.reload();

    await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
    await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
    await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
    await removeGearFromAccount(accountPage, removeGearPage, favouriteGear);
  });

  test('TC20 - Favourites synchronize between web and mobile channels', async () => {
    test.skip(true, 'Cross-channel sync requires the mobile app and sync-service test fixtures.');
  });
});
