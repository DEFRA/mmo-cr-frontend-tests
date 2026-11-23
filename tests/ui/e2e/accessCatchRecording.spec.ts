/**
 * Sign in to Record Your Catch end to end and reach the catch records.
 * Traceability: UAT-01, UAT-02 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';

const validCredentials = {
  email: process.env.CATCH_RECORDING_EMAIL ?? '',
  password: process.env.CATCH_RECORDING_PASSWORD ?? ''
};
const missingCredentialsReason = 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD must be set in .env';
const unregisteredCredentials = { email: 'not-registered@example.com', password: 'IncorrectPassword1!' };
const invalidCredentialsMessage = 'Invalid email address or password. Please try again.';
const signInUrl = /\/sign-in/;
const signInHeading = 'Sign in';
const recordsUrl = /\/records$/;
const recordsPageTitle = 'Your catch records | Record your catch';

test.describe('Access Catch Recording', () => {
  test(
    'Fisher signs in successfully',
    {
      tag: ['@ui', '@smoke', '@signIn', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-01' }
    },
    async ({ signInPage, recordsPage }) => {
      await test.step('I am a registered user', async () => {
        test.skip(!validCredentials.email || !validCredentials.password, missingCredentialsReason);
      });

      await test.step('I am on the Sign in screen', async () => {
        await signInPage.goto('/sign-in');
      });

      await test.step('I enter valid sign-in details', async () => {
        await signInPage.emailInput().fill(validCredentials.email);
        await signInPage.passwordInput().fill(validCredentials.password);
      });

      await test.step('I select Sign in', async () => {
        await signInPage.signInButton().click();
      });

      await test.step('I should access the Catch Recording service', async () => {
        await recordsPage.expectUrl(recordsUrl);
        await recordsPage.expectTitle(recordsPageTitle);
      });

      await test.step('I should see my catch records', async () => {
        await expect(recordsPage.catchRecordsTable()).toBeVisible();
      });

      await test.step('I should be able to create a new catch record', async () => {
        await expect(recordsPage.createNewRecordButton()).toBeEnabled();
      });
    }
  );

  test.fixme(
    'Incorrect sign-in details',
    {
      tag: ['@ui', '@regression', '@signIn', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-02' }
    },
    async ({ signInPage }) => {
      await test.step('I am on the Sign in screen', async () => {
        await signInPage.goto('/sign-in');
      });

      await test.step('I enter incorrect sign-in details', async () => {
        await signInPage.emailInput().fill(unregisteredCredentials.email);
        await signInPage.passwordInput().fill(unregisteredCredentials.password);
      });

      await test.step('I select Sign in', async () => {
        await signInPage.signInButton().click();
      });

      await test.step('I should remain on the Sign in screen', async () => {
        await signInPage.expectUrl(signInUrl);
        await expect(signInPage.signInHeading()).toHaveText(signInHeading);
      });

      await test.step('I should see a clear error message', async () => {
        await expect(signInPage.errorMessage()).toContainText(invalidCredentialsMessage);
      });

      await test.step('I should be able to correct my details and try again', async () => {
        await expect(signInPage.emailInput()).toBeEditable();
        await expect(signInPage.passwordInput()).toBeEditable();
        await expect(signInPage.signInButton()).toBeEnabled();
      });
    }
  );
});
