/**
 * Expandable "Create an account" information panel beneath the Sign In form:
 * default state, expand, collapse and persistence while scrolling.
 * @author Randhir Patel
 * @since 2026-11-13
 */
import { expect, test } from '../../../fixtures/commonfixture';

const createAccountGuidance = {
  vesselOwnerHeading: /Vessel owner/i,
  vesselOwnerText: 'You will receive an email invitation to register when your vessel is added to the system.',
  skipperOrAgentHeading: /Skipper or agent/i,
  skipperOrAgentText: 'Ask your vessel owner to add you. They can do this from their account.'
} as const;

test.describe('Create an account information panel', () => {
  test.beforeEach(async ({ signInPage }) => {
    await test.step('Given the user is on the Sign In screen', async () => {
      await signInPage.goto('/sign-in');
    });
  });

  test(
    'Create an account information is expanded on page load',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('Then the Create an account panel is expanded', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeVisible();
      });
    }
  );

  test('Expand create account information', { tag: ['@ui', '@regression', '@signIn'] }, async ({ signInPage }) => {
    await test.step('Given the Create an account information is collapsed', async () => {
      await signInPage.registerLink().click();
      await expect(signInPage.registrationDetails()).not.toHaveAttribute('open');
      await expect(signInPage.registrationGuidance()).toBeHidden();
    });

    await test.step('When the user taps "Create an account"', async () => {
      await signInPage.registerLink().click();
    });

    await test.step('Then the panel expands and the icon changes to the expanded state', async () => {
      await expect(signInPage.registrationDetails()).toHaveAttribute('open');
      await expect(signInPage.registrationGuidance()).toBeVisible();
    });

    await test.step('And the Vessel Owner guidance is displayed', async () => {
      await expect(signInPage.registrationGuidance()).toContainText(createAccountGuidance.vesselOwnerHeading);
      await expect(signInPage.registrationGuidance()).toContainText(createAccountGuidance.vesselOwnerText);
    });

    await test.step('And the Skipper or Agent guidance is displayed', async () => {
      await expect(signInPage.registrationGuidance()).toContainText(createAccountGuidance.skipperOrAgentHeading);
      await expect(signInPage.registrationGuidance()).toContainText(createAccountGuidance.skipperOrAgentText);
    });
  });

  test('Collapse create account information', { tag: ['@ui', '@regression', '@signIn'] }, async ({ signInPage }) => {
    await test.step('Given the Create an account information panel is expanded', async () => {
      await expect(signInPage.registrationDetails()).toHaveAttribute('open');
    });

    await test.step('When the user taps "Create an account"', async () => {
      await signInPage.registerLink().click();
    });

    await test.step('Then the panel collapses, the text is hidden and the icon returns to collapsed', async () => {
      await expect(signInPage.registrationDetails()).not.toHaveAttribute('open');
      await expect(signInPage.registrationGuidance()).toBeHidden();
    });
  });

  test(
    'Expanded information persists when scrolling',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('Given the Create an account information panel is expanded', async () => {
        await signInPage.registerLink().click();
        await signInPage.registerLink().click();
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
      });

      await test.step('When the user scrolls within the page', async () => {
        await signInPage.footer.footerMeta().scrollIntoViewIfNeeded();
        await signInPage.registerLink().scrollIntoViewIfNeeded();
      });

      await test.step('Then the panel remains expanded', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeVisible();
      });
    }
  );
});
