/**
 * Change an answer from the catch record review and keep the other answers.
 * Traceability: UAT-14 (CRAR ticket TBC).
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
const seineNets: GearData = { name: 'Seine nets (not specified)' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const returnDateKey = 'Return date';
const changeReturnDateLink = 'Change return date';
const areaKey = 'Area majority catch caught';
const weightRetainedKey = 'Weight above minimum size retained (kg)';
const testFavourites: Favourites = { ports: [plymouth, lowestoft], gears: [seineNets.name], species: [cod.name] };

test.describe('Amend Catch Record', () => {
  test.use({ testFavourites });

  let reviewRecord: CatchRecordData;

  test.beforeEach(() => {
    reviewRecord = {
      vesselName,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: plymouth,
      returnPort: lowestoft,
      // No areaCode, so the area is selected on the map rather than under "Other"
      gearCatches: [{ gear: seineNets, species: [cod] }]
    };
  });

  test(
    'Correct information during review',
    {
      tag: ['@ui', '@regression', '@amendCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-14' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, tripReturnDatePage }) => {
      const amendedReturnDate = daysAgo(0);
      const mapAreaByGear = new Map<string, string>();

      await test.step('I am reviewing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(reviewRecord));
        for (const { gear } of reviewRecord.gearCatches) {
          mapAreaByGear.set(gear.name, (await checkAnswersPage.gearSummaryValue(gear.name, areaKey).innerText()).trim());
        }
      });

      await test.step('I select Change for an answer', async () => {
        await checkAnswersPage.changeLinkNamed(changeReturnDateLink).click();
      });

      await test.step('I update the information', async () => {
        await tripReturnDatePage.enterDateFrom(amendedReturnDate);
      });

      await test.step('I return to the review', async () => {
        await tripReturnDatePage.clickSaveAndContinue();
        await checkAnswersPage.expectUrl(/\/check-answers$/);
      });

      await test.step('The updated information should be displayed', async () => {
        await expect(checkAnswersPage.summaryValue(returnDateKey)).toHaveText(reviewDate(amendedReturnDate));
      });

      await test.step('All unchanged information should remain the same', async () => {
        const unchangedTripInformation: [string, string][] = [
          ['Vessel', reviewRecord.vesselName],
          ['Departure date', reviewDate(reviewRecord.tripDates!.departureDate)],
          ['Departure port', reviewRecord.departurePort],
          ['Return port', reviewRecord.returnPort]
        ];
        for (const [key, value] of unchangedTripInformation) {
          await expect(checkAnswersPage.summaryValue(key)).toHaveText(value);
        }
        for (const { gear, species } of reviewRecord.gearCatches) {
          await expect(checkAnswersPage.gearSummaryValue(gear.name, areaKey)).toHaveText(mapAreaByGear.get(gear.name)!);
          for (const caught of species) {
            await expect(checkAnswersPage.speciesSummaryValue(caught.name, gear.name, weightRetainedKey)).toHaveText(
              caught.weight
            );
          }
        }
      });
    }
  );
});
