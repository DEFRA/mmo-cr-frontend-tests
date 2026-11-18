/**
 * Record different departure and return ports for a trip.
 * Traceability: UAT-06 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, noFavourites } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const lowestoft = 'Lowestoft';
const departurePortKey = 'Departure port';
const returnPortKey = 'Return port';
const testFavourites: Favourites = { ports: [plymouth, lowestoft], gears: [], species: [] };

test.describe('Trip Information', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    createdRecords = [];
    await test.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
  });

  test(
    'Different departure and return ports',
    {
      tag: ['@ui', '@regression', '@tripDetails', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-06' }
    },
    async ({ catchRecordFlow, departurePortPage, returnPortPage, checkAnswersPage, gearSelectionPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
      });

      await test.step('I select a departure port', async () => {
        await departurePortPage.selectPort(plymouth);
        await departurePortPage.clickSaveAndContinue();
      });

      await test.step('I select a different return port', async () => {
        await returnPortPage.selectPort(lowestoft);
        await returnPortPage.clickSaveAndContinue();
      });

      await test.step('Both ports should be saved against the trip', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(plymouth);
        await expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(lowestoft);
      });

      await test.step('I should be able to continue', async () => {
        await checkAnswersPage.goBack();
        await gearSelectionPage.expectUrl(/\/gear-selection$/);
        await expect(gearSelectionPage.pageHeading()).toBeVisible();
      });
    }
  );
});
