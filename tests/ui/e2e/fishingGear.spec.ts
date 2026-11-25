/**
 * Record catch for more than one fishing gear and keep each catch linked to its gear.
 * Traceability: UAT-07 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearCatch } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const multiGearCatches: GearCatch[] = [
  { gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] },
  { gear: gears.trollingLines, areaCode: areas.validCode, species: [catchSpecies.mackerel] }
];
const testFavourites: Favourites = {
  ports: [ports.first],
  gears: [gears.pots.name, gears.trollingLines.name],
  species: [catchSpecies.cod.name, catchSpecies.mackerel.name]
};

test.describe('Fishing Gear', () => {
  test.use({ testFavourites });

  test(
    'Catch using multiple gears',
    {
      tag: ['@ui', '@regression', '@fishingGear', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-07' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
      });

      await test.step('I select more than one fishing gear', async () => {
        await catchRecordFlow.selectGears(multiGearCatches.map(({ gear }) => gear));
      });

      await test.step('I enter the catch details for each gear', async () => {
        await catchRecordFlow.enterCatchDetailsForEachGear(multiGearCatches);
      });

      await test.step('Each gear should be recorded separately', async () => {
        await checkAnswersPage.goto('/check-answers');
        for (const { gear } of multiGearCatches) {
          await expect(checkAnswersPage.gearSection(gear.name)).toBeVisible();
          await expect(checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.gearType)).toHaveText(
            gear.name
          );
        }
      });

      await test.step('Each catch should remain linked to the correct gear', async () => {
        for (const { gear, species } of multiGearCatches) {
          for (const caught of species) {
            await expect(
              checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.speciesCaught)
            ).toContainText(caught.name);
            await expect(
              checkAnswersPage.speciesSummaryValue(caught.name, gear.name, checkAnswers.summaryKeys.weightRetained)
            ).toHaveText(`${caught.weight} kg`);
          }
        }
      });
    }
  );
});
