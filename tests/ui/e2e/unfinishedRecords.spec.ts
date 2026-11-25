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
  type MultiDayCatchRecordData,
  daysAgo,
  recordsListDate,
  reviewDate
} from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, checkAnswers, recordStatuses } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first, ports.second],
  gears: [gears.pots.name],
  species: [catchSpecies.cod.name]
};

test.describe('Unfinished Records', () => {
  test.use({ testFavourites });

  let firstDraft: MultiDayCatchRecordData;
  let secondDraft: CatchRecordData;

  test.beforeEach(() => {
    // Completing one or two drafts to review exceeds the default 30s test timeout
    test.slow();
    firstDraft = {
      vesselName: vessels.testVessel,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: ports.first,
      returnPort: ports.second,
      gearCatches: [{ gear: gears.pots, species: [catchSpecies.cod] }]
    };
    secondDraft = {
      vesselName: vessels.testVessel,
      departurePort: ports.first,
      returnPort: ports.first,
      gearCatches: [{ gear: gears.pots, species: [catchSpecies.cod] }]
    };
  });

  test(
    'Resume unfinished catch record',
    {
      tag: ['@ui', '@regression', '@draftRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-19' }
    },
    async ({ createdRecords, catchRecordFlow, recordsPage, draftRecordPage, checkAnswersPage, tripDatePage }) => {
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
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departureDate)).toHaveText(
          reviewDate(firstDraft.tripDates.departureDate)
        );
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate)).toHaveText(
          reviewDate(firstDraft.tripDates.returnDate)
        );
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort)).toHaveText(
          firstDraft.departurePort
        );
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort)).toHaveText(
          firstDraft.returnPort
        );
        await expect(
          checkAnswersPage.speciesSummaryValue(
            catchSpecies.cod.name,
            gears.pots.name,
            checkAnswers.summaryKeys.weightRetained
          )
        ).toHaveText(`${catchSpecies.cod.weight} kg`);
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
    async ({ createdRecords, catchRecordFlow, recordsPage, draftRecordPage }) => {
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
    async ({ createdRecords, catchRecordFlow, recordsPage, draftRecordPage, tripDatePage, checkAnswersPage }) => {
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
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate)).toHaveText(
          reviewDate(firstDraft.tripDates.returnDate)
        );
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort)).toHaveText(
          firstDraft.returnPort
        );
      });

      await test.step('The other records should remain unchanged', async () => {
        await recordsPage.goto('/records');
        await expect(recordsPage.recordStatus(secondReference)).toHaveText(recordStatuses.draft);
        await expect(recordsPage.recordRow(secondReference)).toContainText(recordsListDate(secondDraftTripEnd));
      });
    }
  );
});
