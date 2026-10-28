import { expect, test } from '../../fixtures/commonfixture';

const accountPath = '/account';

function occurrences(text: string, value: string): number {
  return text.split(value).length - 1;
}

test.describe('Add favourite gear', () => {
  // Tests share one account's favourite gear, so parallel runs would interfere
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ navigationFlow, gearFlow }) => {
    await navigationFlow.signIn();
    await gearFlow.removeSavedGears(['Long line', 'Set net', 'Pots']);
  });

  test('shows a matching gear option and the required fields after selection', async ({
    navigationFlow,
    gearFlow,
    addGearPage
  }) => {
    await navigationFlow.openAddGear();
    const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));

    await addGearPage.searchAndSelectGear(gearName);
    await expect(addGearPage.gearInput()).toHaveValue(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.measurementsHeading()).toBeVisible();
    await expect(addGearPage.measurementInputs().first()).toBeVisible();
  });

  test('searches approved gear and rejects a value outside the catalogue', async ({ navigationFlow, addGearPage }) => {
    await navigationFlow.openAddGear();
    await expect(addGearPage.pageHeading()).toBeVisible();
    const [firstGear] = await addGearPage.searchGearOptions('po');
    expect(firstGear).toBeTruthy();
    await expect(addGearPage.gearResultsList().getByRole('option', { name: firstGear!, exact: true })).toBeVisible();

    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('requires a gear type before continuing', async ({ navigationFlow, addGearPage }) => {
    await navigationFlow.openAddGear();
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('saves gear with measurements and makes it available for the next catch record', async ({
    navigationFlow,
    gearFlow,
    page,
    accountPage,
    gearSelectionPage
  }) => {
    await navigationFlow.openAddGear();
    const gearName = await gearFlow.saveLineGear();

    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('shows saved pots measurement under the favourite gear on the account page', async ({
    navigationFlow,
    gearFlow,
    accountPage
  }) => {
    await navigationFlow.openAddGear();
    await gearFlow.savePots('45');

    await expect(accountPage.gearOnboardValue()).toContainText('Pots');
    await expect(accountPage.gearOnboardValue()).toContainText(/Gear dimension by number.*: 45/);
  });

  test('does not offer a gear that is already a favourite in the search list', async ({
    navigationFlow,
    gearFlow,
    addGearPage
  }) => {
    await navigationFlow.openAddGear();
    await gearFlow.savePots('45');

    await navigationFlow.openAddGear();
    await addGearPage.gearInput().pressSequentially('Pot');
    await expect(addGearPage.gearOption('Pots')).toHaveCount(0);
  });

  test('blocks adding a gear that is already a favourite', async ({
    navigationFlow,
    gearFlow,
    page,
    addGearPage,
    accountPage
  }) => {
    await navigationFlow.openAddGear();
    await gearFlow.savePots('45');

    await navigationFlow.openAddGear();
    await addGearPage.gearInput().fill('Pots');
    await addGearPage.clickSaveAndContinue();

    await addGearPage.expectUrl(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toContainText('Pots has already been added to your gear');
    await expect(addGearPage.errorMessage()).toContainText('Pots has already been added to your gear');

    await page.goto(accountPath);
    expect(occurrences(await accountPage.getGearOnboardText(), 'Pots')).toBe(1);
    await expect(accountPage.gearOnboardValue()).toContainText(/: 45/);
  });

  test('lists a duplicate-attempted gear only once on the remove gear page', async ({
    navigationFlow,
    gearFlow,
    page,
    addGearPage,
    accountPage,
    removeGearPage
  }) => {
    await navigationFlow.openAddGear();
    await gearFlow.savePots('45');
    await navigationFlow.openAddGear();
    await addGearPage.gearInput().fill('Pots');
    await addGearPage.clickSaveAndContinue();

    await page.goto(accountPath);
    await accountPage.clickRemoveGear();
    await expect(removeGearPage.gearCheckbox('Pots')).toHaveCount(1);
  });

  test('keeps multiple different favourite gears', async ({ navigationFlow, gearFlow, addGearPage, accountPage }) => {
    await navigationFlow.openAddGear();
    const lineGear = await gearFlow.saveLineGear();

    await navigationFlow.openAddGear();
    const secondGear = await gearFlow.findGear('po', (name) => name !== lineGear);
    await addGearPage.searchAndSelectGear(secondGear);
    await addGearPage.clickSaveAndContinue();
    const measurementsHeading = addGearPage.measurementsHeading();
    if (await measurementsHeading.isVisible()) {
      for (const input of await addGearPage.measurementInputs().all()) {
        await input.fill('1');
      }
      await addGearPage.clickSaveAndContinue();
    }

    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.gearOnboardValue()).toContainText(lineGear);
    await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
  });

  test('does not save gear when required measurements are missing', async ({
    navigationFlow,
    gearFlow,
    addGearPage
  }) => {
    await navigationFlow.openAddGear();
    await gearFlow.selectLineGear();
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('rejects fractional and negative measurements', async ({ navigationFlow, gearFlow, addGearPage }) => {
    await navigationFlow.openAddGear();
    await gearFlow.selectLineGear();
    const input = addGearPage.measurementInputs().first();
    await input.fill('1.5');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await addGearPage.expectUrl(/\/add-gear/);
    await input.fill('-1');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('rejects zero measurements', async ({ navigationFlow, gearFlow, addGearPage }) => {
    await navigationFlow.openAddGear();
    await gearFlow.selectLineGear();
    await addGearPage.measurementInputs().first().fill('0');
    await addGearPage.clickSaveAndContinue();

    await addGearPage.expectUrl(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toBeVisible();
  });

  test('offers saved gear when starting a new catch record in the same session', async ({
    navigationFlow,
    gearFlow,
    page,
    recordsPage,
    accountPage,
    gearSelectionPage,
    selectVesselPage
  }) => {
    await navigationFlow.openAddGear();
    const gearName = await gearFlow.saveLineGear();

    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
    await page.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(selectVesselPage.pageHeading()).toBeVisible();
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await selectVesselPage.expectUrl(/\/trip-date$/);
    await page.goto('/gear-selection');

    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('can save selected gear using the keyboard', async ({
    navigationFlow,
    gearFlow,
    page,
    addGearPage,
    accountPage
  }) => {
    await navigationFlow.openAddGear();
    const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
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
