/**
 * Clean-up script that deletes every draft catch record shown on the records page.
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';

// Safety cap so a failed delete can never loop forever.
const maxDraftsToDelete = 200;
//run only when required
test.describe.skip('Draft records clean-up', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('I am signed in and on the records page', async () => {
      await navigationFlow.signIn();
    });
  });

  test(
    'Delete all draft catch records',
    { tag: ['@ui', '@regression', '@draftRecords', '@cleanup'] },
    async ({ recordsPage, draftRecordPage }) => {
      test.setTimeout(15 * 60_000);
      let deleted = 0;

      await test.step('I delete each draft record shown on the records page, skipping submitted records', async () => {
        await expect(recordsPage.catchRecordsTable()).toBeVisible();
        while ((await recordsPage.draftRecordRows().count()) > 0 && deleted < maxDraftsToDelete) {
          const reference = await recordsPage.openFirstDraftRecord();
          await expect(draftRecordPage.pageHeading()).toBeVisible();
          await draftRecordPage.deleteDraft();
          await recordsPage.expectUrl(/\/records$/);
          await expect(recordsPage.catchRecordsTable().getByRole('link', { name: reference })).toHaveCount(0);
          deleted++;
        }
        console.log(`Deleted ${deleted} draft record(s)`);
        test.info().annotations.push({ type: 'deleted drafts', description: String(deleted) });
      });

      await test.step('No draft records are shown on the records page', async () => {
        await expect(recordsPage.draftRecordRows()).toHaveCount(0);
      });
    }
  );
});
