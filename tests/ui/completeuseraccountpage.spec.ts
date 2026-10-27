import { expect, test } from '../../fixtures/commonfixture';
import { SigninPage } from '../../pages/sign-in.page';

async function signIn(signInPage: SigninPage): Promise<void> {
  const email = process.env.CATCH_RECORDING_EMAIL;
  const password = process.env.CATCH_RECORDING_PASSWORD;

  if (!email || !password) {
    throw new Error('CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account page UI tests');
  }

  await signInPage.goto('/sign-in');
  await signInPage.login(email, password);
  await expect(signInPage.page).toHaveURL(/\/records$/);
}

async function openAccount(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
}

function accountSummaryValue(page: import('@playwright/test').Page, rowName: string) {
  return page
    .locator('.govuk-summary-list__row')
    .filter({ has: page.locator('.govuk-summary-list__key', { hasText: rowName }) })
    .locator('.govuk-summary-list__value');
}

async function ensureGearAdded(
  accountPage: import('../../pages/accountPage').AccountPage,
  addGearPage: import('../../pages/addGearPage').AddGearPage,
  gearName: string
): Promise<void> {
  const current = await accountPage.getGearOnboardText();
  if (current.includes(gearName)) return;

  await accountPage.clickAddGear();
  await saveGearFromAddPage(addGearPage, gearName);

  await expect(accountPage.page).toHaveURL(/\/account$/);
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

  if (await addGearPage.page.getByRole('heading', { name: /Enter the measurements for/i }).isVisible()) {
    for (const input of await addGearPage.page.locator('main input:visible').all()) {
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
  await expect(addGearPage.page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
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
  await addSpeciesPage.speciesInput().fill(speciesName);
  await accountPage.page.keyboard.press('Enter');
  await expect(accountPage.page).toHaveURL(/\/account$/);
}

async function addPortFromAccount(
  page: import('@playwright/test').Page,
  accountPage: import('../../pages/accountPage').AccountPage,
  portName: string
): Promise<string> {
  await accountPage.addPortLink().click();
  await expect(page).toHaveURL(/\/add-port/);

  await page.getByLabel('Enter the port or closest port you set off from').fill(portName);
  const portOption = page.locator('#port-results li').filter({ hasText: portName }).getByRole('option');
  await expect(portOption).toBeVisible();
  await portOption.click();
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/account$/);
  return portName;
}

test.describe('Complete user account page', () => {
  test.beforeEach(async ({ signInPage, page }) => {
    await signIn(signInPage);
    await openAccount(page);
  });

  test('TS01 - Verify Account Page Loads Successfully', async ({ page, accountPage }) => {
    await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
    await expect(accountPage.personalDetailsHeading()).toBeVisible();
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
  });

  test('TS02 - Verify Personal Details are Displayed', async ({ page, accountPage }) => {
    await expect(accountPage.personalDetailsHeading()).toBeVisible();
    await expect(page.locator('.govuk-summary-list__key', { hasText: 'Email address' })).toBeVisible();
    await expect(page.locator('.govuk-summary-list__key', { hasText: 'Password' })).toBeVisible();
    await expect(page.getByText('Address', { exact: true })).toBeVisible();
  });

  test('TS03 - Verify Vessel Details are Displayed', async ({ accountPage }) => {
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
    await expect(accountPage.vesselNameHeading()).toBeVisible();
  });

  test('TS04 - Verify "Ports Used" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.addPortLink()).toBeVisible();
    await expect(accountPage.removePortLink()).toBeVisible();
  });

  test('TS05 - Verify "Gear Onboard" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.addGearLink()).toBeVisible();
    await expect(accountPage.removeGearLink()).toBeVisible();
  });

  test('TS06 - Verify "Species Caught" Section Presence', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
    await expect(accountPage.addSpeciesLink()).toBeVisible();
    await expect(accountPage.removeSpeciesLink()).toBeVisible();
  });

  test('TS07 - Verify Navigation to Add Gear Screen', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    await expect(addGearPage.gearInput()).toBeVisible();
  });

  test('TS08 - Verify Adding a Single Gear Item', async ({ page, accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('TS09 - Verify Multiple Gear Items Can Be Added', async ({ accountPage, addGearPage }) => {
    const firstGear = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, firstGear);
    await accountPage.clickAddGear();
    const secondGear = await findGear(addGearPage, 'tr', (name) => /traps/i.test(name));
    await saveGearFromAddPage(addGearPage, secondGear);
    await expect(accountPage.gearOnboardValue()).toContainText(firstGear);
    await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
  });

  test('TS10 - Verify Recently Added Gear Appears Without Manual Refresh', async ({ accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('TS11 - Verify Cancel Action in Add Gear Flow', async ({ page, accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    await accountPage.page.goBack();
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('TS12 - Verify Duplicate Gear Handling', async ({ accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText(`${gearName} has already been added to your gear`);
    await expect(accountPage.page).toHaveURL(/\/add-gear\?return=/);
  });

  test('TS13 - Verify Navigation to Remove Gear Screen', async ({ accountPage, removeGearPage }) => {
    await accountPage.clickRemoveGear();
    await expect(removeGearPage.pageHeading()).toBeVisible();
  });

  test('TS15 - Verify Removal of Gear Item', async ({ page, accountPage, addGearPage, removeGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);

    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove(gearName);
    await removeGearPage.clickContinue();

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
  });

  test('TS19 - Verify Navigation to Add Port Screen', async ({ page, accountPage }) => {
    await accountPage.addPortLink().click();
    await expect(page).toHaveURL(/\/add-port/);
  });

  test('TS20 - Verify Adding a Port', async ({ page, accountPage }) => {
    const portName = await addPortFromAccount(page, accountPage, 'Plymouth');
    await expect(accountPage.portsUsedValue()).toContainText(portName);
  });

  test('TS21 - Verify Multiple Ports Can Be Added', async ({ page, accountPage }) => {
    const first = await addPortFromAccount(page, accountPage, 'Plymouth');
    const second = await addPortFromAccount(page, accountPage, 'Lowestoft');
    await expect(accountPage.portsUsedValue()).toContainText(first);
    await expect(accountPage.portsUsedValue()).toContainText(second);
  });

  test('TS23 - Verify Cancel During Add Port Flow', async ({ page, accountPage }) => {
    await accountPage.addPortLink().click();
    await expect(page).toHaveURL(/\/add-port/);
    await page.goBack();
    await expect(page).toHaveURL(/\/account$/);
  });

  test('TS24 - Verify Port Removal Screen Opens', async ({ page, accountPage }) => {
    await accountPage.removePortLink().click();
    await expect(page).toHaveURL(/\/remove-port/);
  });

  test('TS28 - Verify Navigation to Add Species Screen', async ({ page, accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await expect(page).toHaveURL(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
  });

  test('TS29 - Verify Adding a Species', async ({ page, accountPage, addSpeciesPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await ensureSpeciesAdded(accountPage, addSpeciesPage, speciesName);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).toContainText(speciesName);
  });

  test('TS30 - Verify Multiple Species Addition', async ({ accountPage, addSpeciesPage }) => {
    const speciesNames = ['Atlantic cod (COD)', 'Atlantic mackerel (MAC)'];
    for (const species of speciesNames) {
      await ensureSpeciesAdded(accountPage, addSpeciesPage, species);
    }
    for (const species of speciesNames) {
      await expect(accountPage.speciesCaughtValue()).toContainText(species);
    }
  });

  test('TS32 - Verify Cancel During Add Species Flow', async ({ page, accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await expect(page).toHaveURL(/\/add-species\?return=\/account$/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/account$/);
  });

  test('TS33 - Verify Navigation to Remove Species Screen', async ({ page, accountPage, removeSpeciesPage }) => {
    await accountPage.removeSpeciesLink().click();
    await expect(page).toHaveURL(/\/remove-species\?return=\/account$/);
    await expect(removeSpeciesPage.pageHeading()).toBeVisible();
  });

  test('TS34 - Verify Removing Species', async ({ page, accountPage, addSpeciesPage, removeSpeciesPage }) => {
    const speciesName = 'Atlantic cod (COD)';
    await ensureSpeciesAdded(accountPage, addSpeciesPage, speciesName);

    await accountPage.removeSpeciesLink().click();
    await removeSpeciesPage.selectSpeciesToRemove(speciesName);
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
  });

  test('TS37 - Verify Return to Account Page After Add Gear', async ({ page, accountPage, addGearPage }) => {
    const gearOnboard = await accountPage.getGearOnboardText();
    await accountPage.clickAddGear();
    const gearName = await findGear(addGearPage, 'po', (name) => !gearOnboard.includes(name));
    await saveGearFromAddPage(addGearPage, gearName);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('TS38 - Verify Return to Account Page After Remove Gear', async ({
    page,
    accountPage,
    addGearPage,
    removeGearPage
  }) => {
    await ensureGearAdded(accountPage, addGearPage, 'Pots');
    await accountPage.clickRemoveGear();
    await removeGearPage.selectGearToRemove('Pots');
    await removeGearPage.clickContinue();
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('TS39 - Verify Return to Account Page After Add Port', async ({ page, accountPage }) => {
    await addPortFromAccount(page, accountPage, 'Plymouth');
    await expect(accountPage.pageHeading()).toBeVisible();
  });

  test('TS41 - Verify Return to Account Page After Add Species', async ({ page, accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.speciesInput().fill('Atlantic cod (COD)');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/account$/);
  });

  test('TS43 - Verify Added Ports Appear in Catch Record Journey', async ({ page, accountPage }) => {
    const portName = await addPortFromAccount(page, accountPage, 'Plymouth');
    await expect(accountPage.portsUsedValue()).toContainText(portName);
    await page.goto('/records');
    await page.getByRole('button', { name: 'Create a new catch record' }).click();
    await expect(page).toHaveURL(/\/select-vessel$/);
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/trip-date$/);
    await page.getByRole('radio', { name: 'Yes' }).check();
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/add-port\?for=departure/);
    await page.getByLabel('Enter the port or closest port you set off from').fill(portName);
    const portOption = page.locator('#port-results li').filter({ hasText: portName }).getByRole('option');
    await expect(portOption).toBeVisible();
  });

  test('TS44 - Verify Added Gear Appears in Catch Record Journey', async ({
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

  test('TS45 - Verify Added Species Appears in Catch Record Journey', async ({
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

  test('TS50 - Verify Empty State for Ports', async ({ page, accountPage }) => {
    const portsValue = accountSummaryValue(page, 'Ports used');
    await expect(portsValue).toBeVisible();
    await expect(accountPage.addPortLink()).toBeVisible();
    await expect(accountPage.removePortLink()).toBeVisible();
  });

  test('TS51 - Verify Empty State for Gear', async ({ page, accountPage }) => {
    const gearValue = accountSummaryValue(page, 'Gear onboard');
    await expect(gearValue).toBeVisible();
    await expect(accountPage.addGearLink()).toBeVisible();
    await expect(accountPage.removeGearLink()).toBeVisible();
  });

  test('TS52 - Verify Empty State for Species', async ({ page, accountPage }) => {
    const speciesValue = accountSummaryValue(page, 'Species caught');
    await expect(speciesValue).toBeVisible();
    await expect(accountPage.addSpeciesLink()).toBeVisible();
    await expect(accountPage.removeSpeciesLink()).toBeVisible();
  });

  test('TS55 - Verify Changes Persist Within Same Prototype Session', async ({ page, accountPage, addGearPage }) => {
    const gearName = 'Pots';
    await ensureGearAdded(accountPage, addGearPage, gearName);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });

  test('TS57 - Verify Search Prefix Matches a Catalogue Gear Option', async ({ page, accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
    const searchTerm = gearName.slice(0, 2);
    await expect(addGearPage.gearInput()).toHaveAttribute('aria-controls', 'gear-results');
    await addGearPage.gearInput().fill(searchTerm);
    await expect(addGearPage.gearInput()).toHaveValue(searchTerm);
    await addGearPage.searchAndSelectGear(gearName);
    await addGearPage.clickSaveAndContinue();
    await expect(page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
    await expect(page.locator('main input:visible').first()).toBeVisible();
  });

  test('TS58 - Verify Gear Outside the Catalogue Is Rejected', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('TS59 - Verify Gear Selection Is Required', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('TS60 - Verify Gear Measurements Are Required', async ({ page, accountPage, addGearPage }) => {
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

  test('TS61 - Verify Fractional and Negative Measurements Are Rejected', async ({
    page,
    accountPage,
    addGearPage
  }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await selectGearWithMeasurements(addGearPage);
    const measurement = page.locator('main input:visible').first();
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

  test('TS62 - Verify Zero Measurements Are Rejected', async ({ page, accountPage, addGearPage }) => {
    const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
    await accountPage.clickAddGear();
    await selectGearWithMeasurements(addGearPage);
    await page.locator('main input:visible').first().fill('0');
    await addGearPage.clickSaveAndContinue();
    await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto('/account');
    await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
  });

  test('TS63 - Verify Saved Gear Is Available Later in the Same Session', async ({
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

  test('TS64 - Verify Selected Gear Can Be Saved Using Enter', async ({
    page,
    accountPage,
    addGearPage,
    removeGearPage
  }) => {
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

    await expect(page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
    for (const input of await page.locator('main input:visible').all()) {
      for (let tab = 0; tab < 20 && !(await input.evaluate((element) => element === document.activeElement)); tab++) {
        await page.keyboard.press('Tab');
      }
      await expect(input).toBeFocused();
      await page.keyboard.type('1');
      await page.keyboard.press('Tab');
    }
    await expect(saveAndContinueButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
  });
});
