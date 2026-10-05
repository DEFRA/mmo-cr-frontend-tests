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

async function selectLongLine(addGearPage: AddGearPage): Promise<void> {
  await addGearPage.searchAndSelectGear('Long line');
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.page.getByRole('heading', { name: 'Enter the measurements for long line' })).toBeVisible();
}

async function saveLongLine(addGearPage: AddGearPage): Promise<void> {
  await selectLongLine(addGearPage);
  await addGearPage.hooksHauledInput().fill('12');
  await addGearPage.hooksInWaterInput().fill('3');
  await addGearPage.clickSaveAndContinue();
  await expect(addGearPage.page).toHaveURL(/\/account$/);
}

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signIn(signInPage);
  });

  test('shows a matching gear option and the required fields after selection', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await addGearPage.gearInput().fill('Long');
    await expect(addGearPage.gearResultsList().locator('option[value="Long line"]')).toHaveCount(1);

    await addGearPage.searchAndSelectGear('Long line');
    await expect(addGearPage.gearInput()).toHaveValue('Long line');
    await addGearPage.clickSaveAndContinue();

    await expect(page.getByRole('heading', { name: 'Enter the measurements for long line' })).toBeVisible();
    await expect(addGearPage.hooksHauledInput()).toBeVisible();
    await expect(addGearPage.hooksInWaterInput()).toBeVisible();
  });

  test('searches approved gear and rejects a value outside the catalogue', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await expect(addGearPage.pageHeading()).toBeVisible();
    await expect(addGearPage.gearResultsList().locator('option[value="Long line"]')).toHaveCount(1);

    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('requires a gear type before continuing', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Enter the name of the gear you want to add');
    await expect(page).toHaveURL(/\/add-gear/);
  });

  test('saves gear with measurements and makes it available for the next catch record', async ({
    page,
    addGearPage,
    gearSelectionPage,
  }) => {
    await openAddGear(page);
    await saveLongLine(addGearPage);

    await expect(accountGear(page)).toContainText('Long line');
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox('Long line')).toBeVisible();
  });

  test('keeps multiple different favourite gears', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await saveLongLine(addGearPage);

    await openAddGear(page);
    await addGearPage.searchAndSelectGear('Set net');
    await addGearPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountGear(page)).toContainText('Long line');
    await expect(accountGear(page)).toContainText('Set net');
  });

  test('does not save gear when mandatory hook measurements are missing', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLongLine(addGearPage);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks hauled');
    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks left in water');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto(accountPath);
    await expect(accountGear(page)).not.toContainText('Long line');
  });

  test('rejects fractional and negative hook measurements', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLongLine(addGearPage);
    await addGearPage.hooksHauledInput().fill('1.5');
    await addGearPage.hooksInWaterInput().fill('-1');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks hauled');
    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks left in water');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto(accountPath);
    await expect(accountGear(page)).not.toContainText('Long line');
  });

  test('rejects alphabetic and special characters in hook measurements', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLongLine(addGearPage);
    await addGearPage.hooksHauledInput().fill('abc');
    await addGearPage.hooksInWaterInput().fill('3');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks hauled');
    await expect(page).toHaveURL(/\/add-gear/);

    await addGearPage.hooksHauledInput().fill('12');
    await addGearPage.hooksInWaterInput().fill('@');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Enter the total hooks left in water');
    await expect(page).toHaveURL(/\/add-gear/);
    await page.goto(accountPath);
    await expect(accountGear(page)).not.toContainText('Long line');
  });

  test('rejects zero hook measurements', async ({ page, addGearPage }) => {
    await openAddGear(page);
    await selectLongLine(addGearPage);
    await addGearPage.hooksHauledInput().fill('0');
    await addGearPage.hooksInWaterInput().fill('0');
    await addGearPage.clickSaveAndContinue();

    await expect(page).toHaveURL(/\/add-gear/);
    await expect(addGearPage.errorSummary()).toBeVisible();
    await page.goto(accountPath);
    await expect(accountGear(page)).not.toContainText('Long line');
  });

  test('offers saved gear when starting a new catch record in the same session', async ({
    page,
    recordsPage,
    addGearPage,
    gearSelectionPage,
  }) => {
    await openAddGear(page);
    await saveLongLine(addGearPage);

    await expect(accountGear(page)).toContainText('Long line');
    await page.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(page).toHaveURL(/\/draft$/);
    await page.goto('/gear-selection');

    await expect(gearSelectionPage.gearCheckbox('Long line')).toBeVisible();
  });

  test('can select and save gear using only the keyboard', async ({ page, addGearPage }) => {
    await openAddGear(page);

    for (
      let tab = 0;
      tab < 20 && !(await addGearPage.gearInput().evaluate((input) => input === document.activeElement));
      tab++
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(addGearPage.gearInput()).toBeFocused();
    await page.keyboard.type('Long line');
    await page.keyboard.press('Tab');
    await expect(addGearPage.common.saveAndContinueButton()).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Enter the measurements for long line' })).toBeVisible();
    for (
      let tab = 0;
      tab < 20 && !(await addGearPage.hooksHauledInput().evaluate((input) => input === document.activeElement));
      tab++
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(addGearPage.hooksHauledInput()).toBeFocused();
    await page.keyboard.type('12');
    await page.keyboard.press('Tab');
    await expect(addGearPage.hooksInWaterInput()).toBeFocused();
    await page.keyboard.type('3');
    await page.keyboard.press('Tab');
    await expect(addGearPage.common.saveAndContinueButton()).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountGear(page)).toContainText('Long line');
  });
});
