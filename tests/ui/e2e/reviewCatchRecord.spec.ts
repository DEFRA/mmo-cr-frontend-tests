/**
 * Review a completed catch record before submission.
 * Traceability: UAT-13 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import {
  type CatchRecordData,
  type Favourites,
  type GearData,
  type SpeciesCatch,
  daysAgo,
  reviewDate
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const lowestoft = 'Lowestoft';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots' };
const trollingLines: GearData = { name: 'Trolling lines' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const mackerel: SpeciesCatch = { name: 'Atlantic mackerel (MAC)', code: 'MAC', weight: '50' };
const areaKey = 'Area majority catch caught';
const weightRetainedKey = 'Weight above minimum size retained (kg)';
const changeLinks = ['Change departure date', 'Change return date', 'Change departure port', 'Change return port'];
const testFavourites: Favourites = {
  ports: [plymouth, lowestoft],
  gears: [pots.name, trollingLines.name],
  species: [cod.name, mackerel.name]
};

test.describe('Review Catch Record', () => {
  test.use({ testFavourites });

  let reviewRecord: CatchRecordData;

  test.beforeEach(() => {
    reviewRecord = {
      vesselName,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: plymouth,
      returnPort: lowestoft,
      gearCatches: [
        { gear: pots, areaCode, species: [cod] },
        { gear: trollingLines, areaCode, species: [mackerel] }
      ]
    };
  });

  test(
    'Review completed information',
    {
      tag: ['@ui', '@regression', '@reviewCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-13' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage }) => {
      await test.step('I have completed all required catch information', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(reviewRecord));
      });

      await test.step('I open the catch record review', async () => {
        await checkAnswersPage.goto('/check-answers');
      });

      await test.step('I should see the trip information', async () => {
        const tripInformation: [string, string][] = [
          ['Vessel', reviewRecord.vesselName],
          ['Departure date', reviewDate(reviewRecord.tripDates!.departureDate)],
          ['Return date', reviewDate(reviewRecord.tripDates!.returnDate)],
          ['Departure port', reviewRecord.departurePort],
          ['Return port', reviewRecord.returnPort]
        ];
        for (const [key, value] of tripInformation) {
          await expect(checkAnswersPage.summaryValue(key)).toHaveText(value);
        }
      });

      await test.step('I should see gear and catch areas', async () => {
        for (const { gear } of reviewRecord.gearCatches) {
          await expect(checkAnswersPage.gearSection(gear.name)).toBeVisible();
          await expect(checkAnswersPage.gearSummaryValue(gear.name, areaKey)).toHaveText(areaCode);
        }
      });

      await test.step('I should see species and weights', async () => {
        for (const { gear, species } of reviewRecord.gearCatches) {
          for (const caught of species) {
            await expect(checkAnswersPage.speciesSummaryValue(caught.name, gear.name, weightRetainedKey)).toHaveText(
              caught.weight
            );
          }
        }
      });

      // UNVERIFIED (OQ-6): "identify anything requiring correction" is assumed to mean every answer has a Change link
      await test.step('I should be able to identify anything requiring correction', async () => {
        for (const changeLink of changeLinks) {
          await expect(checkAnswersPage.changeLinkNamed(changeLink)).toBeVisible();
        }
      });
    }
  );
});
