/**
 * Submit a completed catch record and receive a confirmation and reference.
 * Traceability: UAT-15 (CRAR ticket TBC). UAT-16 is not planned pending a PO decision (OQ-2).
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
  noFavourites
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots', potsDetails: { hauled: '1', inWater: '1' } };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const reviewRecord: CatchRecordData = {
  vesselName,
  departurePort: plymouth,
  returnPort: plymouth,
  gearCatches: [{ gear: pots, areaCode, species: [cod] }]
};
const testFavourites: Favourites = { ports: [plymouth], gears: [pots.name], species: [cod.name] };

test.describe('Submit Catch Record', () => {
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

  // Blocked (OQ-1, OQ-2): post-submit confirmation not verified; no declaration checkbox on the live review page
  test.fixme(
    'Confirm and submit completed record',
    {
      tag: ['@ui', '@regression', '@submitCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-15' }
    },
    async ({ catchRecordFlow, checkAnswersPage, submittedRecordPage }) => {
      let reference = '';

      await test.step('I have reviewed my completed catch record', async () => {
        reference = await catchRecordFlow.completeRecordToReview(reviewRecord);
        createdRecords.push(reference);
      });

      await test.step('I confirm that the information is complete and accurate', async () => {
        // UNVERIFIED (OQ-2): the live page has warning text and no declaration checkbox
      });

      await test.step('I submit the record', async () => {
        await checkAnswersPage.clickAcceptAndSubmit();
      });

      await test.step('The submission should succeed', async () => {
        // UNVERIFIED (OQ-1): post-submit page and success indicator to be confirmed
      });

      await test.step('I should see a confirmation message', async () => {
        // UNVERIFIED (OQ-1): confirmation message text to be confirmed
      });

      await test.step('I should receive a catch record reference', async () => {
        await expect(submittedRecordPage.recordReference()).toHaveText(reference);
      });
    }
  );
});
