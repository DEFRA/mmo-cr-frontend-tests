/**
 * Expandable "Create an account" information panel beneath the Sign In form:
 * default state, expand, collapse and persistence while scrolling.
 * @author Randhir Patel
 * @since 2026-11-13
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { signInData } from '../../../test-data/testData';

test.describe('Create an account information panel', () => {
  test.beforeEach(async ({ signInPage }) => {
    await test.step('The user is on the Sign In screen', async () => {
      await signInPage.goto('/sign-in');
    });
  });

  test(
    'Displays the expanded account information panel on page load',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The Create an account panel is expanded', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeVisible();
      });
    }
  );

  test(
    'Expands the account information panel when its collapsed heading is selected',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The Create an account information is collapsed', async () => {
        await signInPage.registerLink().click();
        await expect(signInPage.registrationDetails()).not.toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeHidden();
      });

      await test.step('The user taps "Create an account"', async () => {
        await signInPage.registerLink().click();
      });

      await test.step('The panel expands and the icon changes to the expanded state', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeVisible();
      });

      await test.step('The Vessel Owner guidance is displayed', async () => {
        await expect(signInPage.registrationGuidance()).toContainText(
          new RegExp(signInData.createAccountGuidance.vesselOwnerHeading, 'i')
        );
        await expect(signInPage.registrationGuidance()).toContainText(signInData.createAccountGuidance.vesselOwnerText);
      });

      await test.step('The Skipper or Agent guidance is displayed', async () => {
        await expect(signInPage.registrationGuidance()).toContainText(
          new RegExp(signInData.createAccountGuidance.skipperOrAgentHeading, 'i')
        );
        await expect(signInPage.registrationGuidance()).toContainText(
          signInData.createAccountGuidance.skipperOrAgentText
        );
      });
    }
  );

  test(
    'Collapses the account information panel when its expanded heading is selected',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The Create an account information panel is expanded', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
      });

      await test.step('The user taps "Create an account"', async () => {
        await signInPage.registerLink().click();
      });

      await test.step('The panel collapses, the text is hidden and the icon returns to collapsed', async () => {
        await expect(signInPage.registrationDetails()).not.toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeHidden();
      });
    }
  );

  test(
    'Keeps the account information panel expanded when scrolling',
    { tag: ['@ui', '@regression', '@signIn'] },
    async ({ signInPage }) => {
      await test.step('The Create an account information panel is expanded', async () => {
        await signInPage.registerLink().click();
        await signInPage.registerLink().click();
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
      });

      await test.step('The user scrolls within the page', async () => {
        await signInPage.footer.footerMeta().scrollIntoViewIfNeeded();
        await signInPage.registerLink().scrollIntoViewIfNeeded();
      });

      await test.step('The panel remains expanded', async () => {
        await expect(signInPage.registrationDetails()).toHaveAttribute('open');
        await expect(signInPage.registrationGuidance()).toBeVisible();
      });
    }
  );
});
