/**
 * Validate trip start and end dates against reporting-period and trip-length rules.
 * @author Hemasrivani07
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { vessels } from '../../../test-data/testData';

type DateParts = {
  day: string;
  month: string;
  year: string;
};

type TripDateOffsets = {
  start: number;
  end: number;
};

type TripDates = {
  start: DateParts;
  end: DateParts;
};

const dateOffsets = {
  validTrip: { start: -10, end: -5 },
  olderThan365Days: { start: -366, end: -366 },
  longerThan30Days: { start: -40, end: -9 },
  endBeforeStart: { start: -5, end: -6 },
  futureStart: { start: 1, end: 1 },
  exactly365Days: { start: -365, end: -365 },
  exactly30Days: { start: -40, end: -10 },
  sameDay: { start: -3, end: -3 },
  futureEnd: { start: 0, end: 1 }
} satisfies Record<string, TripDateOffsets>;

const datePartsAtOffset = (offset: number): DateParts => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);

  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear())
  };
};

const tripDatesAtOffsets = ({ start, end }: TripDateOffsets): TripDates => ({
  start: datePartsAtOffset(start),
  end: datePartsAtOffset(end)
});

test.describe('Trip date validation', () => {
  test.beforeEach(async ({ navigationFlow, recordsPage, selectVesselPage, tripDatePage }) => {
    await test.step('The user signs in to the service', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for trip date validation tests'
      });
    });

    await test.step('The user starts a new catch record', async () => {
      await recordsPage.createNewRecordButton().click();
      await selectVesselPage.selectVessel(vessels.testVessel);
      await selectVesselPage.clickSaveAndContinue();
    });

    await test.step('The user chooses to enter separate trip dates', async () => {
      await tripDatePage.selectSameDate(false);
      await tripDatePage.clickSaveAndContinue();
    });
  });

  // Each test starts a catch record, so its draft is deleted after each test
  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Accepts a valid trip',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.validTrip);

      await test.step('The trip start date is not in the future', async () => {
        dates.start = datePartsAtOffset(-1);
      });

      await test.step('The trip start date is no more than 365 days before the date of entry', async () => {
        dates.start = datePartsAtOffset(dateOffsets.validTrip.start);
      });

      await test.step('The trip end date is the same as or later than the trip start date', async () => {
        dates.end = dates.start;
      });

      await test.step('The trip length does not exceed 30 days', async () => {
        dates.end = datePartsAtOffset(dateOffsets.validTrip.end);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('The trip dates are accepted', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeHidden();
      });

      await test.step('The user is allowed to proceed', async () => {
        await expect(tripReturnDatePage.page).not.toHaveURL(/\/trip-(departure|return)-date$/);
      });
    }
  );

  test(
    'Rejects a trip start date more than 365 days ago',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.olderThan365Days);

      await test.step('The trip start date is more than 365 days before the date of entry', async () => {
        dates.start = datePartsAtOffset(dateOffsets.olderThan365Days.start);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
      });

      await test.step('Progression is prevented', async () => {
        await tripDepartureDatePage.expectUrl(/\/trip-departure-date$/);
      });

      await test.step('A validation message explains the 365-day limit', async () => {
        await expect(tripDepartureDatePage.errorSummary()).toBeVisible();
        await expect(tripDepartureDatePage.errorSummaryLink()).toContainText(/365|year/i);
      });
    }
  );

  test(
    'Rejects a trip longer than 30 days',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.longerThan30Days);

      await test.step('The trip length exceeds 30 days', async () => {
        dates.start = datePartsAtOffset(dateOffsets.longerThan30Days.start);
        dates.end = datePartsAtOffset(dateOffsets.longerThan30Days.end);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('Progression is prevented', async () => {
        await tripReturnDatePage.expectUrl(/\/trip-return-date$/);
      });

      await test.step('A validation message explains the 30-day limit', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeVisible();
        await expect(tripReturnDatePage.errorSummaryLink()).toContainText(/30 days/i);
      });
    }
  );

  test(
    'Rejects an end date before the start date',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.endBeforeStart);

      await test.step('The trip end date is earlier than the trip start date', async () => {
        dates.start = datePartsAtOffset(dateOffsets.endBeforeStart.start);
        dates.end = datePartsAtOffset(dateOffsets.endBeforeStart.end);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('Progression is prevented', async () => {
        await tripReturnDatePage.expectUrl(/\/trip-return-date$/);
      });

      await test.step('A validation message explains the end-date ordering rule', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeVisible();
        await expect(tripReturnDatePage.errorSummaryLink()).toContainText(/before|earlier|after/i);
      });
    }
  );

  test(
    'Rejects a future trip start date',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.futureStart);

      await test.step('The trip start date is in the future', async () => {
        dates.start = datePartsAtOffset(dateOffsets.futureStart.start);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
      });

      await test.step('Progression is prevented', async () => {
        await tripDepartureDatePage.expectUrl(/\/trip-departure-date$/);
      });

      await test.step('A validation message explains that the start date cannot be in the future', async () => {
        await expect(tripDepartureDatePage.errorSummary()).toBeVisible();
        await expect(tripDepartureDatePage.errorSummaryLink()).toHaveText(
          'Date you left for your trip must be today or in the past'
        );
      });
    }
  );

  test(
    'Accepts the 365-day boundary',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.exactly365Days);

      await test.step('The trip start date is exactly 365 days before the date of entry', async () => {
        dates.start = datePartsAtOffset(dateOffsets.exactly365Days.start);
      });

      await test.step('All other trip date validations are satisfied', async () => {
        dates.end = dates.start;
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('The trip dates are accepted', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeHidden();
        await expect(tripReturnDatePage.page).not.toHaveURL(/\/trip-(departure|return)-date$/);
      });
    }
  );

  test(
    'Accepts the 30-day boundary',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.exactly30Days);

      await test.step('The trip length is exactly 30 days', async () => {
        dates.start = datePartsAtOffset(dateOffsets.exactly30Days.start);
      });

      await test.step('All other trip date validations are satisfied', async () => {
        dates.end = datePartsAtOffset(dateOffsets.exactly30Days.end);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('The trip dates are accepted', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeHidden();
        await expect(tripReturnDatePage.page).not.toHaveURL(/\/trip-(departure|return)-date$/);
      });
    }
  );

  test(
    'Accepts a same-day trip',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.sameDay);

      await test.step('The trip start and end dates are the same', async () => {
        dates.start = datePartsAtOffset(dateOffsets.sameDay.start);
      });

      await test.step('All other trip date validations are satisfied', async () => {
        dates.end = dates.start;
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('The trip dates are accepted', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeHidden();
        await expect(tripReturnDatePage.page).not.toHaveURL(/\/trip-(departure|return)-date$/);
      });
    }
  );

  test(
    'Rejects a future trip end date',
    { tag: ['@ui', '@regression', '@tripDateValidation'] },
    async ({ tripDepartureDatePage, tripReturnDatePage }) => {
      const dates = tripDatesAtOffsets(dateOffsets.futureEnd);

      await test.step('The trip end date is in the future', async () => {
        dates.end = datePartsAtOffset(dateOffsets.futureEnd.end);
      });

      await test.step('The user continues', async () => {
        await tripDepartureDatePage.enterDate(dates.start.day, dates.start.month, dates.start.year);
        await tripDepartureDatePage.clickSaveAndContinue();
        await tripReturnDatePage.enterDate(dates.end.day, dates.end.month, dates.end.year);
        await tripReturnDatePage.clickSaveAndContinue();
      });

      await test.step('Progression is prevented', async () => {
        await tripReturnDatePage.expectUrl(/\/trip-return-date$/);
      });

      await test.step('A validation message explains that the end date cannot be in the future', async () => {
        await expect(tripReturnDatePage.errorSummary()).toBeVisible();
        await expect(tripReturnDatePage.errorSummaryLink()).toHaveText(
          'Date you returned from your trip must be today or in the past'
        );
      });
    }
  );
});
