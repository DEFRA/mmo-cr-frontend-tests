import { expect, test } from '../../fixtures/commonfixture';

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
    await expect(signInPage.forgotPasswordLink()).toHaveAttribute('href', '/not-implemented?return=/sign-in');
    await expect(signInPage.registerLink()).toBeVisible();
  });
});
