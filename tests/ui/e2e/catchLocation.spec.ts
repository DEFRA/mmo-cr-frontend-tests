/**
 * Record the statistical area where most of the catch was caught for a gear.
 * Traceability: UAT-08 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearData } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const seineNets: GearData = { name: 'Seine nets (not specified)' };
const areaKey = 'Area majority catch caught';
const statisticalSubAreaKey = 'Statistical sub area';
const testFavourites: Favourites = { ports: [plymouth], gears: [seineNets.name], species: [] };

test.describe('Catch Location', () => {
  test.use({ testFavourites, draftCleanup: 'all' });

  test(
    'Record where catch was caught',
    {
      tag: ['@ui', '@regression', '@catchLocation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-08' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, speciesSelectionPage }) => {
      let areaCode = '';

      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
      });

      await test.step('I have selected the fishing gear', async () => {
        await catchRecordFlow.selectGears([seineNets]);
      });

      await test.step('I select the area where most of my catch was caught', async () => {
        areaCode = await catchRecordFlow.selectAreaFromMapForCurrentGear();
      });

      await test.step('The selected area should be recorded', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.gearSummaryValue(seineNets.name, areaKey)).toHaveText(areaCode);
        await expect(checkAnswersPage.summaryValue(statisticalSubAreaKey)).toContainText(areaCode);
      });

      await test.step('I should continue to species selection', async () => {
        await checkAnswersPage.goBack();
        await speciesSelectionPage.expectUrl(/\/species-selection\?gearId=/);
        await expect(speciesSelectionPage.pageHeadingForGear(seineNets.name)).toBeVisible();
      });
    }
  );
});
