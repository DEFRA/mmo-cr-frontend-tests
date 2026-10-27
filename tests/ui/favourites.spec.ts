/*
 * CAR-80 favourite species, ports and gear (sign-in is mocked, so blank credentials are accepted):
 *   npx playwright test tests/ui/favourites.spec.ts --project=Chromium
 * Gear add/remove/duplicate is covered in addgear.spec.ts and favourite-gear.spec.ts.
 */
import { expect, test } from '../../fixtures/commonfixture';

const accountPath = '/account';
const departurePortLabel = 'Enter the port or closest port you set off from';

test.describe('CAR-80 favourites', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.goto('/sign-in');
    await signInPage.login(process.env.CATCH_RECORDING_EMAIL ?? '', process.env.CATCH_RECORDING_PASSWORD ?? '');
    await expect(signInPage.page).toHaveURL(/\/records$/);
    await signInPage.goto(accountPath);
  });

  test.describe('FR1 view favourites', () => {
    test('account page groups favourites into ports, gear and species with add and remove links', async ({
      accountPage
    }) => {
      for (const key of ['Ports used', 'Gear onboard', 'Species caught']) {
        await expect(accountPage.summaryRow(key)).toBeVisible();
      }
      await expect(accountPage.addPortLink()).toBeVisible();
      await expect(accountPage.removePortLink()).toBeVisible();
      await expect(accountPage.addGearLink()).toBeVisible();
      await expect(accountPage.removeGearLink()).toBeVisible();
      await expect(accountPage.addSpeciesLink()).toBeVisible();
      await expect(accountPage.removeSpeciesLink()).toBeVisible();
    });
  });

  test.describe('Favourite ports', () => {
    test('AC4 searches with a partial name and saves the selected port as a favourite', async ({
      page,
      accountPage,
      addPortPage
    }) => {
      await accountPage.addPortLink().click();
      await page.getByLabel(departurePortLabel).fill('Plym');
      await expect(addPortPage.portResultItem('Plymouth')).toBeVisible();
      await addPortPage.portResultItem('Plymouth').click();
      await addPortPage.clickSaveAndContinue();

      await expect(page).toHaveURL(/\/account$/);
      await expect(accountPage.portsUsedValue()).toContainText('Plymouth');
    });

    test('AC11 rejects a port that is not in the reference data', async ({ page, accountPage, addPortPage }) => {
      await accountPage.addPortLink().click();
      await page.getByLabel(departurePortLabel).fill('Notaport Town');
      await addPortPage.clickSaveAndContinue();

      await expect(page.locator('.govuk-error-summary')).toContainText('Select a port from the list');
      await expect(page).toHaveURL(/\/add-port/);
      await page.goto(accountPath);
      await expect(accountPage.portsUsedValue()).not.toContainText('Notaport Town');
    });

    test('requires a port before continuing', async ({ page, accountPage, addPortPage }) => {
      await accountPage.addPortLink().click();
      await addPortPage.clickSaveAndContinue();

      await expect(page.locator('.govuk-error-summary')).toContainText('Select a port from the list');
    });

    test('FR5 does not create a duplicate when an existing favourite port is added again', async ({
      page,
      accountPage,
      addPortPage
    }) => {
      const existing = (await accountPage.portsUsedValue().innerText()).trim().split('\n')[0]!.trim();
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort(existing);
      await addPortPage.clickSaveAndContinue();

      await page.goto(accountPath);
      const ports = (await accountPage.portsUsedValue().innerText()).split('\n').map((p) => p.trim());
      expect(ports.filter((p) => p === existing)).toHaveLength(1);
    });

    test('FR5 tells the user when the port is already a favourite', async ({ page, accountPage, addPortPage }) => {
      test.fail(true, 'Known gap: duplicate port is silently ignored with no informative message');
      const existing = (await accountPage.portsUsedValue().innerText()).trim().split('\n')[0]!.trim();
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort(existing);
      await addPortPage.clickSaveAndContinue();

      await expect(page.locator('.govuk-error-summary')).toBeVisible({ timeout: 5000 });
    });

    test('requires a port to be selected before removing', async ({ accountPage, removePortPage }) => {
      await accountPage.removePortLink().click();
      await expect(removePortPage.pageHeading()).toBeVisible();
      await removePortPage.continueButton().click();

      await expect(removePortPage.errorSummary()).toContainText('Select the port you want to remove');
    });

    test('AC7 removes a favourite port from the account', async ({
      page,
      accountPage,
      addPortPage,
      removePortPage
    }) => {
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort('Plymouth');
      await addPortPage.clickSaveAndContinue();
      await expect(accountPage.portsUsedValue()).toContainText('Plymouth');

      await accountPage.removePortLink().click();
      await removePortPage.removePorts('Plymouth');

      await expect(page).toHaveURL(/\/account$/);
      await expect(accountPage.portsUsedValue()).not.toContainText('Plymouth');
    });

    test('AC10 shows favourite ports first when searching for a departure port', async ({
      page,
      accountPage,
      addPortPage
    }) => {
      test.fail(true, 'Known gap: port results are alphabetical and do not prioritise favourites');
      await expect(accountPage.portsUsedValue()).toContainText('Hastings');

      await page.goto('/add-port?for=departure&entry=1');
      await page.getByLabel(departurePortLabel).fill('Ha');
      await expect(addPortPage.portResultItem('Hastings')).toBeVisible();
      await expect(addPortPage.portResultsList().locator('li').first()).toHaveText(/Hastings/, { timeout: 5000 });
    });
  });

  test.describe('Favourite species', () => {
    test('AC1 adds a species from the approved list to favourites', async ({ page, accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await expect(addSpeciesPage.speciesOption('European plaice (PLE)')).toHaveCount(1);
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(page).toHaveURL(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');
    });

    test('AC2 blocks a duplicate favourite species with an informative message', async ({
      page,
      accountPage,
      addSpeciesPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await expect(addSpeciesPage.speciesOption('Atlantic cod (COD)')).toHaveCount(0);
      await addSpeciesPage.speciesInput().fill('Atlantic cod (COD)');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('This species has already been added.');
      await page.goto(accountPath);
      const species = await accountPage.speciesCaughtValue().innerText();
      expect(species.split('Atlantic cod (COD)')).toHaveLength(2);
    });

    test('AC11 rejects a species that is not in the reference data', async ({ page, accountPage, addSpeciesPage }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('Not a fish');
      await addSpeciesPage.clickSaveAndContinue();

      await expect(addSpeciesPage.errorSummary()).toContainText('Select a species to add');
      await expect(page).toHaveURL(/\/add-species/);
    });

    test('requires a species to be selected before removing', async ({ accountPage, removeSpeciesPage }) => {
      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(removeSpeciesPage.errorSummary()).toContainText('Select the species you want to remove');
    });

    test('AC5 removes a favourite species from the account', async ({
      page,
      accountPage,
      addSpeciesPage,
      removeSpeciesPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      await expect(accountPage.speciesCaughtValue()).toContainText('European plaice (PLE)');

      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.selectSpeciesToRemove('European plaice (PLE)');
      await removeSpeciesPage.clickSaveAndContinue();

      await expect(page).toHaveURL(/\/account$/);
      await expect(accountPage.speciesCaughtValue()).not.toContainText('European plaice (PLE)');
    });

    test('AC9 shows favourite species on the catch record species page', async ({
      page,
      accountPage,
      addSpeciesPage,
      speciesSelectionPage
    }) => {
      await accountPage.addSpeciesLink().click();
      await addSpeciesPage.speciesInput().fill('European plaice (PLE)');
      await addSpeciesPage.clickSaveAndContinue();
      const favourites = (await accountPage.speciesCaughtValue().innerText())
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await page.goto('/species-selection');
      for (const species of favourites) {
        await expect(speciesSelectionPage.speciesCheckbox(species)).toBeVisible();
      }
      await expect(speciesSelectionPage.addSpeciesLink()).toBeVisible();
    });
  });

  test.describe('Welsh language', () => {
    test('account favourites page is translated when Cymraeg is selected', async ({ page }) => {
      test.fail(true, 'Known gap: Cymraeg link does not translate content');
      await page.getByRole('link', { name: 'Cymraeg' }).click();

      await expect(page).toHaveURL(/lang=cy/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'cy', { timeout: 5000 });
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Your account');
    });
  });
});
