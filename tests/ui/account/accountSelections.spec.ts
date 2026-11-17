/**
 * Manage account details and selections.
 * Fishers view account details, manage saved species, gear and ports, and use those selections in a catch-record journey.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';

const favouriteSpecies = 'Atlantic cod (COD)';
const favouriteGear = 'Pots';
const favouritePort = 'Plymouth';

test.describe('Account details and selections', () => {
  let savedSelections = {
    species: false,
    gear: false,
    port: false
  };
  let accountReadyForCleanup = false;

  test.beforeEach(async ({ navigationFlow, accountPage }) => {
    accountReadyForCleanup = false;
    await navigationFlow.signInAndOpenAccount({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account UI tests'
    });

    savedSelections = {
      species: (await accountPage.getSpeciesCaught()).includes(favouriteSpecies),
      gear: (await accountPage.getGearOnboardText()).includes(favouriteGear),
      port: (await accountPage.getPortsUsed()).includes(favouritePort)
    };
    accountReadyForCleanup = true;
  });

  test.afterEach(async ({ navigationFlow, favouritesFlow }) => {
    if (!accountReadyForCleanup) return;

    await navigationFlow.openAccount();
    if (!savedSelections.species) await favouritesFlow.removeSpeciesFromAccount(favouriteSpecies);
    if (!savedSelections.gear) await favouritesFlow.removeGearFromAccount(favouriteGear);
    if (!savedSelections.port) await favouritesFlow.removePortFromAccount(favouritePort);
  });

  test(
    'Displays account details, manages selections and offers them in a catch-record journey',
    { tag: ['@ui', '@regression', '@account'] },
    async ({
      accountPage,
      favouritesFlow,
      recordsPage,
      selectVesselPage,
      tripDatePage,
      addPortPage,
      confirmSamePortPage,
      gearSelectionPage,
      speciesSelectionPage
    }) => {
      const originalSpecies = await accountPage.getSpeciesCaught();
      const originalGear = await accountPage.getGearOnboardText();
      const originalPorts = await accountPage.getPortsUsed();

      await test.step('My account displays my personal and vessel details', async () => {
        await expect(accountPage.personalDetailsHeading()).toBeVisible();
        await expect(accountPage.vesselDetailsHeading()).toBeVisible();
        await expect(accountPage.vesselNameHeading()).toBeVisible();
        await expect(accountPage.summaryRow('Ports used')).toBeVisible();
        await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
        await expect(accountPage.summaryRow('Species caught')).toBeVisible();
      });

      await test.step('Empty groups still provide an add action', async () => {
        if (originalPorts.length === 0) {
          await expect(accountPage.portsUsedValue()).toBeVisible();
          await expect(accountPage.addPortLink()).toBeVisible();
        }
        if (originalGear.trim().length === 0) {
          await expect(accountPage.gearOnboardValue()).toBeVisible();
          await expect(accountPage.addGearLink()).toBeVisible();
        }
        if (originalSpecies.length === 0) {
          await expect(accountPage.speciesCaughtValue()).toBeVisible();
          await expect(accountPage.addSpeciesLink()).toBeVisible();
        }
      });

      await test.step('I add species, gear and a port to my account', async () => {
        if (!savedSelections.species) await favouritesFlow.addSpeciesToAccount(favouriteSpecies);
        await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);

        if (!savedSelections.gear) await favouritesFlow.addGearToAccount(favouriteGear);
        await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);

        if (!savedSelections.port) await favouritesFlow.addPortToAccount(favouritePort);
        await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
      });

      await test.step('My account selections are available in a new catch-record journey', async () => {
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
        await expect(selectVesselPage.pageHeading()).toBeVisible();
        await selectVesselPage.selectVessel('ACHILLES');
        await selectVesselPage.clickSaveAndContinue();

        await tripDatePage.yesRadio().check();
        await tripDatePage.clickSaveAndContinue();
        await expect(addPortPage.page).toHaveURL(/\/add-port\?for=departure/);
        await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
        await addPortPage.searchAndSelectPort(favouritePort);
        await addPortPage.clickSaveAndContinue();
        await expect(confirmSamePortPage.pageHeading()).toBeVisible();
        await confirmSamePortPage.selectSamePort(true);
        await confirmSamePortPage.clickSaveAndContinue();

        await expect(gearSelectionPage.pageHeading()).toBeVisible();
        await expect(gearSelectionPage.gearCheckbox(favouriteGear)).toBeVisible();
        await gearSelectionPage.gearCheckbox(favouriteGear).check();
        await gearSelectionPage.enterPotsDetails('1', '1');
        await gearSelectionPage.clickSaveAndContinue();

        await expect(speciesSelectionPage.pageHeading()).toBeVisible();
        await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeVisible();
      });

      await test.step('I can remove selections added during this test', async () => {
        await accountPage.goto('/account');

        if (!savedSelections.species) {
          await favouritesFlow.removeSpeciesFromAccount(favouriteSpecies);
          await expect(accountPage.speciesCaughtValue()).not.toContainText(favouriteSpecies);
        }

        if (!savedSelections.gear) {
          await favouritesFlow.removeGearFromAccount(favouriteGear);
          await expect(accountPage.gearOnboardValue()).not.toContainText(favouriteGear);
        }

        if (!savedSelections.port) {
          await favouritesFlow.removePortFromAccount(favouritePort);
          await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
        }

        await expect(accountPage.getSpeciesCaught()).resolves.toEqual(originalSpecies);
        await expect(accountPage.getGearOnboardText()).resolves.toBe(originalGear);
        await expect(accountPage.getPortsUsed()).resolves.toEqual(originalPorts);
      });
    }
  );
});
