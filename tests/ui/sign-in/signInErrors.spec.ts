/**
 * Sign In validation errors for empty and incorrectly formatted email and password.
 * @author Randhir Patel
 * @since 2026-11-13
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { errorMessages, signInData } from '../../../test-data/testData';

test.describe.skip('Sign in error scenarios', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('The user is on the Sign In screen', async () => {
      await navigationFlow.openSignIn();
    });
  });

  test(
    'Displays an error when the email address is empty',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with the email field empty', async () => {
        await signInPage.login('', signInData.unregisteredCredentials.password);
      });

      await test.step(`"${errorMessages.signIn.emailRequired}" is displayed`, async () => {
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.emailRequired}`
        ).toContainText(errorMessages.signIn.emailRequired);
      });
    }
  );

  test(
    'Displays an error when the password is empty',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with the password field empty', async () => {
        await signInPage.login(signInData.unregisteredCredentials.email, '');
      });

      await test.step(`"${errorMessages.signIn.passwordRequired}" is displayed`, async () => {
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.passwordRequired}`
        ).toContainText(errorMessages.signIn.passwordRequired);
      });
    }
  );

  test(
    'Displays both errors when email and password are empty',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with both fields empty', async () => {
        await signInPage.login('', '');
      });

      await test.step('Both validation messages are displayed', async () => {
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.emailRequired}`
        ).toContainText(errorMessages.signIn.emailRequired);
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.passwordRequired}`
        ).toContainText(errorMessages.signIn.passwordRequired);
      });
    }
  );

  test(
    'Displays an error when the email address format is invalid',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with an incorrectly formatted email', async () => {
        await signInPage.login(signInData.invalidEmailFormat, signInData.unregisteredCredentials.password);
      });

      await test.step(`"${errorMessages.signIn.emailInvalid}" is displayed`, async () => {
        await expect(
          signInPage.errorMessage(),
          `Error message to contain text ${errorMessages.signIn.emailInvalid}`
        ).toContainText(errorMessages.signIn.emailInvalid);
      });
    }
  );
});
