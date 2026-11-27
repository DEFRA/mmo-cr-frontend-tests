/**
 * Warn when a catch record is late and allow the trip end date to be corrected.
 * Traceability: UAT-17, UAT-18 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type MultiDayCatchRecordData, daysAgo, reviewDate } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first],
  gears: [gears.pots.name],
  species: [catchSpecies.cod.name]
};

test.describe('Late Catch Record', () => {
  test.use({ testFavourites });

  let lateRecord: MultiDayCatchRecordData;

  test.beforeEach(() => {
    lateRecord = {
      vesselName: vessels.testVessel,
      tripDates: { departureDate: daysAgo(3), returnDate: daysAgo(2) },
      departurePort: ports.first,
      returnPort: ports.first,
      gearCatches: [{ gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] }]
    };
  });

  // Blocked (OQ-4): no late-submission warning was shown before submission in the test environment
  test.fixme(
    'Trip ended over 24 hours ago',
    {
      tag: ['@ui', '@regression', '@lateCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-17' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage }) => {
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
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate),
          'Summary value to have text'
        ).toHaveText(reviewDate(lateRecord.tripDates.returnDate));
        await expect(
          checkAnswersPage.changeLinkNamed(checkAnswers.changeLinks.returnDate),
          'Change link named to be visible'
        ).toBeVisible();
      });

      await test.step('I should be able to continue', async () => {
        await expect(checkAnswersPage.submitButton(), 'Submit button to be enabled').toBeEnabled();
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
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, tripReturnDatePage }) => {
      const correctedReturnDate = daysAgo(0);

      await test.step('I have received a late submission warning', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(lateRecord));
      });

      await test.step('I correct the trip end date', async () => {
        await checkAnswersPage.changeLinkNamed(checkAnswers.changeLinks.returnDate).click();
        await tripReturnDatePage.enterDateFrom(correctedReturnDate);
      });

      await test.step('The corrected date means the record is no longer late', async () => {
        await tripReturnDatePage.clickSaveAndContinue();
        await checkAnswersPage.expectOnPage();
      });

      await test.step('The late warning should no longer apply', async () => {
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate),
          'Summary value to have text'
        ).toHaveText(reviewDate(correctedReturnDate));
        // UNVERIFIED (OQ-4): assert the late-submission warning is no longer shown
      });

      await test.step('I should be able to continue', async () => {
        await expect(checkAnswersPage.submitButton(), 'Submit button to be enabled').toBeEnabled();
      });
    }
  );
});
