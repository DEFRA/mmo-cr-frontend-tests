/**
 * Sign In validation errors for empty and incorrectly formatted email and password.
 * @author Randhir Patel
 * @since 2026-11-13
 */
import { expect, test } from '../../../fixtures/commonfixture';

const unregisteredCredentials = { email: 'not-registered@example.com', password: 'IncorrectPassword1!' };
const invalidEmailFormat = 'invalid-email-format';
const messages = {
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Please enter your password.',
  invalidCredentials: 'Invalid email address or password. Please try again.'
} as const;

test.describe('Sign in error scenarios', () => {
  test.beforeEach(async ({ signInPage }) => {
    await test.step('The user is on the Sign In screen', async () => {
      await signInPage.goto('/sign-in');
    });
  });

  test(
    'Displays an error when the email address is empty',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with the email field empty', async () => {
        await signInPage.login('', unregisteredCredentials.password);
      });

      await test.step(`"${messages.emailRequired}" is displayed`, async () => {
        await expect(signInPage.errorMessage()).toContainText(messages.emailRequired);
      });
    }
  );

  test(
    'Displays an error when the password is empty',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with the password field empty', async () => {
        await signInPage.login(unregisteredCredentials.email, '');
      });

      await test.step(`"${messages.passwordRequired}" is displayed`, async () => {
        await expect(signInPage.errorMessage()).toContainText(messages.passwordRequired);
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
        await expect(signInPage.errorMessage()).toContainText(messages.emailRequired);
        await expect(signInPage.errorMessage()).toContainText(messages.passwordRequired);
      });
    }
  );

  test(
    'Displays an error when the email address format is invalid',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps Sign in with an incorrectly formatted email', async () => {
        await signInPage.login(invalidEmailFormat, unregisteredCredentials.password);
      });

      await test.step(`"${messages.emailInvalid}" is displayed`, async () => {
        await expect(signInPage.errorMessage()).toContainText(messages.emailInvalid);
      });
    }
  );
});
