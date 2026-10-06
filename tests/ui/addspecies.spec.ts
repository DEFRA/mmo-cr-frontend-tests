import { expect, test } from '../../fixtures/commonfixture';

async function signIn(page: import('@playwright/test').Page): Promise<void> {
  const email = process.env.CATCH_RECORDING_EMAIL;
  const password = process.env.CATCH_RECORDING_PASSWORD;
  if (!email || !password) {
    throw new Error('CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add species UI tests');
  }

  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/records$/);
}

async function openSpeciesSelection(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/species-selection');
  await expect(page.getByRole('heading', { name: /What species did you catch/ })).toBeVisible();
}

async function openAddSpecies(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('link', { name: 'Add species' }).click();
  await expect(page).toHaveURL(/\/add-species\?return=\/species-selection/);
  await expect(page.getByLabel(/Add species to your vessel/)).toBeVisible();
}

async function addSpecies(page: import('@playwright/test').Page, species: string): Promise<void> {
  await openAddSpecies(page);
  await page.getByLabel(/Add species to your vessel/).fill(species);
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/species-selection$/);
}

test.describe('Add species to a catch record', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await openSpeciesSelection(page);
  });

  test('TS01 - species search is displayed and accepts user input', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);

    await expect(speciesInput).toBeVisible();
    await expect(speciesInput).toBeEditable();
    await speciesInput.fill('He');
    await expect(speciesInput).toHaveValue('He');
  });

  test('TS02 - changing the search term allows another matching catalogue species to be selected', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);

    await speciesInput.fill('He');
    await expect(page.locator('#species-options option[value="Herring (HER)"]')).toHaveCount(1);
    await speciesInput.fill('Mac');
    await expect(page.locator('#species-options option[value="Mackerel (MAC)"]')).toHaveCount(1);
    await speciesInput.fill('Mackerel (MAC)');
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(page.getByLabel('Mackerel (MAC)')).toBeVisible();
  });

  test('TS03 - opens Add Species and adds a selected species to the current catch record', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    await expect(page.locator('#species-options option[value="Herring (HER)"]')).toHaveCount(1);
    await speciesInput.fill('Herring (HER)');
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(page.getByLabel('Herring (HER)')).toBeVisible();
  });

  test('TS04 - searches the approved species list after entering at least two characters', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    await speciesInput.fill('He');
    await expect(page.locator('#species-options option[value="Herring (HER)"]')).toHaveCount(1);

    await speciesInput.fill('Herring (HER)');
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page.getByLabel('Herring (HER)')).toBeVisible();
  });

  test('TS05 - adds multiple species while retaining previously added species', async ({ page }) => {
    await addSpecies(page, 'Herring (HER)');
    await addSpecies(page, 'Mackerel (MAC)');

    await expect(page.getByLabel('Herring (HER)')).toBeVisible();
    await expect(page.getByLabel('Mackerel (MAC)')).toBeVisible();
  });

  test('TS06 - an already-added species is omitted from the available species options', async ({ page }) => {
    await addSpecies(page, 'Herring (HER)');
    await openAddSpecies(page);

    await expect(page.locator('#species-options option[value="Herring (HER)"]')).toHaveCount(0);
    await expect(page.locator('#species-options option[value="Mackerel (MAC)"]')).toHaveCount(1);
  });

  test('TS07 - arbitrary text that is not an approved species cannot be added', async ({ page }) => {
    await openAddSpecies(page);
    await page.getByLabel(/Add species to your vessel/).fill('Not an approved species');
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.locator('.govuk-error-summary')).toContainText('Select a species to add');
    await expect(page).toHaveURL(/\/add-species/);
    await openSpeciesSelection(page);
    await expect(page.getByLabel('Not an approved species')).toHaveCount(0);
  });

  test('TS08 - prevents a duplicate species and displays the duplicate message', async ({ page }) => {
    await addSpecies(page, 'Herring (HER)');
    await openAddSpecies(page);
    await page.getByLabel(/Add species to your vessel/).fill('Herring (HER)');
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.locator('.govuk-error-summary')).toContainText('This species has already been added.');
    await expect(page).toHaveURL(/\/add-species/);
  });

  test('TS09 - retains existing species selection when adding another species', async ({ page }) => {
    await addSpecies(page, 'Herring (HER)');
    await page.getByLabel('Herring (HER)').check();
    await page.locator('#weightAboveMinimum-her').fill('5');
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/catch-not-landed$/);

    await openSpeciesSelection(page);
    await expect(page.getByLabel('Herring (HER)')).toBeChecked();
    await addSpecies(page, 'Mackerel (MAC)');

    await expect(page.getByLabel('Herring (HER)')).toBeChecked();
    await expect(page.getByLabel('Mackerel (MAC)')).toBeVisible();
  });

  test('TS10 - requires at least one species before continuing', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.locator('.govuk-error-summary')).toContainText('Select at least one species');
    await expect(page).toHaveURL(/\/species-selection$/);
  });
});
