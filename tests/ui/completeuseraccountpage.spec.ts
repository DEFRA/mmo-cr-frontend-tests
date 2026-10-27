import { expect, test } from '../../fixtures/commonfixture';
import { NavigationFlow } from './helpers/navigationFlow';

async function ensureGearAdded(
  accountPage: import('../../pages/accountPage').AccountPage,
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  gearName: string
): Promise<void> {
  const current = await accountPage.getGearOnboardText();
  if (current.includes(gearName)) return;

  await accountPage.clickAddGear();
  await saveGearFromAddPage(addGearPage, gearName);

  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.gearOnboardValue()).toContainText(gearName);
}

async function removeGearIfPresent(
  accountPage: import('../../pages/accountPage').AccountPage,
  removeGearPage: import('../../pages/removeGearPage').RemoveGearPage,
  gearName: string
): Promise<void> {
  if (!(await accountPage.getGearOnboardText()).includes(gearName)) return;

  await accountPage.clickRemoveGear();
  await removeGearPage.selectGearToRemove(gearName);
  await removeGearPage.clickContinue();
  await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
}

async function saveGearFromAddPage(
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  gearName: string
): Promise<void> {
  await addGearPage.searchAndSelectGear(gearName);
  await addGearPage.clickSaveAndContinue();

  if (await addGearPage.measurementsHeading().isVisible()) {
    for (const input of await addGearPage.measurementInputs().all()) {
      await input.fill('1');
    }
    await addGearPage.clickSaveAndContinue();
  }
}

async function findGear(
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  searchTerm: string,
  matches: (name: string) => boolean
): Promise<string> {
  const gearName = (await addGearPage.searchGearOptions(searchTerm)).find(matches);
  if (!gearName) throw new Error(`No gear option matched search term "${searchTerm}"`);
  return gearName;
}

async function selectGearWithMeasurements(addGearPage: import('../../pages/addGearPage').AddGearPage): Promise<string> {
  const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
  await addGearPage.searchAndSelectGear(gearName);
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.measurementsHeading()).toBeVisible();
  return gearName;
}

async function ensureSpeciesAdded(
  accountPage: import('../../pages/accountPage').AccountPage,
  addSpeciesPage: import('../../pages/addSpeciesPage').AddSpeciesPage,
  speciesName: string
): Promise<void> {
  const current = await accountPage.speciesCaughtValue().textContent();
  if (current && current.includes(speciesName)) return;

  await accountPage.addSpeciesLink().click();
  await expect(accountPage.page).toHaveURL(/\/add-species\?return=\/account$/);
  await addSpeciesPage.searchAndSelectSpecies(speciesName);
  await accountPage.expectUrl(/\/account$/);
}

async function addPortFromAccount(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  addPortPage: import('../../pages/addPortPage').AddPortPage,
  portName: string
): Promise<string> {
  await accountPage.addPortLink().click();
  await expect(page).toHaveURL(/\/add-port/);
  await addPortPage.searchAndSelectPort(portName);
  await addPortPage.clickSaveAndContinue();
  await accountPage.expectUrl(/\/account$/);
  return portName;
}

test.describe('Complete user account page', () => {
  test.beforeEach(async ({ signInPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccount(signInPage, accountPage, {
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account page UI tests'
    });
  });

  test('Verify Account Page Loads Successfully', async ({ accountPage }) => {
    await expect(accountPage.pageHeading()).toBeVisible();
    await expect(accountPage.personalDetailsHeading()).toBeVisible();
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
  });

  test('Verify Personal Details are Displayed', async ({ accountPage }) => {
    await expect(accountPage.personalDetailsHeading()).toBeVisible();
    await expect(accountPage.summaryRow('Email address')).toBeVisible();
    await expect(accountPage.summaryRow('Password')).toBeVisible();
    await expect(accountPage.summaryRow('Address')).toBeVisible();
  });

  test('Verify Vessel Details are Displayed', async ({ accountPage }) => {
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
    await expect(accountPage.vesselNameHeading()).toBeVisible();
  });

  test('Verify "Ports Used" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.addPortLink()).toBeVisible();
    await expect(accountPage.removePortLink()).toBeVisible();
  });

  test('Verify "Gear Onboard" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.addGearLink()).toBeVisible();
    await expect(accountPage.removeGearLink()).toBeVisible();
  });

  test('Verify "Species Caught" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
    await expect(accountPage.addSpeciesLink()).toBeVisible();
    await expect(accountPage.removeSpeciesLink()).toBeVisible();
  });

  test('Verify Navigation to Add Gear Screen', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    await expect(addGearPage.gearInput()).toBeVisible();
  });

  test('Verify Adding a Single Gear Item', async ({ accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await expect(accountPage.pageHeading()).toBeVisible();
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Multiple Gear Items Can Be Added', async ({ accountPage, addGearPage }) => {
    const firstGear = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, firstGear);
    await accountPage.clickAddGear();
    const secondGear = await findGear(addGearPage, 'tr', (name) => /traps/i.test(name));
    await saveGearFromAddPage(addGearPage, secondGear);
    await expect(accountPage.gearOnboardValue()).toContainText(firstGear);
    await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
  });

  test('Verify Recently Added Gear Appears Without Manual Refresh', async ({ accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Cancel Action in Add Gear Flow', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    await accountPage.page.goBack();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Duplicate Gear Handling', async ({ accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText(`${gearName} has already been added to your gear`);
    await expect(accountPage.page).toHaveURL(/\/add-gear\?return=/);
  });

  test('Verify Navigation to Remove Gear Screen', async ({ accountPage, removeGearPage }) => {
    await accountPage.clickRemoveGear();
    await expect(removeGearPage.pageHeading()).toBeVisible();
  });

  test('Verify Removal of Gear Item', async ({ accountPage, addGearPage, removeGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(gearName);
    await removeGearPage.clickContinue();

    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
  });

  test('Verify Navigation to Add Port Screen', async ({ page, accountPage }) => {
    await accountPage.addPortLink().click();
    await expect(page).toHaveURL(/\/add-port/);
  });

  test('Verify Adding a Port', async ({ page, accountPage, addPortPage }) => {
    const portName = await addPortFromAccount(page, accountPage, addPortPage, 'Plymouth');
    await expect(accountPage.portsUsedValue()).toContainText(portName);
  });

  test('Verify Multiple Ports Can Be Added', async ({ page, accountPage, addPortPage }) => {
    const first = await addPortFromAccount(page, accountPage, addPortPage, 'Plymouth');
    const second = await addPortFromAccount(page, accountPage, addPortPage, 'Lowestoft');
    await expect(accountPage.portsUsedValue()).toContainText(first);
    await expect(accountPage.portsUsedValue()).toContainText(second);
  });

  test('Verify Cancel During Add Port Flow', async ({ page, accountPage }) => {
    await accountPage.addPortLink().click();
    await expect(page).toHaveURL(/\/add-port/);
    await page.goBack();
    await accountPage.expectUrl(/\/account$/);
  });

  test('Verify Port Removal Screen Opens', async ({ page, accountPage }) => {
    await accountPage.removePortLink().click();
    await expect(page).toHaveURL(/\/remove-port/);
  });

  test('Verify Navigation to Add Species Screen', async ({ page, accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await expect(page).toHaveURL(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
  });

  test('Verify Adding a Species', async ({ accountPage, addSpeciesPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await ensureSpeciesAdded(accountPage, addSpeciesPage, speciesName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).toContainText(speciesName);
  });

  test('Verify Multiple Species Addition', async ({ accountPage, addSpeciesPage }) => {
    const speciesNames = ['Atlantic cod (COD)', 'Atlantic mackerel (MAC)'];
    for (const species of speciesNames) {
      await ensureSpeciesAdded(accountPage, addSpeciesPage, species);
    }
    for (const species of speciesNames) {
      await expect(accountPage.speciesCaughtValue()).toContainText(species);
    }
  });

  test('Verify Cancel During Add Species Flow', async ({ page, accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await expect(page).toHaveURL(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
    await page.goBack();
    await accountPage.expectUrl(/\/account$/);
  });

  test('Verify Navigation to Remove Species Screen', async ({ page, accountPage, removeSpeciesPage }) => {
    await accountPage.removeSpeciesLink().click();
    await expect(page).toHaveURL(/\/remove-species\?return=\/account$/);
    await expect(removeSpeciesPage.pageHeading()).toBeVisible();
  });

  test('Verify Removing Species', async ({ accountPage, addSpeciesPage, removeSpeciesPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await ensureSpeciesAdded(accountPage, addSpeciesPage, speciesName);

    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.selectSpeciesToRemove(speciesName);
    await removeSpeciesPage.clickContinue();

    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
  });

  test('Verify Return to Account Page After Add Gear', async ({ accountPage, addGearPage }) => {
    const gearOnboard = await accountPage.getGearOnboardText();
    await accountPage.clickAddGear();
    const gearName = await findGear(addGearPage, 'po', (name) => !gearOnboard.includes(name));
    await saveGearFromAddPage(addGearPage, gearName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Remove Gear', async ({ accountPage, addGearPage, removeGearPage }) => {
    await ensureGearAdded(accountPage, addGearPage, 'Pots');
    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove('Pots');
    await removeGearPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Add Port', async ({ page, accountPage, addPortPage }) => {
    await addPortFromAccount(page, accountPage, addPortPage, 'Plymouth');
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Add Species', async ({ accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.searchAndSelectSpecies('Atlantic cod (COD)');
    await accountPage.expectUrl(/\/account$/);
  });

  test('Verify Added Ports Appear in Catch Record Journey', async ({
    page,
    accountPage,
    addPortPage,
    recordsPage,
    selectVesselPage,
    tripDatePage
  }) => {
    const portName = await addPortFromAccount(page, accountPage, addPortPage, 'Plymouth');
    await expect(accountPage.portsUsedValue()).toContainText(portName);
    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(page).toHaveURL(/\/select-vessel$/);
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/trip-date$/);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/add-port\?for=departure/);
    await addPortPage.portInput().fill(portName);
    await expect(addPortPage.portResultItem(portName)).toBeVisible();
  });

  test('Verify Added Gear Appears in Catch Record Journey', async ({
    page,
    accountPage,
    addGearPage,
    gearSelectionPage
  }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('Verify Added Species Appears in Catch Record Journey', async ({
    page,
    accountPage,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    const speciesName = 'Atlantic cod (COD)';
    await ensureSpeciesAdded(accountPage, addSpeciesPage, speciesName);
    await page.goto('/species-selection');
    await expect(speciesSelectionPage.speciesCheckbox(speciesName)).toBeVisible();
  });

  test('Verify Empty State for Ports', async ({ accountPage }) => {
    const portsValue = accountPage.portsUsedValue();
    await expect(portsValue).toBeVisible();
    await expect(accountPage.addPortLink()).toBeVisible();
    await expect(accountPage.removePortLink()).toBeVisible();
  });

  test('Verify Empty State for Gear', async ({ accountPage }) => {
    const gearValue = accountPage.gearOnboardValue();
    await expect(gearValue).toBeVisible();
    await expect(accountPage.addGearLink()).toBeVisible();
    await expect(accountPage.removeGearLink()).toBeVisible();
  });

  test('Verify Empty State for Species', async ({ accountPage }) => {
    const speciesValue = accountPage.speciesCaughtValue();
    await expect(speciesValue).toBeVisible();
    await expect(accountPage.addSpeciesLink()).toBeVisible();
    await expect(accountPage.removeSpeciesLink()).toBeVisible();
  });

  test('Verify Changes Persist Within Same Prototype Session', async ({ page, accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Search Prefix Matches a Catalogue Gear Option', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
    const searchTerm = gearName.slice(0, 2);
    await expect(addGearPage.gearInput()).toHaveAttribute('aria-controls', 'gear-results');
    await addGearPage.gearInput().fill(searchTerm);
    await expect(addGearPage.gearInput()).toHaveValue(searchTerm);
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading()).toBeVisible();
    await expect(addGearPage.measurementInputs().first()).toBeVisible();
  });

  test('Verify Gear Outside the Catalogue Is Rejected', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Gear Selection Is Required', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Gear Measurements Are Required', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await selectGearWithMeasurements(addGearPage);
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter the number of lines');
    await expect(addGearPage.errorSummary()).toContainText(/Enter the gear dimension by number/i);
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Fractional and Negative Measurements Are Rejected', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await selectGearWithMeasurements(addGearPage);
    const measurement = addGearPage.measurementInputs().first();
    await measurement.fill('1.5');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a whole number');
    await measurement.fill('-1');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Zero Measurements Are Rejected', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await selectGearWithMeasurements(addGearPage);
    await addGearPage.measurementInputs().first().fill('0');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Saved Gear Is Available Later in the Same Session', async ({
    page,
    accountPage,
    addGearPage,
    gearSelectionPage,
    removeGearPage
  }) => {
    const gearName = 'Pots';
    await removeGearIfPresent(accountPage, removeGearPage, gearName);
    await accountPage.clickAddGear();
    await saveGearFromAddPage(addGearPage, gearName);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('Verify Selected Gear Can Be Saved Using Enter', async ({ page, accountPage, addGearPage, removeGearPage }) => {
    const gearOnboard = await accountPage.getGearOnboardText();
    await accountPage.clickAddGear();
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
    if (gearOnboard.includes(gearName)) {
      await page.goto('/account');
      await removeGearIfPresent(accountPage, removeGearPage, gearName);
      await accountPage.clickAddGear();
    }

    await addGearPage.searchAndSelectGear(gearName);
    const saveAndContinueButton = addGearPage.common.saveAndContinueButton();
    for (
      let tab = 0;
      tab < 20 && !(await saveAndContinueButton.evaluate((button) => button === document.activeElement));
      tab++
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(saveAndContinueButton).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(addGearPage.measurementsHeading()).toBeVisible();
    for (const input of await addGearPage.measurementInputs().all()) {
      for (let tab = 0; tab < 20 && !(await input.evaluate((element) => element === document.activeElement)); tab++) {
        await page.keyboard.press('Tab');
      }
      await expect(input).toBeFocused();
      await page.keyboard.type('1');
      await page.keyboard.press('Tab');
    }
    await expect(saveAndContinueButton).toBeFocused();
    await page.keyboard.press('Enter');
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });
});
