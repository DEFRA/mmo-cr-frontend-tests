/**
 * Submit a completed catch record and receive a confirmation and reference.
 * Traceability: UAT-15 (CRAR ticket TBC). UAT-16 is not planned pending a PO decision (OQ-2).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type CatchRecordData, type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas } from '../../../test-data/testData';

const reviewRecord: CatchRecordData = {
  vesselName: vessels.achilles,
  departurePort: ports.plymouth,
  returnPort: ports.plymouth,
  gearCatches: [{ gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] }]
};
const testFavourites: Favourites = {
  ports: [ports.plymouth],
  gears: [gears.pots.name],
  species: [catchSpecies.cod.name]
};

test.describe('Submit Catch Record', () => {
  test.use({ testFavourites });

  // Blocked (OQ-1, OQ-2): post-submit confirmation not verified; no declaration checkbox on the live review page
  test.fixme(
    'Confirm and submit completed record',
    {
      tag: ['@ui', '@regression', '@submitCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-15' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, submittedRecordPage }) => {
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
