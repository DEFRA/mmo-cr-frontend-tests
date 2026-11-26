/**
 * Sign in to Record Your Catch end to end and reach the catch records.
 * Traceability: UAT-01, UAT-02 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { errorMessages, signInData } from '../../../test-data/testData';

const validCredentials = {
  email: process.env.CATCH_RECORDING_EMAIL ?? '',
  password: process.env.CATCH_RECORDING_PASSWORD ?? ''
};
const missingCredentialsReason = 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD must be set in .env';

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
        await recordsPage.expectOnPage();
        await recordsPage.expectTitle(signInData.recordsPageTitle);
      });

      await test.step('I should see my catch records', async () => {
        await expect(recordsPage.catchRecordsTable(), 'Catch records table to be visible').toBeVisible();
      });

      await test.step('I should be able to create a new catch record', async () => {
        await expect(recordsPage.createNewRecordButton(), 'Create new record button to be enabled').toBeEnabled();
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
        await signInPage.emailInput().fill(signInData.unregisteredCredentials.email);
        await signInPage.passwordInput().fill(signInData.unregisteredCredentials.password);
      });

      await test.step('I select Sign in', async () => {
        await signInPage.signInButton().click();
      });

      await test.step('I should remain on the Sign in screen', async () => {
        await signInPage.expectOnPage();
        await expect(signInPage.signInHeading(), `Sign in heading to have text ${signInData.signInHeading}`).toHaveText(
          signInData.signInHeading
        );
      });

      await test.step('I should see a clear error message', async () => {
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.invalidCredentials}`
        ).toContainText(errorMessages.signIn.invalidCredentials);
      });

      await test.step('I should be able to correct my details and try again', async () => {
        await expect(signInPage.emailInput(), 'Email input to be editable').toBeEditable();
        await expect(signInPage.passwordInput(), 'Password input to be editable').toBeEditable();
        await expect(signInPage.signInButton(), 'Sign in button to be enabled').toBeEnabled();
      });
    }
  );
});
