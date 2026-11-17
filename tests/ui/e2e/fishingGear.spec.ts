/**
 * Record catch for more than one fishing gear and keep each catch linked to its gear.
 * Traceability: UAT-07 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import {
  type Favourites,
  type GearCatch,
  type GearData,
  type SpeciesCatch,
  noFavourites
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots', potsDetails: { hauled: '1', inWater: '1' } };
const trollingLines: GearData = { name: 'Trolling lines' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const mackerel: SpeciesCatch = { name: 'Atlantic mackerel (MAC)', code: 'MAC', weight: '50' };
const multiGearCatches: GearCatch[] = [
  { gear: pots, areaCode, species: [cod] },
  { gear: trollingLines, areaCode, species: [mackerel] }
];
const gearTypeKey = 'Gear type';
const speciesCaughtKey = 'Species caught';
const weightRetainedKey = 'Weight above minimum size retained (kg)';
const testFavourites: Favourites = {
  ports: [plymouth],
  gears: [pots.name, trollingLines.name],
  species: [cod.name, mackerel.name]
};

test.describe('Fishing Gear', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    createdRecords = [];
    await test.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
  });

  test(
    'Catch using multiple gears',
    {
      tag: ['@ui', '@regression', '@fishingGear', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-07' }
    },
    async ({ catchRecordFlow, checkAnswersPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
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
          await expect(checkAnswersPage.gearSummaryValue(gear.name, gearTypeKey)).toHaveText(gear.name);
        }
      });

      await test.step('Each catch should remain linked to the correct gear', async () => {
        for (const { gear, species } of multiGearCatches) {
          for (const caught of species) {
            await expect(checkAnswersPage.gearSummaryValue(gear.name, speciesCaughtKey)).toContainText(caught.name);
            await expect(checkAnswersPage.speciesSummaryValue(caught.name, gear.name, weightRetainedKey)).toHaveText(
              caught.weight
            );
          }
        }
      });
    }
  );
});
