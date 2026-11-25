/**
 * Manage account details and selections.
 * Fishers view account details, manage saved species, gear and ports, and use those selections in a catch-record journey.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import type { FavouritesFlow } from '../helpers/favouritesFlow';
import { vessels, ports, gears, catchSpecies, areas } from '../../../test-data/testData';

test.describe('Account details and selections', () => {
  let accountReadyForCleanup = false;

  const removeAccountSelections = async (favouritesFlow: FavouritesFlow): Promise<void> => {
    await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
    await favouritesFlow.removeGearFromAccount(gears.pots.name);
    await favouritesFlow.removePortFromAccount(ports.first);
  };

  test.beforeEach(async ({ navigationFlow, favouritesFlow, catchRecordFlow }) => {
    test.slow();
    accountReadyForCleanup = false;
    await navigationFlow.signInAndOpenAccount({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account UI tests'
    });
    accountReadyForCleanup = true;
    await catchRecordFlow.deleteAllDrafts();
    await navigationFlow.openAccount();
    await removeAccountSelections(favouritesFlow);
  });

  test.afterEach(async ({ navigationFlow, favouritesFlow, catchRecordFlow }) => {
    if (!accountReadyForCleanup) return;

    await navigationFlow.openAccount();
    await removeAccountSelections(favouritesFlow);
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
        await expect(accountPage.personalDetailsHeading(), 'Personal details heading is visible').toBeVisible();
        await expect(accountPage.vesselDetailsHeading(), 'Vessel details heading is visible').toBeVisible();
        await expect(
          accountPage.vesselNameHeading(vessels.testVessel),
          `Vessel heading ${vessels.testVessel} is visible`
        ).toBeVisible();
        await expect(accountPage.summaryRow('Ports used'), 'Ports used row is visible').toBeVisible();
        await expect(accountPage.summaryRow('Gear onboard'), 'Gear onboard row is visible').toBeVisible();
        await expect(accountPage.summaryRow('Species caught'), 'Species caught row is visible').toBeVisible();
      });

      await test.step('Empty groups still provide an add action', async () => {
        if (originalPorts.length === 0) {
          await expect(accountPage.portsUsedValue(), 'Ports used value is visible').toBeVisible();
          await expect(accountPage.addPortLink(), 'Add port link is visible').toBeVisible();
        }
        if (originalGear.trim().length === 0) {
          await expect(accountPage.gearOnboardValue(), 'Gear onboard value is visible').toBeVisible();
          await expect(accountPage.addGearLink(), 'Add gear link is visible').toBeVisible();
        }
        if (originalSpecies.length === 0) {
          await expect(accountPage.speciesCaughtValue(), 'Species caught value is visible').toBeVisible();
          await expect(accountPage.addSpeciesLink(), 'Add species link is visible').toBeVisible();
        }
      });

      await test.step('I add species, gear and a port to my account', async () => {
        await favouritesFlow.addSpeciesToAccount(catchSpecies.cod.name);
        await expect(
          accountPage.speciesCaughtValue(),
          `Species caught includes ${catchSpecies.cod.name}`
        ).toContainText(catchSpecies.cod.name);

        await favouritesFlow.addGearToAccount(gears.pots.name);
        await expect(accountPage.gearOnboardValue(), `Gear onboard includes ${gears.pots.name}`).toContainText(
          gears.pots.name
        );

        await favouritesFlow.addPortToAccount(ports.first);
        await expect(accountPage.portsUsedValue(), `Ports used includes ${ports.first}`).toContainText(ports.first);
      });

      await test.step('My account selections are available in a new catch-record journey', async () => {
        await navigationFlow.startCatchRecord(vessels.testVessel);
        await expect(
          departurePortPage.portRadio(ports.first),
          `Departure port ${ports.first} is offered`
        ).toBeVisible();
        await catchRecordFlow.selectPorts(ports.first, ports.first);

        await expect(gearSelectionPage.pageHeading(), 'Gear selection page is shown').toBeVisible();
        await expect(
          gearSelectionPage.gearCheckbox(gears.pots.name),
          `Gear ${gears.pots.name} is offered`
        ).toBeVisible();
        await catchRecordFlow.selectGears([{ name: gears.pots.name }]);
        await catchRecordFlow.selectAreaForCurrentGear(areas.validCode);

        await expect(
          speciesSelectionPage.pageHeadingForGear(gears.pots.name.toLowerCase()),
          'Species selection page is shown'
        ).toBeVisible();
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          `Species ${catchSpecies.cod.name} is offered`
        ).toBeVisible();
      });

      await test.step('I can remove selections added during this test', async () => {
        await accountPage.goto('/account');

        await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
        await expect(
          accountPage.speciesCaughtValue(),
          `Species caught no longer includes ${catchSpecies.cod.name}`
        ).not.toContainText(catchSpecies.cod.name);

        await favouritesFlow.removeGearFromAccount(gears.pots.name);
        await expect(
          accountPage.gearOnboardValue(),
          `Gear onboard no longer includes ${gears.pots.name}`
        ).not.toContainText(gears.pots.name);

        await favouritesFlow.removePortFromAccount(ports.first);
        await expect(accountPage.portsUsedValue(), `Ports used no longer includes ${ports.first}`).not.toContainText(
          ports.first
        );

        await expect(accountPage.getSpeciesCaught(), 'Species caught restored to original').resolves.toEqual(
          originalSpecies
        );
        await expect(accountPage.getGearOnboardText(), 'Gear onboard restored to original').resolves.toBe(originalGear);
        await expect(accountPage.getPortsUsed(), 'Ports used restored to original').resolves.toEqual(originalPorts);
      });
    }
  );
});
