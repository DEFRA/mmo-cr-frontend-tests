/**
 * Manage account details and selections.
 * Fishers view account details, manage saved species, gear and ports, and use those selections in a catch-record journey.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { vessels, ports, gears, catchSpecies, areas } from '../../../test-data/testData';

test.describe('Account details and selections', () => {
  let savedSelections = {
    species: false,
    gear: false,
    port: false
  };
  let accountReadyForCleanup = false;

  test.beforeEach(async ({ navigationFlow, accountPage }) => {
    test.slow();
    accountReadyForCleanup = false;
    await navigationFlow.signInAndOpenAccount({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account UI tests'
    });

    savedSelections = {
      species: (await accountPage.getSpeciesCaught()).includes(catchSpecies.cod.name),
      gear: (await accountPage.getGearOnboardText()).includes(gears.pots.name),
      port: (await accountPage.getPortsUsed()).includes(ports.first)
    };
    accountReadyForCleanup = true;
  });

  test.afterEach(async ({ navigationFlow, favouritesFlow, catchRecordFlow }) => {
    if (!accountReadyForCleanup) return;

    await navigationFlow.openAccount();
    if (!savedSelections.species) await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
    if (!savedSelections.gear) await favouritesFlow.removeGearFromAccount(gears.pots.name);
    if (!savedSelections.port) await favouritesFlow.removePortFromAccount(ports.first);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Displays account details, manages selections and offers them in a catch-record journey',
    { tag: ['@ui', '@regression', '@account'] },
    async ({
      accountPage,
      favouritesFlow,
      navigationFlow,
      catchRecordFlow,
      departurePortPage,
      gearSelectionPage,
      speciesSelectionPage
    }) => {
      const originalSpecies = await accountPage.getSpeciesCaught();
      const originalGear = await accountPage.getGearOnboardText();
      const originalPorts = await accountPage.getPortsUsed();

      await test.step('My account displays my personal and vessel details', async () => {
        await expect(accountPage.personalDetailsHeading()).toBeVisible();
        await expect(accountPage.vesselDetailsHeading()).toBeVisible();
        await expect(accountPage.vesselNameHeading(vessels.testVessel)).toBeVisible();
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
        if (!savedSelections.species) await favouritesFlow.addSpeciesToAccount(catchSpecies.cod.name);
        await expect(accountPage.speciesCaughtValue()).toContainText(catchSpecies.cod.name);

        if (!savedSelections.gear) await favouritesFlow.addGearToAccount(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);

        if (!savedSelections.port) await favouritesFlow.addPortToAccount(ports.first);
        await expect(accountPage.portsUsedValue()).toContainText(ports.first);
      });

      await test.step('My account selections are available in a new catch-record journey', async () => {
        await navigationFlow.startCatchRecord(vessels.testVessel);
        await expect(departurePortPage.portRadio(ports.first)).toBeVisible();
        await catchRecordFlow.selectPorts(ports.first, ports.first);

        await expect(gearSelectionPage.pageHeading()).toBeVisible();
        await expect(gearSelectionPage.gearCheckbox(gears.pots.name)).toBeVisible();
        await catchRecordFlow.selectGears([{ name: gears.pots.name }]);
        await catchRecordFlow.selectAreaForCurrentGear(areas.validCode);

        await expect(speciesSelectionPage.pageHeadingForGear(gears.pots.name.toLowerCase())).toBeVisible();
        await expect(speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name)).toBeVisible();
      });

      await test.step('I can remove selections added during this test', async () => {
        await accountPage.goto('/account');

        if (!savedSelections.species) {
          await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
          await expect(accountPage.speciesCaughtValue()).not.toContainText(catchSpecies.cod.name);
        }

        if (!savedSelections.gear) {
          await favouritesFlow.removeGearFromAccount(gears.pots.name);
          await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
        }

        if (!savedSelections.port) {
          await favouritesFlow.removePortFromAccount(ports.first);
          await expect(accountPage.portsUsedValue()).not.toContainText(ports.first);
        }

        await expect(accountPage.getSpeciesCaught()).resolves.toEqual(originalSpecies);
        await expect(accountPage.getGearOnboardText()).resolves.toBe(originalGear);
        await expect(accountPage.getPortsUsed()).resolves.toEqual(originalPorts);
      });
    }
  );
});
