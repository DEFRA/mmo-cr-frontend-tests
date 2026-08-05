import { expect, test } from '../fixtures/commonfixture';

const email = process.env.CATCH_RECORDING_EMAIL;
const password = process.env.CATCH_RECORDING_PASSWORD;
test.describe('Sign in', () => {
  test('sign-in page displays the required controls', async ({ signInPage }) => {
    await signInPage.goto('/sign-in');

    await expect(signInPage.signInHeading()).toBeVisible();
    await expect(signInPage.emailInput()).toBeVisible();
    await expect(signInPage.passwordInput()).toBeVisible();
    await expect(signInPage.signInButton()).toBeVisible();
    await expect(signInPage.troubleHeading()).toBeVisible();
    await expect(signInPage.forgotPasswordLink()).toHaveAttribute('href', '/forgot-password');
    await expect(signInPage.registerLink()).toBeVisible();
  });

  test('registered user can sign in', async ({ page, signInPage }) => {
    if (!email || !password) {
      test.skip(true, 'Set CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD to run this test.');
      return;
    }

    await signInPage.goto('/sign-in');
    await signInPage.login(email, password);

    await expect(page).not.toHaveURL(/\/sign-in(?:\?.*)?$/);
    await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible();
  });
});
