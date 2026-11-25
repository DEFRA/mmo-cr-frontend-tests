/**
 * View catch records and their statuses after signing in.
 * Traceability: UAT-03 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { vessels, recordStatuses } from '../../../test-data/testData';

// Table statuses seen in the test environment plus those listed in the status guidance (OQ-5)
// The tag text is wrapped in line breaks, so surrounding whitespace is allowed
const recordStatusPattern = /^\s*(Draft|Unsent|Submitted|Amended|Late)\s*$/;
const draftRecordHref = /\/draft\?recordId=/;

test.describe('View Catch Records', () => {
  let draftReference = '';

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    draftReference = '';

    await test.step('I am signed in', async () => {
      await navigationFlow.signIn();
    });

    await test.step('I have existing catch records', async () => {
      draftReference = await catchRecordFlow.startRecord(vessels.achilles);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    if (draftReference) await catchRecordFlow.deleteDraftsIfPresent([draftReference]);
  });

  test(
    'View existing catch records',
    {
      tag: ['@ui', '@regression', '@catchRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-03' }
    },
    async ({ recordsPage }) => {
      await test.step('I open my catch records', async () => {
        await recordsPage.goto('/records');
      });

      await test.step('I should see my catch records', async () => {
        await expect(recordsPage.catchRecordsTable()).toBeVisible();
        await expect(recordsPage.recordRows().first()).toBeVisible();
      });

      await test.step('I should see the status of each record', async () => {
        await expect(recordsPage.recordStatuses()).toHaveCount(await recordsPage.recordRows().count());
        for (const status of await recordsPage.recordStatuses().all()) {
          await expect(status).toHaveText(recordStatusPattern);
        }
      });

      await test.step('I should identify records requiring action', async () => {
        await expect(recordsPage.recordStatus(draftReference)).toHaveText(recordStatuses.draft);
        for (const draftLink of await recordsPage.draftRecordLinks().all()) {
          await expect(draftLink).toHaveAttribute('href', draftRecordHref);
        }
      });
    }
  );
});
