import { type Page } from '@playwright/test';
import { expect, test } from '../../fixtures/commonfixture';
import { type SigninPage } from '../../pages/sign-in.page';
import { type AddGearPage } from '../../pages/addGearPage';

const accountPath = '/account';

async function signIn(signInPage: SigninPage): Promise<void> {
  const email = process.env.CATCH_RECORDING_EMAIL;
  const password = process.env.CATCH_RECORDING_PASSWORD;
  if (!email || !password) {
    throw new Error('CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add gear UI tests');
  }

  await signInPage.goto('/sign-in');
  await signInPage.login(email, password);
  await expect(signInPage.page).toHaveURL(/\/records$/);
}

async function openAddGear(page: Page): Promise<void> {
  await page.goto(accountPath);
  await page.getByRole('link', { name: 'Add gear gear' }).click();
  await expect(page).toHaveURL(/\/add-gear\?return=/);
}

function accountGear(page: Page) {
  return page.getByText('Gear onboard', { exact: true }).locator('..').locator('.govuk-summary-list__value');
}

async function findGear(
  addGearPage: AddGearPage,
  searchTerm: string,
  matches: (name: string) => boolean
): Promise<string> {
  const gearName = (await addGearPage.searchGearOptions(searchTerm)).find(matches);
  if (!gearName) throw new Error(`No gear option matched search term "${searchTerm}"`);
  return gearName;
}

function measurementInputs(page: Page) {
  return page.locator('main input:visible');
}

async function selectLineGear(addGearPage: AddGearPage): Promise<string> {
  const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));
  await addGearPage.searchAndSelectGear(gearName);
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
  return gearName;
}

async function saveLineGear(addGearPage: AddGearPage): Promise<string> {
  const gearName = await selectLineGear(addGearPage);
  for (const input of await measurementInputs(addGearPage.page).all()) {
    await input.fill('1');
  }
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.page).toHaveURL(/\/account$/);
  return gearName;
}

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signIn(signInPage);
  });

  test('shows a matching gear option and the required fields after selection', async ({ page, addGearPage }) => {
    await openAddGear(page);
    const gearName = await findGear(addGearPage, 'lo', (name) => /line/i.test(name));

    await addGearPage.searchAndSelectGear(gearName);
    await expect(addGearPage.gearInput()).toHaveValue(gearName);
    await addGearPage.clickSaveAndContinue();

    await expect(page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
    await expect(measurementInputs(page).first()).toBeVisible();
  });

  test('searches approved gear and rejects a value outside the catalogue', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await expect(addGearPage.pageHeading()).toBeVisible();
    const [firstGear] = await addGearPage.searchGearOptions('po');
    expect(firstGear).toBeTruthy();
    await expect(addGearPage.gearResultsList().getByRole('option', { name: firstGear!, exact: true })).toBeVisible();

    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('requires a gear type before continuing', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('saves gear with measurements and makes it available for the next catch record', async ({
    page,
    addGearPage,
    gearSelectionPage
  }) => {
    await openAddGear(page);
    const gearName = await saveLineGear(addGearPage);

    await expect(accountGear(page)).toContainText(gearName);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('keeps multiple different favourite gears', async ({ page, addGearPage }) => {
    await openAddGear(page);
    const lineGear = await saveLineGear(addGearPage);

    await openAddGear(page);
    const secondGear = await findGear(addGearPage, 'po', (name) => name !== lineGear);
    await addGearPage.searchAndSelectGear(secondGear);
    await addGearPage.clickSaveAndContinue();
    const measurementsHeading = page.getByRole('heading', { name: /Enter the measurements for/i });
    if (await measurementsHeading.isVisible()) {
      for (const input of await measurementInputs(page).all()) {
        await input.fill('1');
      }
      await addGearPage.clickSaveAndContinue();
    }

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountGear(page)).toContainText(lineGear);
    await expect(accountGear(page)).toContainText(secondGear);
  });

  test('does not save gear when required measurements are missing', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLineGear(addGearPage);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('rejects fractional and negative measurements', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLineGear(addGearPage);
    const input = measurementInputs(page).first();
    await input.fill('1.5');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
    await input.fill('-1');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toBeVisible();
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('rejects zero measurements', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLineGear(addGearPage);
    await measurementInputs(page).first().fill('0');
    await addGearPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toBeVisible();
  });

  test('offers saved gear when starting a new catch record in the same session', async ({
    page,
    recordsPage,
    addGearPage,
    gearSelectionPage,
    selectVesselPage
  }) => {
    await openAddGear(page);
    const gearName = await saveLineGear(addGearPage);

    await expect(accountGear(page)).toContainText(gearName);
    await page.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(selectVesselPage.pageHeading()).toBeVisible();
    await selectVesselPage.page.getByRole('radio').first().check();
    await selectVesselPage.clickSaveAndContinue();
    await expect(page).toHaveURL(/\/trip-date$/);
    await page.goto('/gear-selection');

    await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
  });

  test('can save selected gear using the keyboard', async ({ page, addGearPage }) => {
    await openAddGear(page);
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

    await expect(page.getByRole('heading', { name: /Enter the measurements for/i })).toBeVisible();
    for (const input of await measurementInputs(page).all()) {
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
    await expect(accountGear(page)).toContainText(gearName);
  });
});
