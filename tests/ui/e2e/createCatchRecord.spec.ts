/**
 * Create and submit same-day and multi-day catch records end to end.
 * Traceability: UAT-04, UAT-05 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import {
  type Favourites,
  type GearCatch,
  type TripDates,
  daysAgo,
  noFavourites,
  recordReferencePattern,
  recordsListDate
} from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, recordStatuses } from '../../../test-data/testData';

const gearCatches: GearCatch[] = [{ gear: gears.setLonglines, species: [catchSpecies.cod] }];
const testFavourites: Favourites = {
  ports: [ports.third, ports.fourth],
  gears: [gears.setLonglines.name],
  species: [catchSpecies.cod.name]
};

type TripScenario = { tripType: string; uat: string; tripDates?: TripDates; tripStepTitle: string };

const tripScenarios: TripScenario[] = [
  { tripType: 'same-day', uat: 'UAT-04', tripStepTitle: 'My trip started and finished today' },
  {
    tripType: 'multi-day',
    uat: 'UAT-05',
    // Departure two days ago, return yesterday
    tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
    tripStepTitle: 'My trip did not start and finish today'
  }
];

test.describe('Create Catch Record', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];

  test.beforeEach(async () => {
    test.slow();
    createdRecords = [];
    addedFavourites = noFavourites;
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.restoreFavourites(addedFavourites);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  for (const { tripType, uat, tripDates, tripStepTitle } of tripScenarios) {
    test(
      `Submit a ${tripType} trip`,
      {
        tag: ['@ui', '@smoke', '@createCatchRecord', '@e2e'],
        annotation: { type: 'UAT', description: uat }
      },
      async ({ navigationFlow, catchRecordFlow, checkAnswersPage, recordsPage, submittedRecordPage }) => {
        let reference = '';

        await test.step('I am signed in', async () => {
          await navigationFlow.signIn();
          addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
        });

        await test.step(tripStepTitle, async () => {
          // Trip dates are computed at runtime from today's date
        });

        await test.step('I create a new catch record', async () => {
          reference = await catchRecordFlow.startRecord(vessels.testVessel);
          createdRecords.push(reference);
        });

        await test.step('I enter the trip dates', async () => {
          if (tripDates) {
            await catchRecordFlow.enterMultiDayTrip(tripDates);
          } else {
            await catchRecordFlow.enterSameDayTrip();
          }
        });

        await test.step('I enter ports and catch details', async () => {
          await catchRecordFlow.selectPorts(ports.third, ports.fourth);
          await catchRecordFlow.selectGears(gearCatches.map(({ gear }) => gear));
          await catchRecordFlow.enterCatchDetailsForEachGear(gearCatches);
          await catchRecordFlow.confirmAllCatchLanded();
        });

        await test.step('I review and submit the record', async () => {
          await checkAnswersPage.clickAcceptAndSubmit();
        });

        await test.step(`The ${tripType} trip should be recorded successfully`, async () => {
          const tripEndDate = tripDates?.returnDate ?? new Date();
          await recordsPage.goto('/records');
          await expect(recordsPage.recordStatus(reference)).toHaveText(recordStatuses.submitted);
          await expect(recordsPage.recordRow(reference)).toContainText(recordsListDate(tripEndDate));
        });

        await test.step('I should receive a catch record reference', async () => {
          expect(reference).toMatch(recordReferencePattern);
          await recordsPage.openRecord(reference);
          await expect(submittedRecordPage.recordReference()).toHaveText(reference);
        });
      }
    );
  }
});
