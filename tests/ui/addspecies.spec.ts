import { expect, test } from '../../fixtures/commonfixture';
import { type Page } from '@playwright/test';

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

async function openSpeciesSelection(page: Page): Promise<void> {
  await page.goto('/species-selection');
  await expect(page.getByRole('heading', { name: /What species did you catch/ })).toBeVisible();
}

async function openAddSpecies(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Add species' }).click();
  await expect(page).toHaveURL(/\/add-species\?return=\/species-selection/);
  await expect(page.getByLabel(/Add species to your vessel/)).toBeVisible();
}

async function speciesOptions(page: Page, searchTerm: string): Promise<string[]> {
  await page.getByLabel(/Add species to your vessel/).fill(searchTerm);
  const options = page.getByRole('listbox').getByRole('option');
  await expect(options.first()).toBeVisible();
  return (await options.allTextContents()).map((species) => species.trim());
}

async function findSpecies(
  page: Page,
  searchTerm: string,
  matches: (species: string) => boolean = () => true
): Promise<string> {
  const species = (await speciesOptions(page, searchTerm)).find(matches);
  if (!species) throw new Error('Expected a matching species in the current catalogue');
  return species;
}

async function expectMatchingSpecies(page: Page, searchTerm: string, species: string): Promise<void> {
  const matchingSpecies = (await speciesOptions(page, searchTerm)).filter((option) =>
    option.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
  );
  expect(matchingSpecies).toContain(species);
}

async function selectSpeciesFromSuggestions(page: Page, species: string): Promise<void> {
  const speciesInput = page.getByLabel(/Add species to your vessel/);
  await speciesInput.fill(species.slice(0, 2));
  const speciesOption = page.getByRole('option', { name: species, exact: true });
  await expect(speciesOption).toBeVisible();
  await speciesOption.click();
  await expect(speciesInput).toHaveValue(species);
}

async function addSpecies(page: Page, species: string): Promise<void> {
  await openAddSpecies(page);
  await selectSpeciesFromSuggestions(page, species);
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/species-selection$/);
  await expect(page.getByLabel(species)).toBeVisible();
}

test.describe('Add species to a catch record', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await openSpeciesSelection(page);
  });

  test('TS01 - species search is displayed and accepts user input', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    const species = await findSpecies(page, 'at');
    const searchTerm = species.slice(0, 2);

    await expect(speciesInput).toBeVisible();
    await expect(speciesInput).toBeEditable();
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
  });

  test('TS02 - changing the search term allows another matching catalogue species to be selected', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    const firstSpecies = await findSpecies(page, 'at');
    const firstSearchTerm = firstSpecies.slice(0, 2);
    const secondSpecies = await findSpecies(
      page,
      'ha',
      (species) =>
        species !== firstSpecies && species.slice(0, 2).toLocaleLowerCase() !== firstSearchTerm.toLocaleLowerCase()
    );
    const secondSearchTerm = secondSpecies.slice(0, 2);

    await speciesInput.fill(firstSearchTerm);
    await expect(speciesInput).toHaveValue(firstSearchTerm);
    await expectMatchingSpecies(page, firstSearchTerm, firstSpecies);
    await speciesInput.fill(secondSearchTerm);
    await expect(speciesInput).toHaveValue(secondSearchTerm);
    await expectMatchingSpecies(page, secondSearchTerm, secondSpecies);
    await selectSpeciesFromSuggestions(page, secondSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(page.getByLabel(secondSpecies)).toBeVisible();
  });

  test('TS03 - opens Add Species and adds a selected species to the current catch record', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    const species = await findSpecies(page, 'at');
    await selectSpeciesFromSuggestions(page, species);
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page).toHaveURL(/\/species-selection$/);
    await expect(page.getByLabel(species)).toBeVisible();
  });

  test('TS04 - searches the approved species list after entering at least two characters', async ({ page }) => {
    await openAddSpecies(page);
    const speciesInput = page.getByLabel(/Add species to your vessel/);
    const species = await findSpecies(page, 'at');
    const searchTerm = species.slice(0, 2);
    await speciesInput.fill(searchTerm);
    await expect(speciesInput).toHaveValue(searchTerm);
    await expectMatchingSpecies(page, searchTerm, species);

    await selectSpeciesFromSuggestions(page, species);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page.getByLabel(species)).toBeVisible();
  });

  test('TS05 - adds multiple species while retaining previously added species', async ({ page }) => {
    await openAddSpecies(page);
    const firstSpecies = await findSpecies(page, 'at');
    await selectSpeciesFromSuggestions(page, firstSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);

    await openAddSpecies(page);
    const secondSpecies = await findSpecies(page, 'ha');
    await selectSpeciesFromSuggestions(page, secondSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);

    await expect(page.getByLabel(firstSpecies)).toBeVisible();
    await expect(page.getByLabel(secondSpecies)).toBeVisible();
  });

  test('TS06 - an already-added species remains available in search suggestions', async ({ page }) => {
    await openAddSpecies(page);
    const addedSpecies = await findSpecies(page, 'at');
    await selectSpeciesFromSuggestions(page, addedSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);
    await openAddSpecies(page);
    const remainingOptions = await speciesOptions(page, addedSpecies.slice(0, 2));
    expect(remainingOptions).toContain(addedSpecies);
  });

  test('TS07 - arbitrary text that is not an approved species cannot be added', async ({ page }) => {
    await openAddSpecies(page);
    const invalidSpecies = `Not an approved species ${Date.now()}`;
    await page.getByLabel(/Add species to your vessel/).fill(invalidSpecies);
    await page.getByLabel(/Add species to your vessel/).press('Enter');

    await expect(page.locator('.govuk-error-summary')).toContainText('Enter the species you want to add');
    await expect(page).toHaveURL(/\/add-species/);
    await openSpeciesSelection(page);
    await expect(page.getByLabel(invalidSpecies)).toHaveCount(0);
  });

  test('TS08 - prevents a duplicate species and displays the duplicate message', async ({ page }) => {
    await openAddSpecies(page);
    const species = await findSpecies(page, 'at');
    await selectSpeciesFromSuggestions(page, species);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);
    await openAddSpecies(page);
    await page.getByLabel(/Add species to your vessel/).fill(species);
    const duplicateOption = page.getByRole('option', { name: species, exact: true });
    if (await duplicateOption.isVisible()) await duplicateOption.click();
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.locator('.govuk-error-summary')).toContainText('This species has already been added.');
    await expect(page).toHaveURL(/\/add-species/);
  });

  test('TS09 - retains existing species selection when adding another species', async ({ page }) => {
    await openAddSpecies(page);
    const firstSpecies = await findSpecies(page, 'at');
    await selectSpeciesFromSuggestions(page, firstSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);

    const firstCheckbox = page.getByLabel(firstSpecies);
    await firstCheckbox.check();
    const speciesId = await firstCheckbox.getAttribute('value');
    if (!speciesId) throw new Error('Expected the species checkbox to have an ID value');
    await page.locator(`#weightAboveMinimum-${speciesId}`).fill('5');
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/catch-not-landed$/);

    await openSpeciesSelection(page);
    await expect(page.getByLabel(firstSpecies)).toBeChecked();
    await openAddSpecies(page);
    const secondSpecies = await findSpecies(page, 'ha');
    await selectSpeciesFromSuggestions(page, secondSpecies);
    await page.getByRole('button', { name: 'Save and continue' }).click();
    await expect(page).toHaveURL(/\/species-selection$/);

    await expect(page.getByLabel(firstSpecies)).toBeChecked();
    await expect(page.getByLabel(secondSpecies)).toBeVisible();
  });

  test('TS10 - requires at least one species before continuing', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.locator('.govuk-error-summary')).toContainText('Select at least one species');
    await expect(page).toHaveURL(/\/species-selection$/);
  });
});
