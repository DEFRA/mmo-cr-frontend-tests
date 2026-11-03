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
    await expect(signInPage.forgotPasswordLink()).toHaveAttribute('href', '/forgotten-password');
    await expect(signInPage.registerLink()).toBeVisible();
  });

  test('forgotten password link navigates to the forgotten password page', async ({ signInPage }) => {
    await signInPage.goto('/sign-in');

    await signInPage.forgotPasswordLink().click();

    await signInPage.expectUrl('/forgotten-password');
  });

  test('create an account guidance can be collapsed and expanded', async ({ signInPage }) => {
    await signInPage.goto('/sign-in');

    // Guidance is expanded by default
    await expect(signInPage.registrationGuidance()).toBeVisible();
    await expect(signInPage.registrationGuidance()).toContainText(
      'You will receive an email invitation to register when your vessel is added to the system.'
    );
    await expect(signInPage.registrationGuidance()).toContainText(
      'Ask your vessel owner to add you. They can do this from their account.'
    );

    await signInPage.registerLink().click();
    await expect(signInPage.registrationGuidance()).toBeHidden();

    await signInPage.registerLink().click();
    await expect(signInPage.registrationGuidance()).toBeVisible();
  });
});
