/**
 * Record different departure and return ports for a trip.
 * Traceability: UAT-06 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = { ports: [ports.first, ports.second], gears: [], species: [] };

test.describe('Trip Information', () => {
  test.use({ testFavourites });

  test(
    'Different departure and return ports',
    {
      tag: ['@ui', '@regression', '@tripDetails', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-06' }
    },
    async ({
      createdRecords,
      catchRecordFlow,
      departurePortPage,
      returnPortPage,
      checkAnswersPage,
      gearSelectionPage
    }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
      });

      await test.step('I select a departure port', async () => {
        await departurePortPage.selectPort(ports.first);
        await departurePortPage.clickSaveAndContinue();
      });

      await test.step('I select a different return port', async () => {
        await returnPortPage.selectPort(ports.second);
        await returnPortPage.clickSaveAndContinue();
      });

      await test.step('Both ports should be saved against the trip', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort)).toHaveText(ports.first);
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort)).toHaveText(ports.second);
      });

      await test.step('I should be able to continue', async () => {
        await checkAnswersPage.goBack();
        await gearSelectionPage.expectUrl(/\/gear-selection$/);
        await expect(gearSelectionPage.pageHeading()).toBeVisible();
      });
    }
  );
});
