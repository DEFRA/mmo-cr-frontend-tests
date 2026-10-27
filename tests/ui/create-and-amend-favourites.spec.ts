import { expect, test } from '../../fixtures/commonfixture';
import { FavouritesFlow } from './helpers/favouritesFlow';
import { NavigationFlow } from './helpers/navigationFlow';

const favouriteSpecies = 'Atlantic cod (COD)';
const favouriteGear = 'Pots';
const favouritePort = 'Plymouth';

test.describe('Create and amend favourites', () => {
  test.beforeEach(async ({ signInPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccount(signInPage, accountPage, {
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for favourites UI tests'
    });
  });

  test('Display favourites grouped by species, ports, and gear', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Species caught')).toBeVisible();
    await expect(accountPage.summaryRow('Ports used')).toBeVisible();
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
  });

  test('Add an approved species favourite', async ({ accountPage, addSpeciesPage, removeSpeciesPage }) => {
    await FavouritesFlow.removeSpeciesFromAccount(accountPage, removeSpeciesPage, favouriteSpecies);
    await FavouritesFlow.addSpeciesToAccount(accountPage, addSpeciesPage, favouriteSpecies);

    await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
  });

  test('Reject a duplicate species favourite', async ({ accountPage, addSpeciesPage }) => {
    await FavouritesFlow.ensureSpeciesAdded(accountPage, addSpeciesPage, favouriteSpecies);
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.speciesInput().fill(favouriteSpecies);
    const duplicateOption = addSpeciesPage.suggestionOption(favouriteSpecies);
    if (await duplicateOption.isVisible()) {
      await duplicateOption.click();
    }
    await addSpeciesPage.clickSaveAndContinue();

    await expect(addSpeciesPage.errorSummary()).toContainText(/already/i);
    await addSpeciesPage.expectUrl(/\/add-species/);
  });

  test('Add an approved gear favourite', async ({ accountPage, addGearPage, removeGearPage }) => {
    await FavouritesFlow.removeGearFromAccount(accountPage, removeGearPage, favouriteGear);
    await FavouritesFlow.addGearToAccount(accountPage, addGearPage, favouriteGear);

    await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
  });

  test('Add an approved port favourite', async ({ accountPage, addPortPage }) => {
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
  });

  test('Reject a duplicate gear favourite with an informative message', async ({ accountPage, addGearPage }) => {
    await FavouritesFlow.ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill(favouriteGear);
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText(`${favouriteGear} has already been added to your gear`);
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('Reject a duplicate port favourite with an informative message', async ({ accountPage, addPortPage }) => {
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await accountPage.addPortLink().click();
    await addPortPage.searchAndSelectPort(favouritePort);
    await addPortPage.clickSaveAndContinue();

    await expect(addPortPage.errorSummary()).toBeVisible();
    await expect(addPortPage.errorSummary()).toContainText(/already/i);
    await addPortPage.expectUrl(/\/add-port/);
  });

  test('Remove a species favourite', async ({ accountPage, addSpeciesPage, removeSpeciesPage }) => {
    await FavouritesFlow.ensureSpeciesAdded(accountPage, addSpeciesPage, favouriteSpecies);
    await FavouritesFlow.removeSpeciesFromAccount(accountPage, removeSpeciesPage, favouriteSpecies);

    await expect(accountPage.speciesCaughtValue()).not.toContainText(favouriteSpecies);
  });

  test('Remove a gear favourite', async ({ accountPage, addGearPage, removeGearPage }) => {
    await FavouritesFlow.ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await FavouritesFlow.removeGearFromAccount(accountPage, removeGearPage, favouriteGear);

    await expect(accountPage.gearOnboardValue()).not.toContainText(favouriteGear);
  });

  test('Remove a port favourite', async ({ accountPage, addPortPage, removePortPage }) => {
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await FavouritesFlow.removePortFromAccount(accountPage, removePortPage, favouritePort);

    await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
  });

  test('Amend a port favourite by replacing it with another saved port', async ({
    accountPage,
    addPortPage,
    removePortPage
  }) => {
    const replacementPort = 'Lowestoft';
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await FavouritesFlow.removePortFromAccount(accountPage, removePortPage, favouritePort);
    await FavouritesFlow.addPortToAccount(accountPage, addPortPage, replacementPort);

    await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
    await expect(accountPage.portsUsedValue()).toContainText(replacementPort);
  });

  test('Favourite gear is available during catch recording', async ({
    page,
    accountPage,
    addGearPage,
    gearSelectionPage
  }) => {
    await FavouritesFlow.ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await page.goto('/gear-selection');
    await expect(gearSelectionPage.gearCheckbox(favouriteGear)).toBeVisible();
  });

  test('Favourite species is available during catch recording', async ({
    page,
    accountPage,
    addSpeciesPage,
    speciesSelectionPage
  }) => {
    await FavouritesFlow.ensureSpeciesAdded(accountPage, addSpeciesPage, favouriteSpecies);
    await page.goto('/species-selection');

    await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeVisible();
  });

  test('Favourite port is suggested during departure-port entry', async ({
    accountPage,
    addPortPage,
    recordsPage,
    selectVesselPage,
    tripDatePage
  }) => {
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await expect(selectVesselPage.pageHeading()).toBeVisible();
    await selectVesselPage.firstVesselRadio().check();
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.expectUrl(/\/trip-date$/);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await addPortPage.expectUrl(/\/add-port\?for=departure/);

    await addPortPage.portInput().fill(favouritePort);
    await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
  });

  test('Port type-ahead search suggests a matching reference-data entry', async ({ accountPage, addPortPage }) => {
    await accountPage.addPortLink().click();
    await addPortPage.portInput().fill(favouritePort.slice(0, 2));

    await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
  });

  test('Reject free-text gear outside the approved catalogue', async ({ accountPage, addGearPage }) => {
    await accountPage.clickAddGear();
    await addGearPage.gearInput().fill('Not a catalogue gear');
    await addGearPage.clickSaveAndContinue();

    await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
    await addGearPage.expectUrl(/\/add-gear/);
  });

  test('Reject free-text species outside the approved catalogue', async ({ accountPage, addSpeciesPage }) => {
    await accountPage.addSpeciesLink().click();
    await addSpeciesPage.speciesInput().fill(`Not an approved species ${Date.now()}`);
    await addSpeciesPage.speciesInput().press('Enter');

    await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
    await addSpeciesPage.expectUrl(/\/add-species/);
  });

  test('Reject free-text port outside the approved catalogue', async ({ accountPage, addPortPage }) => {
    await accountPage.addPortLink().click();
    await addPortPage.portInput().fill(`Not a port ${Date.now()}`);
    await addPortPage.clickSaveAndContinue();

    await expect(addPortPage.errorSummary()).toContainText('Select a port from the list');
    await addPortPage.expectUrl(/\/add-port/);
  });

  test('Favourites persist against the user account after reload', async ({
    page,
    accountPage,
    addSpeciesPage,
    addGearPage,
    removeGearPage,
    addPortPage
  }) => {
    await FavouritesFlow.ensureSpeciesAdded(accountPage, addSpeciesPage, favouriteSpecies);
    await FavouritesFlow.ensureGearAdded(accountPage, addGearPage, favouriteGear);
    await FavouritesFlow.ensurePortAdded(accountPage, addPortPage, favouritePort);
    await page.reload();

    await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
    await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
    await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
    await FavouritesFlow.removeGearFromAccount(accountPage, removeGearPage, favouriteGear);
  });

  test('Favourites synchronize between web and mobile channels', async () => {
    test.skip(true, 'Cross-channel sync requires the mobile app and sync-service test fixtures.');
  });
});
