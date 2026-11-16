import { expect } from '@playwright/test';
import { Given, Then, When, type AccountPageBddContext } from '../../../fixtures/accountPageBddFixture';

const requireGearBefore = async (accountBdd: AccountPageBddContext): Promise<void> => {
  await accountBdd.favouritesFlow.removeGearFromAccount('Pots');
  accountBdd.state.gearBefore = (await accountBdd.accountPage.gearOnboardValue().textContent()) ?? '';
};

const startCatchRecord = async (accountBdd: AccountPageBddContext): Promise<void> => {
  const { recordsPage, selectVesselPage } = accountBdd;

  await recordsPage.goto('/records');
  await recordsPage.createNewRecordButton().click();
  await expect(selectVesselPage.pageHeading()).toBeVisible();
  await selectVesselPage.firstVesselRadio().check();
  await selectVesselPage.clickSaveAndContinue();
  await selectVesselPage.expectUrl(/\/trip-date$/);
};

const addPotsAndOpenMeasurements = async (accountBdd: AccountPageBddContext): Promise<void> => {
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.searchAndSelectGear('Pots');
  await accountBdd.addGearPage.clickSaveAndContinue();
  await expect(accountBdd.addGearPage.measurementsHeading('pots')).toBeVisible();
};

Given('I am signed in and on the account page', async ({ accountBdd }) => {
  await accountBdd.navigationFlow.signInAndOpenAccount({
    requiredCredentialsMessage:
      'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account page UI tests'
  });
});

Given('gear {string} is saved', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.ensureGearAdded(gearName);
});

Given('species {string} is saved', async ({ accountBdd }, speciesName: string) => {
  await accountBdd.favouritesFlow.ensureSpeciesAdded(speciesName);
});

Given('port {string} is saved', async ({ accountBdd }, portName: string) => {
  await accountBdd.favouritesFlow.ensurePortAdded(portName);
});

When('I open the add gear page', async ({ accountBdd }) => {
  await accountBdd.accountPage.clickAddGear();
});

When('I ensure gear {string} is saved', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.ensureGearAdded(gearName);
});

When('I add another available gear {string}', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.gearFlow.saveGearFromAddPage(gearName);
});

When('I open the add gear page and go back', async ({ accountBdd }) => {
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.goBack();
});

When('I try to add gear {string} again', async ({ accountBdd }, gearName: string) => {
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.gearInput().fill(gearName);
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I open the remove gear page', async ({ accountBdd }) => {
  await accountBdd.accountPage.clickRemoveGear();
});

When('I remove gear {string}', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.ensureGearAdded(gearName);
  await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
});

When('I add gear {string} from the catalogue', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.gearFlow.saveGearFromAddPage(gearName);
});

When(
  'I replace saved port {string} with {string}',
  async ({ accountBdd }, oldPortName: string, newPortName: string) => {
    await accountBdd.favouritesFlow.removePortFromAccount(oldPortName);
    await accountBdd.favouritesFlow.addPortToAccount(newPortName);
  }
);

When('I open the add port page', async ({ accountBdd }) => {
  await accountBdd.accountPage.addPortLink().click();
});

When('I open the add port page and go back', async ({ accountBdd }) => {
  await accountBdd.accountPage.addPortLink().click();
  await accountBdd.addPortPage.goBack();
});

When('I open the remove port page', async ({ accountBdd }) => {
  await accountBdd.accountPage.removePortLink().click();
});

When('I ensure species {string} is saved', async ({ accountBdd }, speciesName: string) => {
  await accountBdd.favouritesFlow.ensureSpeciesAdded(speciesName);
});

When(
  'I replace saved species {string} with {string}',
  async ({ accountBdd }, oldSpeciesName: string, newSpeciesName: string) => {
    await accountBdd.favouritesFlow.removeSpeciesFromAccount(oldSpeciesName);
    await accountBdd.favouritesFlow.addSpeciesToAccount(newSpeciesName);
  }
);

When('I open the add species page', async ({ accountBdd }) => {
  await accountBdd.accountPage.addSpeciesLink().click();
});

When('I open the add species page and go back', async ({ accountBdd }) => {
  await accountBdd.accountPage.addSpeciesLink().click();
  await accountBdd.addSpeciesPage.goBack();
});

When('I open the remove species page', async ({ accountBdd }) => {
  await accountBdd.accountPage.removeSpeciesLink().click();
});

When('I remove species {string}', async ({ accountBdd }, speciesName: string) => {
  await accountBdd.favouritesFlow.ensureSpeciesAdded(speciesName);
  await accountBdd.favouritesFlow.removeSpeciesFromAccount(speciesName);
});

When('I start a catch record and search departure ports for {string}', async ({ accountBdd }, portName: string) => {
  await startCatchRecord(accountBdd);
  await accountBdd.tripDatePage.yesRadio().check();
  await accountBdd.tripDatePage.clickSaveAndContinue();
  await accountBdd.departurePortPage.expectUrl(/\/departure-port$/);
  await expect(accountBdd.departurePortPage.portRadio(portName)).toBeVisible();
});

When('I open gear selection for a new catch record', async ({ accountBdd }) => {
  await startCatchRecord(accountBdd);
  await accountBdd.gearSelectionPage.goto('/gear-selection');
});

When('I open species selection for a new catch record', async ({ accountBdd }) => {
  await startCatchRecord(accountBdd);
  await accountBdd.speciesSelectionPage.goto('/species-selection');
});

When('I reopen the account page', async ({ accountBdd }) => {
  await accountBdd.accountPage.goto('/account');
});

When(
  'I remove and re-add gear {string}, then open gear selection for a new catch record',
  async ({ accountBdd }, gearName: string) => {
    await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
    await accountBdd.favouritesFlow.addGearToAccount(gearName);
    await startCatchRecord(accountBdd);
    await accountBdd.gearSelectionPage.goto('/gear-selection');
  }
);

When(
  'I search for gear prefix {string} and select {string}',
  async ({ accountBdd }, prefix: string, gearName: string) => {
    await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
    await accountBdd.accountPage.clickAddGear();
    await accountBdd.addGearPage.gearInput().fill(prefix);
    await expect(accountBdd.addGearPage.gearOption(gearName)).toBeVisible();
    await accountBdd.addGearPage.searchAndSelectGear(gearName);
  }
);

When('I submit gear text that is not in the catalogue', async ({ accountBdd }) => {
  await requireGearBefore(accountBdd);
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.gearInput().fill('Not a catalogue gear');
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I continue without selecting a gear', async ({ accountBdd }) => {
  await requireGearBefore(accountBdd);
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I select {string} and continue without entering a measurement', async ({ accountBdd }, gearName: string) => {
  await requireGearBefore(accountBdd);
  await addPotsAndOpenMeasurements(accountBdd);
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I enter fractional and negative measurements for {string}', async ({ accountBdd }, gearName: string) => {
  await requireGearBefore(accountBdd);
  await addPotsAndOpenMeasurements(accountBdd);
  const measurement = accountBdd.addGearPage.gearDimensionInput();
  await measurement.fill('1.5');
  await accountBdd.addGearPage.clickSaveAndContinue();
  await expect(accountBdd.addGearPage.errorSummary()).toContainText('Enter a whole number');
  await measurement.fill('-1');
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I enter a zero measurement for {string}', async ({ accountBdd }, gearName: string) => {
  await requireGearBefore(accountBdd);
  await addPotsAndOpenMeasurements(accountBdd);
  await accountBdd.addGearPage.gearDimensionInput().fill('0');
  await accountBdd.addGearPage.clickSaveAndContinue();
});

When('I save {string} using only the Enter key', async ({ accountBdd }, gearName: string) => {
  await accountBdd.favouritesFlow.removeGearFromAccount(gearName);
  await accountBdd.accountPage.clickAddGear();
  await accountBdd.addGearPage.searchAndSelectGear(gearName);

  const saveAndContinueButton = accountBdd.addGearPage.common.saveAndContinueButton();
  await accountBdd.addGearPage.tabUntilFocused(saveAndContinueButton);
  await accountBdd.addGearPage.pressKey('Enter');
  await expect(accountBdd.addGearPage.measurementsHeading('pots')).toBeVisible();

  for (const input of await accountBdd.addGearPage.measurementInputs().all()) {
    await accountBdd.addGearPage.tabUntilFocused(input);
    await accountBdd.addGearPage.pressKey('1');
    await accountBdd.addGearPage.pressKey('Tab');
  }

  await expect(saveAndContinueButton).toBeFocused();
  await accountBdd.addGearPage.pressKey('Enter');
});

Then('I see the account page heading', async ({ accountBdd }) => {
  await expect(accountBdd.accountPage.pageHeading()).toBeVisible();
});

Then('I see the personal, vessel, and favourite sections', async ({ accountBdd }) => {
  await expect(accountBdd.accountPage.personalDetailsHeading()).toBeVisible();
  await expect(accountBdd.accountPage.vesselDetailsHeading()).toBeVisible();
  for (const section of ['Ports used', 'Gear onboard', 'Species caught']) {
    await expect(accountBdd.accountPage.summaryRow(section)).toBeVisible();
  }
});

Then('I see the personal details section with email, password, and address', async ({ accountBdd }) => {
  for (const detail of ['Email address', 'Password', 'Address']) {
    await expect(accountBdd.accountPage.summaryRow(detail)).toBeVisible();
  }
});

Then('I see the vessel details section with a vessel name', async ({ accountBdd }) => {
  await expect(accountBdd.accountPage.vesselDetailsHeading()).toBeVisible();
  await expect(accountBdd.accountPage.vesselNameHeading()).toBeVisible();
});

Then('the {string} section has Add and Remove links', async ({ accountBdd }, section: string) => {
  const sectionLinks: Record<
    string,
    { add: () => import('@playwright/test').Locator; remove: () => import('@playwright/test').Locator }
  > = {
    'Ports used': {
      add: () => accountBdd.accountPage.addPortLink(),
      remove: () => accountBdd.accountPage.removePortLink()
    },
    'Gear onboard': {
      add: () => accountBdd.accountPage.addGearLink(),
      remove: () => accountBdd.accountPage.removeGearLink()
    },
    'Species caught': {
      add: () => accountBdd.accountPage.addSpeciesLink(),
      remove: () => accountBdd.accountPage.removeSpeciesLink()
    }
  };
  const links = sectionLinks[section];
  if (!links) throw new Error(`Unknown account section "${section}"`);

  await expect(accountBdd.accountPage.summaryRow(section)).toBeVisible();
  await expect(links.add()).toBeVisible();
  await expect(links.remove()).toBeVisible();
});

Then('I see the add gear page and its search field', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.pageHeading()).toBeVisible();
  await expect(accountBdd.addGearPage.gearInput()).toBeVisible();
});

Then('the account page lists gear {string}', async ({ accountBdd }, gearName: string) => {
  await expect(accountBdd.accountPage.gearOnboardValue()).toContainText(gearName);
});

Then('the account page lists gear containing {string}', async ({ accountBdd }, gearNamePart: string) => {
  await expect(accountBdd.accountPage.gearOnboardValue()).toContainText(gearNamePart);
});

Then('I am on the account page', async ({ accountBdd }) => {
  await accountBdd.accountPage.expectUrl(/\/account$/);
  await expect(accountBdd.accountPage.pageHeading()).toBeVisible();
});

Then('I see the duplicate gear error for {string}', async ({ accountBdd }, gearName: string) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText(`${gearName} has already been added to your gear`);
});

Then('I see the remove gear page', async ({ accountBdd }) => {
  await expect(accountBdd.removeGearPage.pageHeading()).toBeVisible();
});

Then('the account page does not list gear {string}', async ({ accountBdd }, gearName: string) => {
  await expect(accountBdd.accountPage.gearOnboardValue()).not.toContainText(gearName);
});

Then('I see the add port page and its search field', async ({ accountBdd }) => {
  await expect(accountBdd.addPortPage.pageHeading()).toBeVisible();
  await expect(accountBdd.addPortPage.portInput()).toBeVisible();
});

Then('the account page lists port {string}', async ({ accountBdd }, portName: string) => {
  await expect(accountBdd.accountPage.portsUsedValue()).toContainText(portName);
});

Then('I see the remove port page', async ({ accountBdd }) => {
  await accountBdd.removePortPage.expectUrl(/\/remove-port/);
});

Then('I see the add species page and its search field', async ({ accountBdd }) => {
  await expect(accountBdd.addSpeciesPage.pageHeading()).toBeVisible();
  await expect(accountBdd.addSpeciesPage.speciesInput()).toBeVisible();
});

Then('the account page lists species {string}', async ({ accountBdd }, speciesName: string) => {
  await expect(accountBdd.accountPage.speciesCaughtValue()).toContainText(speciesName);
});

Then('I see the remove species page', async ({ accountBdd }) => {
  await expect(accountBdd.removeSpeciesPage.pageHeading()).toBeVisible();
});

Then('the account page does not list species {string}', async ({ accountBdd }, speciesName: string) => {
  await expect(accountBdd.accountPage.speciesCaughtValue()).not.toContainText(speciesName);
});

Then('the departure-port options include {string}', async ({ accountBdd }, portName: string) => {
  await expect(accountBdd.departurePortPage.portRadio(portName)).toBeVisible();
});

Then('gear {string} is available to select', async ({ accountBdd }, gearName: string) => {
  await expect(accountBdd.gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
});

Then('species {string} is available to select', async ({ accountBdd }, speciesName: string) => {
  await expect(accountBdd.speciesSelectionPage.speciesCheckbox(speciesName)).toBeVisible();
});

Then('gear {string} is selected from the catalogue', async ({ accountBdd }, gearName: string) => {
  await expect(accountBdd.addGearPage.gearInput()).toHaveValue(gearName);
});

Then('the catalogue validation error is shown', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText('Select a gear type from the list');
});

Then('the required-gear validation error is shown', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText('Select the gear you want to add');
});

Then('the required measurement error is shown', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText(/Enter the gear dimension by number/i);
});

Then('the fractional and positive-value errors are shown', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
});

Then('the positive measurement error is shown', async ({ accountBdd }) => {
  await expect(accountBdd.addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
});

Then('the saved gear list is unchanged', async ({ accountBdd }) => {
  await accountBdd.accountPage.goto('/account');
  await expect(accountBdd.accountPage.gearOnboardValue()).toHaveText(accountBdd.state.gearBefore);
});

Then('the selected gear {string} is saved to my account', async ({ accountBdd }, gearName: string) => {
  await accountBdd.accountPage.expectUrl(/\/account$/);
  await expect(accountBdd.accountPage.gearOnboardValue()).toContainText(gearName);
});
