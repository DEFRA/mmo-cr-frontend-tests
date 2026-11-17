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
  type GearData,
  type SpeciesCatch,
  type TripDates,
  daysAgo,
  noFavourites,
  recordReferencePattern,
  recordsListDate
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const lowestoft = 'Lowestoft';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots', potsDetails: { hauled: '1', inWater: '1' } };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const gearCatches: GearCatch[] = [{ gear: pots, areaCode, species: [cod] }];
const submittedStatus = 'Submitted';
const testFavourites: Favourites = { ports: [plymouth, lowestoft], gears: [pots.name], species: [cod.name] };

test.describe('Create Catch Record', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];

  test.beforeEach(async () => {
    createdRecords = [];
    addedFavourites = noFavourites;
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
  });

  // Blocked (OQ-3, OQ-1, OQ-2): needs a first-time account with no favourites and verified submission confirmation
  test.fixme(
    'First-time fisher submits same-day trip',
    {
      tag: ['@ui', '@regression', '@createCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-04' }
    },
    async ({
      navigationFlow,
      catchRecordFlow,
      recordsPage,
      selectVesselPage,
      tripDatePage,
      checkAnswersPage,
      submittedRecordPage
    }) => {
      await test.step('I am a first-time user', async () => {
        // UNVERIFIED (OQ-3): dedicated first-time account required
      });

      await test.step('I am signed in and online', async () => {
        // UNVERIFIED (OQ-3): sign in with the first-time account's credentials from .env
        await navigationFlow.signIn();
      });

      await test.step('I have no saved catch information', async () => {
        // UNVERIFIED (OQ-3): precondition of the first-time account
      });

      await test.step('I create a new catch record', async () => {
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
      });

      await test.step('I select my vessel', async () => {
        await selectVesselPage.selectVessel(vesselName);
        await selectVesselPage.clickSaveAndContinue();
        createdRecords.push(await catchRecordFlow.readRecordReference());
      });

      await test.step('I confirm a same-day trip', async () => {
        await tripDatePage.selectSameDate(true);
        await tripDatePage.clickSaveAndContinue();
      });

      await test.step('I enter ports, gear, catch area, species and weights', async () => {
        // UNVERIFIED (OQ-3): no-favourites route (port search, confirm same port, add gear and species) not walked live
      });

      await test.step('I confirm the landing information', async () => {
        await catchRecordFlow.confirmAllCatchLanded();
      });

      await test.step('I review, declare and submit the record', async () => {
        await checkAnswersPage.clickAcceptAndSubmit();
      });

      await test.step('The catch record should be submitted successfully', async () => {
        // UNVERIFIED (OQ-1): post-submit page and success indicator to be confirmed
      });

      await test.step('I should receive a catch record reference', async () => {
        await expect(submittedRecordPage.recordReference()).toHaveText(recordReferencePattern);
      });
    }
  );

  // Blocked (OQ-1): the reference shown after submission has not been verified
  test.fixme(
    'Submit a multi-day trip',
    {
      tag: ['@ui', '@smoke', '@createCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-05' }
    },
    async ({ navigationFlow, catchRecordFlow, checkAnswersPage, recordsPage }) => {
      const multiDayTrip: TripDates = { departureDate: daysAgo(2), returnDate: daysAgo(1) };
      let reference = '';

      await test.step('I am signed in', async () => {
        await navigationFlow.signIn();
        addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
      });

      await test.step('My trip did not start and finish today', async () => {
        // multiDayTrip is computed at runtime: departure two days ago, return yesterday
      });

      await test.step('I create a new catch record', async () => {
        reference = await catchRecordFlow.startRecord(vesselName);
        createdRecords.push(reference);
      });

      await test.step('I enter departure and return dates', async () => {
        await catchRecordFlow.enterMultiDayTrip(multiDayTrip);
      });

      await test.step('I enter ports and catch details', async () => {
        await catchRecordFlow.selectPorts(plymouth, lowestoft);
        await catchRecordFlow.selectGears(gearCatches.map(({ gear }) => gear));
        await catchRecordFlow.enterCatchDetailsForEachGear(gearCatches);
        await catchRecordFlow.confirmAllCatchLanded();
      });

      await test.step('I review and submit the record', async () => {
        await checkAnswersPage.clickAcceptAndSubmit();
      });

      await test.step('The multi-day trip should be recorded successfully', async () => {
        await recordsPage.goto('/records');
        await expect(recordsPage.recordStatus(reference)).toHaveText(submittedStatus);
        await expect(recordsPage.recordRow(reference)).toContainText(recordsListDate(multiDayTrip.returnDate));
      });

      await test.step('I should receive a catch record reference', async () => {
        // UNVERIFIED (OQ-1): assert the reference on the post-submit confirmation
        expect(reference).toMatch(recordReferencePattern);
      });
    }
  );
});
