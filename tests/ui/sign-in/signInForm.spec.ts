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
    await test.step('The user is on the Sign In screen', async () => {
      await signInPage.goto('/sign-in');
    });
  });

  test('Sign-in page displays the required controls', { tag: ['@ui', '@smoke', '@signIn'] }, async ({ signInPage }) => {
    await test.step('The application logo is displayed', async () => {
      await expect(signInPage.appLogo()).toBeVisible();
    });

    await test.step('The "Sign in" heading is displayed', async () => {
      await expect(signInPage.signInHeading()).toHaveText('Sign in');
    });

    await test.step('The Email address and Password fields are displayed', async () => {
      await expect(signInPage.emailInput()).toBeVisible();
      await expect(signInPage.passwordInput()).toBeVisible();
    });

    await test.step('The Sign in button is displayed', async () => {
      await expect(signInPage.signInButton()).toBeVisible();
    });

    await test.step('The "Having trouble signing in?" section is displayed', async () => {
      await expect(signInPage.troubleHeading()).toBeVisible();
    });

    await test.step('The "Forgotten your password?" and "Create an account" links are displayed', async () => {
      await expect(signInPage.forgotPasswordLink()).toHaveAttribute('href', '/forgotten-password');
      await expect(signInPage.registerLink()).toBeVisible();
    });
  });

  test(
    'Entered email address is shown in the Email field',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user enters an email address', async () => {
        await signInPage.emailInput().fill(unregisteredCredentials.email);
      });

      await test.step('The entered value is displayed in the Email field', async () => {
        await expect(signInPage.emailInput()).toHaveValue(unregisteredCredentials.email);
      });
    }
  );

  test(
    'Leading and trailing spaces in the email address are removed',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      test.skip(!validCredentials.email || !validCredentials.password, missingCredentialsReason);

      await test.step('The user signs in with a valid email address surrounded by spaces', async () => {
        await signInPage.login(`  ${validCredentials.email}  `, validCredentials.password);
      });

      await test.step('The user is signed in and taken to the home screen', async () => {
        await signInPage.expectUrl(homeScreenUrl);
      });
    }
  );

  test('Password is masked when entered', { tag: ['@ui', '@regression', '@signIn'] }, async ({ signInPage }) => {
    await test.step('The user enters a password', async () => {
      await signInPage.passwordInput().fill(unregisteredCredentials.password);
    });

    await test.step('The password is masked', async () => {
      await expect(signInPage.passwordInput()).toHaveAttribute('type', 'password');
    });
  });

  test(
    'Opens the records page when sign-in credentials are valid',
    { tag: ['@ui', '@smoke', '@signIn'] },
    async ({ signInPage }) => {
      test.skip(!validCredentials.email || !validCredentials.password, missingCredentialsReason);

      await test.step('The user enters valid credentials and taps Sign in', async () => {
        await signInPage.login(validCredentials.email, validCredentials.password);
      });

      await test.step('The user is taken to the application home screen', async () => {
        await signInPage.expectUrl(homeScreenUrl);
      });
    }
  );

  test(
    'Displays an error when sign-in credentials are invalid',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user enters incorrect credentials and taps Sign in', async () => {
        await signInPage.login(unregisteredCredentials.email, unregisteredCredentials.password);
      });

      await test.step('The user remains on the Sign In screen', async () => {
        await signInPage.expectUrl(signInUrl);
        await expect(signInPage.signInHeading()).toBeVisible();
      });

      await test.step(`"${messages.invalidCredentials}" is displayed`, async () => {
        await expect(signInPage.errorMessage()).toContainText(messages.invalidCredentials);
      });
    }
  );

  test(
    'Forgotten password link opens the Forgot Password screen',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The user taps "Forgotten your password?"', async () => {
        await signInPage.forgotPasswordLink().click();
      });

      await test.step('The Forgot Password screen is opened', async () => {
        await signInPage.expectUrl(forgottenPasswordUrl);
      });
    }
  );
});
