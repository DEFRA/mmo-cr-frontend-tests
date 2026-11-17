/**
 * Prevent progress until required catch-record information is provided, then continue once corrected.
 * Traceability: UAT-25 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, noFavourites } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const testFavourites: Favourites = { ports: [plymouth], gears: [], species: [] };
const tripDateRequiredError = 'Select yes if your trip started and finished today';
const tripDateFieldAnchor = '#tripSameDate';

test.describe('Complete Catch Record', () => {
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
    'Required information missing',
    {
      tag: ['@ui', '@regression', '@requiredInformation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-25' }
    },
    async ({ catchRecordFlow, tripDatePage, departurePortPage }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
      });

      await test.step('I leave required business information incomplete', async () => {
        // No answer is selected for "Did your trip start and finish today?"
      });

      await test.step('I attempt to continue', async () => {
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I should be told what information is required', async () => {
        await tripDatePage.expectUrl(/\/trip-date$/);
        await expect(tripDatePage.common.errorSummary()).toContainText(tripDateRequiredError);
        await expect(tripDatePage.common.errorMessage()).toContainText(tripDateRequiredError);
      });

      await test.step('I should be able to correct it', async () => {
        await expect(
          tripDatePage.common.errorSummary().getByRole('link', { name: tripDateRequiredError })
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
