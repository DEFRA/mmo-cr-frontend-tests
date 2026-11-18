/**
 * Record the statistical area where most of the catch was caught for a gear.
 * Traceability: UAT-08 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearData, noFavourites } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots' };
const areaKey = 'Area majority catch caught';
const statisticalSubAreaKey = `Statistical sub area (${pots.name})`;
const testFavourites: Favourites = { ports: [plymouth], gears: [pots.name], species: [] };

test.describe('Catch Location', () => {
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
    'Record where catch was caught',
    {
      tag: ['@ui', '@regression', '@catchLocation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-08' }
    },
    async ({ catchRecordFlow, checkAnswersPage, speciesSelectionPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
      });

      await test.step('I have selected the fishing gear', async () => {
        await catchRecordFlow.selectGears([pots]);
      });

      await test.step('I select the area where most of my catch was caught', async () => {
        await catchRecordFlow.selectAreaForCurrentGear(areaCode);
      });

      await test.step('The selected area should be recorded', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.gearSummaryValue(pots.name, areaKey)).toHaveText(areaCode);
        await expect(checkAnswersPage.summaryValue(statisticalSubAreaKey)).toContainText(areaCode);
      });

      await test.step('I should continue to species selection', async () => {
        await checkAnswersPage.goBack();
        await speciesSelectionPage.expectUrl(/\/species-selection\?gearId=/);
        await expect(speciesSelectionPage.pageHeadingForGear(pots.name)).toBeVisible();
      });
    }
  );
});
