/**
 * Resume, delete and keep separate unfinished (draft) catch records.
 * Traceability: UAT-19, UAT-20, UAT-28 (CRAR ticket TBC).
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
  daysAgo,
  noFavourites,
  recordsListDate,
  reviewDate
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const lowestoft = 'Lowestoft';
const pots: GearData = { name: 'Pots' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const draftStatus = 'Draft';
const departureDateKey = 'Departure date';
const returnDateKey = 'Return date';
const departurePortKey = 'Departure port';
const returnPortKey = 'Return port';
const weightRetainedKey = 'Weight above minimum size retained (kg)';
const testFavourites: Favourites = { ports: [plymouth, lowestoft], gears: [pots.name], species: [cod.name] };

test.describe('Unfinished Records', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];
  let firstDraft: CatchRecordData;
  let secondDraft: CatchRecordData;

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    // Completing one or two drafts to review exceeds the default 30s test timeout
    test.slow();
    createdRecords = [];
    firstDraft = {
      vesselName,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: plymouth,
      returnPort: lowestoft,
      gearCatches: [{ gear: pots, species: [cod] }]
    };
    secondDraft = {
      vesselName,
      departurePort: plymouth,
      returnPort: plymouth,
      gearCatches: [{ gear: pots, species: [cod] }]
    };
    await test.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
    await catchRecordFlow.deleteAllDrafts();
  });

  test(
    'Resume unfinished catch record',
    {
      tag: ['@ui', '@regression', '@draftRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-19' }
    },
    async ({ catchRecordFlow, recordsPage, draftRecordPage, checkAnswersPage, tripDatePage }) => {
      let reference = '';

      await test.step('I started a catch record', async () => {
        reference = await catchRecordFlow.completeRecordToReview(firstDraft);
        createdRecords.push(reference);
      });

      await test.step('I left it before completion', async () => {
        await recordsPage.goto('/records');
      });

      await test.step('I open the Unsent record', async () => {
        await recordsPage.openRecord(reference);
      });

      await test.step('I choose to complete it', async () => {
        await draftRecordPage.completeCatchRecordRadio().check();
        await draftRecordPage.clickSaveAndContinue();
      });

      await test.step('My previously entered information should be retained', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.summaryValue(departureDateKey)).toHaveText(
          reviewDate(firstDraft.tripDates!.departureDate)
        );
        await expect(checkAnswersPage.summaryValue(returnDateKey)).toHaveText(
          reviewDate(firstDraft.tripDates!.returnDate)
        );
        await expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(firstDraft.departurePort);
        await expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(firstDraft.returnPort);
        await expect(checkAnswersPage.speciesSummaryValue(cod.name, pots.name, weightRetainedKey)).toHaveText(
          cod.weight
        );
      });

      // The service resumes at the trip-date question with the earlier answer selected (OQ-17)
      await test.step('I should continue from the appropriate point', async () => {
        await checkAnswersPage.goBack();
        await tripDatePage.expectUrl(/\/trip-date$/);
        await expect(tripDatePage.pageHeading()).toContainText(reference);
        await expect(tripDatePage.noRadio()).toBeChecked();
      });
    }
  );

  test(
    'Delete unwanted draft',
    {
      tag: ['@ui', '@regression', '@draftRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-20' }
    },
    async ({ catchRecordFlow, recordsPage, draftRecordPage }) => {
      let reference = '';

      await test.step('I have an Unsent catch record', async () => {
        reference = await catchRecordFlow.completeRecordToReview(firstDraft);
        createdRecords.push(reference);
        await recordsPage.goto('/records');
      });

      await test.step('I open the record', async () => {
        await recordsPage.openRecord(reference);
      });

      await test.step('I choose to delete it', async () => {
        await draftRecordPage.deleteCatchRecordRadio().check();
      });

      await test.step('I confirm the deletion', async () => {
        await draftRecordPage.clickSaveAndContinue();
      });

      await test.step('The draft should be removed', async () => {
        await recordsPage.expectUrl(/\/records$/);
        await expect(recordsPage.recordRow(reference)).toHaveCount(0);
      });

      await test.step('It should no longer appear in my catch records', async () => {
        await recordsPage.reload();
        await expect(recordsPage.recordRow(reference)).toHaveCount(0);
      });
    }
  );

  test(
    'Multiple drafts remain independent',
    {
      tag: ['@ui', '@regression', '@draftRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-28' }
    },
    async ({ catchRecordFlow, recordsPage, draftRecordPage, tripDatePage, checkAnswersPage }) => {
      const secondDraftTripEnd = daysAgo(0);
      let firstReference = '';
      let secondReference = '';

      await test.step('I have multiple Unsent catch records', async () => {
        firstReference = await catchRecordFlow.completeRecordToReview(firstDraft);
        createdRecords.push(firstReference);
        secondReference = await catchRecordFlow.completeRecordToReview(secondDraft);
        createdRecords.push(secondReference);
        await recordsPage.goto('/records');
      });

      await test.step('I open one Unsent record', async () => {
        await recordsPage.openRecord(firstReference);
        await draftRecordPage.completeCatchRecordRadio().check();
        await draftRecordPage.clickSaveAndContinue();
      });

      await test.step('Only the information for that record should be displayed', async () => {
        await expect(tripDatePage.pageHeading()).toContainText(firstReference);
        await expect(tripDatePage.pageHeading()).not.toContainText(secondReference);
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.summaryValue(returnDateKey)).toHaveText(
          reviewDate(firstDraft.tripDates!.returnDate)
        );
        await expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(firstDraft.returnPort);
      });

      await test.step('The other records should remain unchanged', async () => {
        await recordsPage.goto('/records');
        await expect(recordsPage.recordStatus(secondReference)).toHaveText(draftStatus);
        await expect(recordsPage.recordRow(secondReference)).toContainText(recordsListDate(secondDraftTripEnd));
      });
    }
  );
});
