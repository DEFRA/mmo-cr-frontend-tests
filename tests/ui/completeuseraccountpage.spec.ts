import { expect, test } from '../../fixtures/commonfixture';

test.describe('Complete user account page', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount({
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

  test('Verify Adding a Single Gear Item', async ({ favouritesFlow, accountPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);
    await expect(accountPage.pageHeading()).toBeVisible();
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Multiple Gear Items Can Be Added', async ({ gearFlow, favouritesFlow, accountPage }) => {
    const firstGear = 'Pots';
    await favouritesFlow.ensureGearAdded(firstGear);
    await accountPage.clickAddGear();
    const secondGear = await gearFlow.findGear('tr', (name) => /traps/i.test(name));
    await gearFlow.saveGearFromAddPage(secondGear);
    await expect(accountPage.gearOnboardValue()).toContainText(firstGear);
    await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
  });

  test('Verify Recently Added Gear Appears Without Manual Refresh', async ({ favouritesFlow, accountPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Cancel Action in Add Gear Flow', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    await addGearPage.goBack();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Duplicate Gear Handling', async ({ favouritesFlow, accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText(`${gearName} has already been added to your gear`);
    await addGearPage.expectUrl(/\/add-gear\?return=/);
  });

  test('Verify Navigation to Remove Gear Screen', async ({ accountPage, removeGearPage }) => {
    await accountPage.clickRemoveGear();
    await expect(removeGearPage.pageHeading()).toBeVisible();
  });

  test('Verify Removal of Gear Item', async ({ favouritesFlow, accountPage, removeGearPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(gearName);
    await removeGearPage.clickContinue();

    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
  });

  test('Verify Navigation to Add Port Screen', async ({ accountPage, addPortPage }) => {
    await accountPage.addPortLink().click();
    await addPortPage.expectUrl(/\/add-port/);
  });

  test('Verify Adding a Port', async ({ favouritesFlow, accountPage }) => {
    const portName = 'Plymouth';
    await favouritesFlow.removePortFromAccount(portName);
    await favouritesFlow.addPortToAccount(portName);
    await expect(accountPage.portsUsedValue()).toContainText(portName);
  });

  test('Verify Multiple Ports Can Be Added', async ({ favouritesFlow, accountPage }) => {
    const ports = ['Plymouth', 'Lowestoft'];
    for (const port of ports) {
      await favouritesFlow.removePortFromAccount(port);
      await favouritesFlow.addPortToAccount(port);
    }
    for (const port of ports) {
      await expect(accountPage.portsUsedValue()).toContainText(port);
    }
  });

  test('Verify Cancel During Add Port Flow', async ({ accountPage, addPortPage }) => {
    await accountPage.addPortLink().click();
    await addPortPage.expectUrl(/\/add-port/);
    await addPortPage.goBack();
    await accountPage.expectUrl(/\/account$/);
  });

  test('Verify Port Removal Screen Opens', async ({ accountPage, removePortPage }) => {
    await accountPage.removePortLink().click();
    await removePortPage.expectUrl(/\/remove-port/);
  });

  test('Verify Navigation to Add Species Screen', async ({ accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.expectUrl(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
  });

  test('Verify Adding a Species', async ({ favouritesFlow, accountPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await favouritesFlow.ensureSpeciesAdded(speciesName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).toContainText(speciesName);
  });

  test('Verify Multiple Species Addition', async ({ favouritesFlow, accountPage }) => {
    const speciesNames = ['Atlantic cod (COD)', 'Atlantic mackerel (MAC)'];
    for (const species of speciesNames) {
      await favouritesFlow.ensureSpeciesAdded(species);
    }
    for (const species of speciesNames) {
      await expect(accountPage.speciesCaughtValue()).toContainText(species);
    }
  });

  test('Verify Cancel During Add Species Flow', async ({ accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.expectUrl(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
    await addSpeciesPage.goBack();
    await accountPage.expectUrl(/\/account$/);
  });

  test('Verify Navigation to Remove Species Screen', async ({ accountPage, removeSpeciesPage }) => {
    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.expectUrl(/\/remove-species\?return=\/account$/);
    await expect(removeSpeciesPage.pageHeading()).toBeVisible();
  });

  test('Verify Removing Species', async ({ favouritesFlow, accountPage, removeSpeciesPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await favouritesFlow.ensureSpeciesAdded(speciesName);

    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.selectSpeciesToRemove(speciesName);
    await removeSpeciesPage.clickContinue();

    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
  });

  test('Verify Return to Account Page After Add Gear', async ({ gearFlow, accountPage }) => {
    const gearOnboard = await accountPage.getGearOnboardText();
    await accountPage.clickAddGear();
    const gearName = await gearFlow.findGear('po', (name) => !gearOnboard.includes(name));
    await gearFlow.saveGearFromAddPage(gearName);
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Remove Gear', async ({ favouritesFlow, accountPage, removeGearPage }) => {
    await favouritesFlow.ensureGearAdded('Pots');
    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove('Pots');
    await removeGearPage.clickContinue();
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Add Port', async ({ favouritesFlow, accountPage }) => {
    await favouritesFlow.removePortFromAccount('Plymouth');
    await favouritesFlow.addPortToAccount('Plymouth');
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Return to Account Page After Add Species', async ({ favouritesFlow, accountPage }) => {
    await favouritesFlow.removeSpeciesFromAccount('Atlantic cod (COD)');
    await favouritesFlow.addSpeciesToAccount('Atlantic cod (COD)');
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('Verify Added Ports Appear in Catch Record Journey', async ({
    favouritesFlow,
    accountPage,
    addPortPage,
    recordsPage,
    selectVesselPage,
    tripDatePage
  }) => {
    const portName = 'Plymouth';
    await favouritesFlow.ensurePortAdded(portName);
    await expect(accountPage.portsUsedValue()).toContainText(portName);
    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await selectVesselPage.expectUrl(/\/select-vessel$/);
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.expectUrl(/\/trip-date$/);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await addPortPage.expectUrl(/\/add-port\?for=departure/);
    await addPortPage.portInput().fill(portName);
    await expect(addPortPage.portResultItem(portName)).toBeVisible();
  });

  test('Verify Added Gear Appears in Catch Record Journey', async ({ favouritesFlow, gearSelectionPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);
    await gearSelectionPage.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('Verify Added Species Appears in Catch Record Journey', async ({ favouritesFlow, speciesSelectionPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await favouritesFlow.ensureSpeciesAdded(speciesName);
    await speciesSelectionPage.goto('/species-selection');
    await expect(speciesSelectionPage.speciesCheckbox(speciesName)).toBeVisible();
  });

  test('Verify Changes Persist Within Same Prototype Session', async ({ favouritesFlow, accountPage }) => {
    const gearName = 'Pots';
    await favouritesFlow.ensureGearAdded(gearName);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('Verify Search Prefix Matches a Catalogue Gear Option', async ({ gearFlow, accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
    const searchTerm = gearName.slice(0, 2);
    await expect(addGearPage.gearInput()).toHaveAttribute('aria-controls', 'gear-results');
    await addGearPage.gearInput().fill(searchTerm);
    await expect(addGearPage.gearInput()).toHaveValue(searchTerm);
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.measurementsHeading()).toBeVisible();
    await expect(addGearPage.measurementInputs().first()).toBeVisible();
  });

  test('Verify Gear Outside the Catalogue Is Rejected', async ({ accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await addGearPage.expectUrl(/\/add-gear/);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Gear Selection Is Required', async ({ accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await addGearPage.expectUrl(/\/add-gear/);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Gear Measurements Are Required', async ({ gearFlow, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await gearFlow.selectLineGear();
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter the number of lines');
    await expect(addGearPage.errorSummary()).toContainText(/Enter the gear dimension by number/i);
    await addGearPage.expectUrl(/\/add-gear/);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Fractional and Negative Measurements Are Rejected', async ({ gearFlow, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await gearFlow.selectLineGear();
    const measurement = addGearPage.measurementInputs().first();
    await measurement.fill('1.5');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a whole number');
    await measurement.fill('-1');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
    await addGearPage.expectUrl(/\/add-gear/);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Zero Measurements Are Rejected', async ({ gearFlow, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await gearFlow.selectLineGear();
    await addGearPage.measurementInputs().first().fill('0');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
    await addGearPage.expectUrl(/\/add-gear/);
    await accountPage.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('Verify Saved Gear Is Available Later in the Same Session', async ({
    gearFlow,
    favouritesFlow,
    accountPage,
    gearSelectionPage
  }) => {
    const gearName = 'Pots';
    await favouritesFlow.removeGearFromAccount(gearName);
    await accountPage.clickAddGear();
    await gearFlow.saveGearFromAddPage(gearName);
    await gearSelectionPage.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('Verify Selected Gear Can Be Saved Using Enter', async ({
    gearFlow,
    favouritesFlow,
    accountPage,
    addGearPage
  }) => {
    const gearOnboard = await accountPage.getGearOnboardText();
    await accountPage.clickAddGear();
    const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
    if (gearOnboard.includes(gearName)) {
      await accountPage.goto('/account');
      await favouritesFlow.removeGearFromAccount(gearName);
      await accountPage.clickAddGear();
    }

    await addGearPage.searchAndSelectGear(gearName);
    const saveAndContinueButton = addGearPage.common.saveAndContinueButton();
    await addGearPage.tabUntilFocused(saveAndContinueButton);
    await addGearPage.pressKey('Enter');

    await expect(addGearPage.measurementsHeading()).toBeVisible();
    for (const input of await addGearPage.measurementInputs().all()) {
      await addGearPage.tabUntilFocused(input);
      await addGearPage.pressKey('1');
      await addGearPage.pressKey('Tab');
    }
    await expect(saveAndContinueButton).toBeFocused();
    await addGearPage.pressKey('Enter');
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });
});
