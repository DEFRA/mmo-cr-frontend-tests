import { type Page } from '@playwright/test';
import { expect, test } from '../../fixtures/commonfixture';
import { type AddGearPage } from '../../pages/addGearPage';
import { type AccountPage } from '../../pages/accountPage';
import { type RemoveGearPage } from '../../pages/removeGearPage';
import { NavigationFlow } from './helpers/navigationFlow';

const accountPath = '/account';

async function findGear(
  addGearPage: AddGearPage,
  searchTerm: string,
  matches: (name: string) => boolean
): Promise<string> {
  const gearName = (await addGearPage.searchGearOptions(searchTerm)).find(matches);
  if (!gearName) throw new Error(`No gear option matched search term "${searchTerm}"`);
  return gearName;
}

async function selectLineGear(addGearPage: AddGearPage): Promise<string> {
  const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
  await addGearPage.searchAndSelectGear(gearName);
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.measurementsHeading()).toBeVisible();
  return gearName;
}

async function saveLineGear(addGearPage: AddGearPage): Promise<string> {
  const gearName = await selectLineGear(addGearPage);
  for (const input of await addGearPage.measurementInputs().all()) {
    await input.fill('1');
  }
  await addGearPage.clickSaveAndContinue();
  await addGearPage.expectUrl(/\/account$/);
  return gearName;
}

async function selectLongLine(addGearPage: AddGearPage): Promise<void> {
  await addGearPage.searchAndSelectGear('Long line');
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.measurementsHeading('long line')).toBeVisible();
}

async function saveLongLine(addGearPage: AddGearPage, hooksHauled = '12', hooksInWater = '3'): Promise<void> {
  await selectLongLine(addGearPage);
  await addGearPage.hooksHauledInput().fill(hooksHauled);
  await addGearPage.hooksInWaterInput().fill(hooksInWater);
  await addGearPage.clickSaveAndContinue();
  await addGearPage.expectUrl(/\/account$/);
}

async function savePots(addGearPage: AddGearPage, gearDimension: string): Promise<void> {
  await addGearPage.searchAndSelectGear('Pots');
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.measurementsHeading('pots')).toBeVisible();
  await addGearPage.gearDimensionInput().fill(gearDimension);
  await addGearPage.clickSaveAndContinue();
  await addGearPage.expectUrl(/\/account$/);
}

async function removeSavedGear(
  page: Page,
  accountPage: AccountPage,
  removeGearPage: RemoveGearPage,
  gearNames: string[]
): Promise<void> {
  await page.goto(accountPath);
  const gearText = await accountPage.getGearOnboardText();
  const present = gearNames.filter((name) => gearText.includes(name));
  if (present.length === 0) return;

  await accountPage.clickRemoveGear();
  await removeGearPage.selectGearToRemove(...present);
  await removeGearPage.clickContinue();
  await accountPage.expectUrl(/\/account$/);
}

function occurrences(text: string, value: string): number {
  return text.split(value).length - 1;
}

test.describe('Add favourite gear', () => {
  // Tests share one account's favourite gear, so parallel runs would interfere
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, signInPage, accountPage, removeGearPage }) => {
    await NavigationFlow.signIn(signInPage);
    await removeSavedGear(page, accountPage, removeGearPage, ['Long line', 'Set net', 'Pots']);
  });

  test('shows a matching gear option and the required fields after selection', async ({ addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));

    await addGearPage.searchAndSelectGear(gearName);
    await expect(addGearPage.gearInput()).toHaveValue(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.measurementsHeading()).toBeVisible();
    await expect(addGearPage.measurementInputs().first()).toBeVisible();
  });

  test('searches approved gear and rejects a value outside the catalogue', async ({
    page,
    addGearPage,
    accountPage
  }) => {
    await NavigationFlow.openAddGear(accountPage);
    await expect(addGearPage.pageHeading()).toBeVisible();
    const [firstGear] = await addGearPage.searchGearOptions('po');
    expect(firstGear).toBeTruthy();
    await expect(addGearPage.gearResultsList().getByRole('option', { name: firstGear!, exact: true })).toBeVisible();

    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('requires a gear type before continuing', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('saves gear with measurements and makes it available for the next catch record', async ({
    page,
    addGearPage,
    accountPage,
    gearSelectionPage
  }) => {
    await NavigationFlow.openAddGear(accountPage);
    const gearName = await saveLineGear(addGearPage);

    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('shows saved pots measurement under the favourite gear on the account page', async ({
    addGearPage,
    accountPage
  }) => {
    await NavigationFlow.openAddGear(accountPage);
    await savePots(addGearPage, '45');

    await expect(accountPage.gearOnboardValue()).toContainText('Pots');
    await expect(accountPage.gearOnboardValue()).toContainText(/Gear dimension by number.*: 45/);
  });

  test('does not offer a gear that is already a favourite in the search list', async ({ addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await savePots(addGearPage, '45');

    await NavigationFlow.openAddGear(accountPage);
    await addGearPage.gearInput().pressSequentially('Pot');
    await expect(addGearPage.gearOption('Pots')).toHaveCount(0);
  });

  test('blocks adding a gear that is already a favourite', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await savePots(addGearPage, '45');

    await NavigationFlow.openAddGear(accountPage);
    await addGearPage.gearInput().fill('Pots');
    await addGearPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toContainText('Pots has already been added to your gear');
    await expect(addGearPage.errorMessage()).toContainText('Pots has already been added to your gear');

    await page.goto(accountPath);
    expect(occurrences(await accountPage.getGearOnboardText(), 'Pots')).toBe(1);
    await expect(accountPage.gearOnboardValue()).toContainText(/: 45/);
  });

  test('lists a duplicate-attempted gear only once on the remove gear page', async ({
    page,
    addGearPage,
    accountPage,
    removeGearPage
  }) => {
    await NavigationFlow.openAddGear(accountPage);
    await savePots(addGearPage, '45');
    await NavigationFlow.openAddGear(accountPage);
    await addGearPage.gearInput().fill('Pots');
    await addGearPage.clickSaveAndContinue();

    await page.goto(accountPath);
    await accountPage.clickRemoveGear();
    await expect(removeGearPage.gearCheckbox('Pots')).toHaveCount(1);
  });

  test('keeps multiple different favourite gears', async ({ addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    const lineGear = await saveLineGear(addGearPage);

    await NavigationFlow.openAddGear(accountPage);
    const secondGear = await findGear(addGearPage, 'po', (name) => name !== lineGear);
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

  test('does not save gear when required measurements are missing', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await selectLineGear(addGearPage);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('rejects fractional and negative measurements', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await selectLineGear(addGearPage);
    const input = addGearPage.measurementInputs().first();
    await input.fill('1.5');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
    await input.fill('-1');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('rejects zero measurements', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    await selectLineGear(addGearPage);
    await addGearPage.measurementInputs().first().fill('0');
    await addGearPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toBeVisible();
  });

  test('offers saved gear when starting a new catch record in the same session', async ({
    page,
    recordsPage,
    addGearPage,
    accountPage,
    gearSelectionPage,
    selectVesselPage
  }) => {
    await NavigationFlow.openAddGear(accountPage);
    const gearName = await saveLineGear(addGearPage);

    await expect(accountPage.gearOnboardValue()).toContainText(gearName);
    await page.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(selectVesselPage.pageHeading()).toBeVisible();
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/trip-date$/);
    await page.goto('/gear-selection');

    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('can save selected gear using the keyboard', async ({ page, addGearPage, accountPage }) => {
    await NavigationFlow.openAddGear(accountPage);
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
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
