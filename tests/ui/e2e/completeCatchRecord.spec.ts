/**
 * Prevent progress until required catch-record information is provided, then continue once corrected.
 * Traceability: UAT-25 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, errorMessages } from '../../../test-data/testData';

const testFavourites: Favourites = { ports: [ports.plymouth], gears: [], species: [] };
const tripDateFieldAnchor = '#tripSameDate';

test.describe('Complete Catch Record', () => {
  test.use({ testFavourites });

  test(
    'Required information missing',
    {
      tag: ['@ui', '@regression', '@requiredInformation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-25' }
    },
    async ({ createdRecords, catchRecordFlow, tripDatePage, departurePortPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.achilles));
      });

      await test.step('I leave required business information incomplete', async () => {
        // No answer is selected for "Did your trip start and finish today?"
      });

      await test.step('I attempt to continue', async () => {
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I should be told what information is required', async () => {
        await tripDatePage.expectUrl(/\/trip-date$/);
        await expect(tripDatePage.common.errorSummary()).toContainText(errorMessages.tripDates.sameDayRequired);
        await expect(tripDatePage.common.errorMessage()).toContainText(errorMessages.tripDates.sameDayRequired);
      });

      await test.step('I should be able to correct it', async () => {
        await expect(
          tripDatePage.common.errorSummary().getByRole('link', { name: errorMessages.tripDates.sameDayRequired })
        ).toHaveAttribute('href', tripDateFieldAnchor);
        await expect(tripDatePage.yesRadio()).toBeEnabled();
      });

      await test.step('I enter valid information and continue', async () => {
        await tripDatePage.selectSameDate(true);
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I should continue after entering valid information', async () => {
        await departurePortPage.expectUrl(/\/departure-port$/);
        await expect(departurePortPage.pageHeading()).toBeVisible();
      });
    }
  );
});
