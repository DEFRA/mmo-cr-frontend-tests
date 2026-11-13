/**
 * Sign In screen content, email and password entry, successful and unsuccessful sign in,
 * and navigation to the Forgot Password screen.
 * @author Randhir Patel
 * @since 2026-11-13
 */
import { expect, test } from '../../../fixtures/commonfixture';

const validCredentials = {
  email: process.env.CATCH_RECORDING_EMAIL ?? '',
  password: process.env.CATCH_RECORDING_PASSWORD ?? ''
};
const unregisteredCredentials = { email: 'not-registered@example.com', password: 'IncorrectPassword1!' };
const missingCredentialsReason = 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD must be set in .env';
const signInUrl = /\/sign-in/;
const homeScreenUrl = /\/records$/;
const forgottenPasswordUrl = /\/forgotten-password$/;
const messages = {
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Please enter your password.',
  invalidCredentials: 'Invalid email address or password. Please try again.'
} as const;

test.describe('Sign in form', () => {
  test.beforeEach(async ({ signInPage }) => {
    await test.step('Given the user is on the Sign In screen', async () => {
      await signInPage.goto('/sign-in');
    });
  });

  test('Sign-in page displays the required controls', { tag: ['@ui', '@smoke', '@signIn'] }, async ({ signInPage }) => {
    await test.step('Then the application logo is displayed', async () => {
      await expect(signInPage.appLogo()).toBeVisible();
    });

    await test.step('And the "Sign in" heading is displayed', async () => {
      await expect(signInPage.signInHeading()).toHaveText('Sign in');
    });

    await test.step('And the Email address and Password fields are displayed', async () => {
      await expect(signInPage.emailInput()).toBeVisible();
      await expect(signInPage.passwordInput()).toBeVisible();
    });

    await test.step('And the Sign in button is displayed', async () => {
      await expect(signInPage.signInButton()).toBeVisible();
    });

    await test.step('And the "Having trouble signing in?" section is displayed', async () => {
      await expect(signInPage.troubleHeading()).toBeVisible();
    });

    await test.step('And the "Forgotten your password?" and "Create an account" links are displayed', async () => {
      await expect(signInPage.forgotPasswordLink()).toHaveAttribute('href', '/forgotten-password');
      await expect(signInPage.registerLink()).toBeVisible();
    });
  });

  test(
    'Entered email address is shown in the Email field',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('When the user enters an email address', async () => {
        await signInPage.emailInput().fill(unregisteredCredentials.email);
      });

      await test.step('Then the entered value is displayed in the Email field', async () => {
        await expect(signInPage.emailInput()).toHaveValue(unregisteredCredentials.email);
      });
    }
  );

  test(
    'Leading and trailing spaces in the email address are removed',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      test.skip(!validCredentials.email || !validCredentials.password, missingCredentialsReason);

      await test.step('When the user signs in with a valid email address surrounded by spaces', async () => {
        await signInPage.login(`  ${validCredentials.email}  `, validCredentials.password);
      });

      await test.step('Then the user is signed in and taken to the home screen', async () => {
        await signInPage.expectUrl(homeScreenUrl);
      });
    }
  );

  test('Password is masked when entered', { tag: ['@ui', '@regression', '@signIn'] }, async ({ signInPage }) => {
    await test.step('When the user enters a password', async () => {
      await signInPage.passwordInput().fill(unregisteredCredentials.password);
    });

    await test.step('Then the password is masked', async () => {
      await expect(signInPage.passwordInput()).toHaveAttribute('type', 'password');
    });
  });

  test('Successful sign in with valid credentials', { tag: ['@ui', '@smoke', '@signIn'] }, async ({ signInPage }) => {
    test.skip(!validCredentials.email || !validCredentials.password, missingCredentialsReason);

    await test.step('When the user enters valid credentials and taps Sign in', async () => {
      await signInPage.login(validCredentials.email, validCredentials.password);
    });

    await test.step('Then the user is taken to the application home screen', async () => {
      await signInPage.expectUrl(homeScreenUrl);
    });
  });

  test(
    'Sign in with invalid credentials shows an error',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('When the user enters incorrect credentials and taps Sign in', async () => {
        await signInPage.login(unregisteredCredentials.email, unregisteredCredentials.password);
      });

      await test.step('Then the user remains on the Sign In screen', async () => {
        await signInPage.expectUrl(signInUrl);
        await expect(signInPage.signInHeading()).toBeVisible();
      });

      await test.step(`And "${messages.invalidCredentials}" is displayed`, async () => {
        await expect(signInPage.errorMessage()).toContainText(messages.invalidCredentials);
      });
    }
  );

  test(
    'Forgotten password link opens the Forgot Password screen',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('When the user taps "Forgotten your password?"', async () => {
        await signInPage.forgotPasswordLink().click();
      });

      await test.step('Then the Forgot Password screen is opened', async () => {
        await signInPage.expectUrl(forgottenPasswordUrl);
      });
    }
  );
});
