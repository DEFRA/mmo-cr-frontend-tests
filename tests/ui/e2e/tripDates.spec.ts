/**
 * Enter permitted departure and return dates for a trip that did not start and finish today.
 * Traceability: UAT-26 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, daysAgo } from '../helpers/catchRecordFlow';
import { vessels, ports, errorMessages } from '../../../test-data/testData';

const testFavourites: Favourites = { ports: [ports.plymouth], gears: [], species: [] };

test.describe('Trip Dates', () => {
  test.use({ testFavourites });

  test(
    'Record valid trip dates',
    {
      tag: ['@ui', '@regression', '@tripDates', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-26' }
    },
    async ({
      createdRecords,
      catchRecordFlow,
      tripDatePage,
      tripDepartureDatePage,
      tripReturnDatePage,
      departurePortPage
    }) => {
      const departureDate = daysAgo(2);
      const returnDate = daysAgo(1);

      await test.step('My trip did not start and finish today', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.achilles));
        await tripDatePage.selectSameDate(false);
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I enter the departure and return dates', async () => {
        await tripDepartureDatePage.enterDateFrom(departureDate);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDateFrom(returnDate);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('Only permitted dates should be accepted', async () => {
        await departurePortPage.expectUrl(/\/departure-port$/);
        await expect(departurePortPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'A future departure date is not accepted',
    {
      tag: ['@ui', '@regression', '@tripDates', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-26' }
    },
    async ({ createdRecords, catchRecordFlow, tripDatePage, tripDepartureDatePage }) => {
      const tomorrow = daysAgo(-1);

      await test.step('My trip did not start and finish today', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.achilles));
        await tripDatePage.selectSameDate(false);
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I enter a departure date in the future', async () => {
        await tripDepartureDatePage.enterDateFrom(tomorrow);
        await tripDepartureDatePage.clickSaveAndContinue();
      });

      await test.step('A future date should not be accepted', async () => {
        await tripDepartureDatePage.expectUrl(/\/trip-departure-date$/);
        await expect(tripDepartureDatePage.common.errorSummary()).toContainText(
          errorMessages.tripDates.futureDeparture
        );
        await expect(tripDepartureDatePage.common.errorMessage()).toContainText(
          errorMessages.tripDates.futureDeparture
        );
      });
    }
  );

  test(
    'A return date before the departure date is not accepted',
    {
      tag: ['@ui', '@regression', '@tripDates', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-26' }
    },
    async ({ createdRecords, catchRecordFlow, tripDatePage, tripDepartureDatePage, tripReturnDatePage }) => {
      const departureDate = daysAgo(2);
      const earlierReturnDate = daysAgo(3);

      await test.step('My trip did not start and finish today', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.achilles));
        await tripDatePage.selectSameDate(false);
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I have entered a departure date', async () => {
        await tripDepartureDatePage.enterDateFrom(departureDate);
        await tripDepartureDatePage.clickSaveAndContinue();
      });

      await test.step('I enter a return date before the departure date', async () => {
        await tripReturnDatePage.enterDateFrom(earlierReturnDate);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('The return date should not be before the departure date', async () => {
        await tripReturnDatePage.expectUrl(/\/trip-return-date$/);
        await expect(tripReturnDatePage.common.errorSummary()).toContainText(
          errorMessages.tripDates.returnBeforeDeparture
        );
        await expect(tripReturnDatePage.common.errorMessage()).toContainText(
          errorMessages.tripDates.returnBeforeDeparture
        );
      });
    }
  );
});
