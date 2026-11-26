/**
 * Amend a submitted catch record by giving a reason, changing an answer and resubmitting.
 * Traceability: UAT-14 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type MultiDayCatchRecordData, daysAgo, reviewDate } from '../helpers/catchRecordFlow';
import {
  vessels,
  ports,
  gears,
  catchSpecies,
  checkAnswers,
  recordStatuses,
  amendReason
} from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.third, ports.fourth],
  gears: [gears.setLonglines.name],
  species: [catchSpecies.cod.name]
};

test.describe('Amend Catch Record', () => {
  test.use({ testFavourites });

  test(
    'Amend a submitted catch record',
    {
      tag: ['@ui', '@regression', '@amendCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-14' }
    },
    async ({
      createdRecords,
      catchRecordFlow,
      checkAnswersPage,
      recordsPage,
      submittedRecordPage,
      editReasonPage,
      tripReturnDatePage
    }) => {
      test.slow();
      const record: MultiDayCatchRecordData = {
        vesselName: vessels.testVessel,
        tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
        departurePort: ports.third,
        returnPort: ports.fourth,
        gearCatches: [{ gear: gears.setLonglines, species: [catchSpecies.cod] }]
      };
      const amendedReturnDate = daysAgo(0);
      let reference = '';

      await test.step('I have submitted a catch record', async () => {
        reference = await catchRecordFlow.completeRecordToReview(record);
        createdRecords.push(reference);
        await checkAnswersPage.clickAcceptAndSubmit();
        await checkAnswersPage.expectUrl(/\/confirmation$/);
        await recordsPage.goto('/records');
        await expect(
          recordsPage.recordStatus(reference),
          `Record status to have text ${recordStatuses.submitted}`
        ).toHaveText(recordStatuses.submitted);
      });

      await test.step('I select the record on the dashboard and choose Edit catch record', async () => {
        await recordsPage.openRecord(reference);
        await submittedRecordPage.clickEditCatchRecord();
        await expect(editReasonPage.pageHeading(), 'Page heading to be visible').toBeVisible();
      });

      await test.step('I enter the reason for the changes and save', async () => {
        await editReasonPage.enterReason(amendReason);
        await editReasonPage.clickSaveAndContinue();
        await checkAnswersPage.expectUrl(/\/edit-review$/);
      });

      await test.step('I change the return date', async () => {
        await checkAnswersPage.changeLinkNamed(checkAnswers.changeLinks.returnDate).click();
        await tripReturnDatePage.enterDateFrom(amendedReturnDate);
        await tripReturnDatePage.clickSaveAndContinue();
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate),
          'Summary value to have text'
        ).toHaveText(reviewDate(amendedReturnDate));
      });

      await test.step('I confirm the declaration and submit the changes', async () => {
        await checkAnswersPage.checkDeclaration();
        await checkAnswersPage.clickAcceptAndSubmit();
        await checkAnswersPage.expectUrl(/\/confirmation$/);
      });

      await test.step('The record should be displayed as amended', async () => {
        await recordsPage.goto('/records');
        await expect(
          recordsPage.recordStatus(reference),
          `Record status to have text ${recordStatuses.amended}`
        ).toHaveText(recordStatuses.amended);
      });
    }
  );
});
