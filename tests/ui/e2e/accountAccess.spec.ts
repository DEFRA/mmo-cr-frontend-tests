/**
 * Sign out of Record Your Catch and confirm the account is no longer accessible.
 * Traceability: UAT-30 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';

const signInUrl = /\/sign-in/;
const signInHeading = 'Sign in';

test.describe('Account Access', () => {
  // Blocked (OQ-7): Sign out is not shown on /records and the sign-out confirmation step is unverified
  test.fixme(
    'Sign out',
    {
      tag: ['@ui', '@regression', '@signOut', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-30' }
    },
    async ({ navigationFlow, recordsPage, signInPage }) => {
      await test.step('I am signed in', async () => {
        await navigationFlow.signIn();
      });

      await test.step('I choose Sign out', async () => {
        await recordsPage.header.signOutButton().click();
      });

      await test.step('I confirm that I want to sign out', async () => {
        // UNVERIFIED (OQ-7): confirmation page and control not yet known
      });

      await test.step('I should return to the Sign in screen', async () => {
        await signInPage.expectUrl(signInUrl);
        await expect(signInPage.signInHeading()).toHaveText(signInHeading);
      });

      await test.step('I should not access my account without signing in again', async () => {
        await recordsPage.goto('/records');
        await signInPage.expectUrl(signInUrl);
      });
    }
  );
});
