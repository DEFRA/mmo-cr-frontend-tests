/**
 * Sign out of Record Your Catch and confirm the account is no longer accessible.
 * Traceability: UAT-30 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';

const signInUrl = /\/sign-in/;
const signedOutUrl = /\/signed-out$/;

test.describe('Account Access', () => {
  test(
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

      await test.step('I should see that I have been signed out', async () => {
        await signInPage.expectUrl(signedOutUrl);
        await expect(signInPage.signedOutHeading()).toBeVisible();
      });
    }
  );
});
