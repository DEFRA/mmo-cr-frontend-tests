/**
 * Warn when a catch record is late and allow the trip end date to be corrected.
 * Traceability: UAT-17, UAT-18 (CRAR ticket TBC).
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
  noFavourites,
  reviewDate
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const returnDateKey = 'Return date';
const changeReturnDateLink = 'Change return date';
const testFavourites: Favourites = { ports: [plymouth], gears: [pots.name], species: [cod.name] };

test.describe('Late Catch Record', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];
  let lateRecord: CatchRecordData;

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    createdRecords = [];
    lateRecord = {
      vesselName,
      tripDates: { departureDate: daysAgo(3), returnDate: daysAgo(2) },
      departurePort: plymouth,
      returnPort: plymouth,
      gearCatches: [{ gear: pots, areaCode, species: [cod] }]
    };
    await test.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
  });

  // Blocked (OQ-4): no late-submission warning was shown before submission in the test environment
  test.fixme(
    'Trip ended over 24 hours ago',
    {
      tag: ['@ui', '@regression', '@lateCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-17' }
    },
    async ({ catchRecordFlow, checkAnswersPage }) => {
      await test.step('My trip ended more than 24 hours ago', async () => {
        // The trip dates in lateRecord end two days ago
      });

      await test.step('I complete the required catch information', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(lateRecord));
      });

      await test.step('I should see a late submission warning', async () => {
        // UNVERIFIED (OQ-4): warning location and text to be confirmed
      });

      await test.step('I should be able to check the trip end date', async () => {
        await expect(checkAnswersPage.summaryValue(returnDateKey)).toHaveText(
          reviewDate(lateRecord.tripDates!.returnDate)
        );
        await expect(checkAnswersPage.changeLinkNamed(changeReturnDateLink)).toBeVisible();
      });

      await test.step('I should be able to continue', async () => {
        await expect(checkAnswersPage.submitButton()).toBeEnabled();
      });
    }
  );

  // Blocked (OQ-4): depends on the late-submission warning from UAT-17
  test.fixme(
    'Correct trip end date after warning',
    {
      tag: ['@ui', '@regression', '@lateCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-18' }
    },
    async ({ catchRecordFlow, checkAnswersPage, tripReturnDatePage }) => {
      const correctedReturnDate = daysAgo(0);

      await test.step('I have received a late submission warning', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(lateRecord));
      });

      await test.step('I correct the trip end date', async () => {
        await checkAnswersPage.changeLinkNamed(changeReturnDateLink).click();
        await tripReturnDatePage.enterDateFrom(correctedReturnDate);
      });

      await test.step('The corrected date means the record is no longer late', async () => {
        await tripReturnDatePage.clickSaveAndContinue();
        await checkAnswersPage.expectUrl(/\/check-answers$/);
      });

      await test.step('The late warning should no longer apply', async () => {
        await expect(checkAnswersPage.summaryValue(returnDateKey)).toHaveText(reviewDate(correctedReturnDate));
        // UNVERIFIED (OQ-4): assert the late-submission warning is no longer shown
      });

      await test.step('I should be able to continue', async () => {
        await expect(checkAnswersPage.submitButton()).toBeEnabled();
      });
    }
  );
});
