/**
 * View catch records and their statuses after signing in.
 * Traceability: UAT-03 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';

const noRecordsReason = 'The signed-in test account has no catch records';
// Table statuses seen in the test environment plus those listed in the status guidance (OQ-5)
const recordStatusPattern = /^(Draft|Unsent|Submitted|Amended|Late)$/;
const draftRecordHref = /\/draft\?recordId=/;

test.describe('View Catch Records', () => {
  test(
    'View existing catch records',
    {
      tag: ['@ui', '@regression', '@catchRecords', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-03' }
    },
    async ({ navigationFlow, recordsPage }) => {
      await test.step('I am signed in', async () => {
        await navigationFlow.signIn();
      });

      await test.step('I have existing catch records', async () => {
        test.skip((await recordsPage.recordRows().count()) === 0, noRecordsReason);
      });

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

      // UNVERIFIED (OQ-6): "requiring action" is assumed to mean Draft records that open the draft page
      await test.step('I should identify records requiring action', async () => {
        for (const draftLink of await recordsPage.draftRecordLinks().all()) {
          await expect(draftLink).toHaveAttribute('href', draftRecordHref);
        }
      });
    }
  );
});
