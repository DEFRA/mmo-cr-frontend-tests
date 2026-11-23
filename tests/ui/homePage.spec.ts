/**
 * Display the home page.
 * Verify the home page provides the required guidance, controls, language options and links.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../fixtures/commonfixture';

test.describe('Home page', () => {
  test(
    'Displays the required controls and guidance on the home page',
    { tag: ['@ui', '@smoke', '@homePage'] },
    async ({ homePage }) => {
      await test.step('Displays the required controls and content', async () => {
        await homePage.goto('/');

        await expect(homePage.pageTitle()).toBeVisible();
        await expect(homePage.pageTitle()).toHaveText('How to record your catch');
        await expect(homePage.pageCaption()).toHaveText('Guidance');

        await expect(homePage.phaseBanner()).toBeVisible();
        await expect(homePage.warningText()).toBeVisible();
        await expect(homePage.warningText()).toContainText(
          'You need to create a catch record within 24 hours of landing your catch.'
        );

        await expect(homePage.languageSwitcher.container()).toBeVisible();
        await expect(homePage.languageSwitcher.english()).toBeVisible();
        await expect(homePage.languageSwitcher.welsh()).toBeVisible();

        await expect(homePage.guidanceContents.whatWeNeedFromYouLink()).toBeVisible();
        await expect(homePage.guidanceContents.whenToCreateYourRecordLink()).toBeVisible();
        await expect(homePage.guidanceContents.specialCasesLink()).toBeVisible();
        await expect(homePage.guidanceContents.howToCreateARecordLink()).toBeVisible();
        await expect(homePage.guidanceContents.getHelpLink()).toBeVisible();

        await expect(homePage.guidanceHeadings.whatWeNeedFromYouHeading()).toBeVisible();
        await expect(homePage.guidanceHeadings.whenToCreateYourRecordHeading()).toBeVisible();
        await expect(homePage.guidanceHeadings.specialCasesHeading()).toBeVisible();
        await expect(homePage.guidanceHeadings.howToCreateARecordHeading()).toBeVisible();
        await expect(homePage.guidanceHeadings.getHelpWithYourRecordHeading()).toBeVisible();

        await expect(homePage.startNowButton()).toBeVisible();
        await expect(homePage.startNowButton()).toHaveAttribute('href', '/sign-in');

        await expect(homePage.privacyPolicyLink()).toBeVisible();
        await expect(homePage.privacyPolicyLink()).toHaveAttribute('href', '/privacy-notice');
      });
    }
  );

  test(
    'Navigates to the corresponding section when a guidance link is selected',
    { tag: ['@ui', '@regression', '@homePage'] },
    async ({ homePage }) => {
      await test.step('Guidance links navigate to the corresponding section', async () => {
        await homePage.goto('/');

        const testCases = [
          {
            link: homePage.guidanceContents.whatWeNeedFromYouLink(),
            heading: homePage.guidanceHeadings.whatWeNeedFromYouHeading(),
            hash: '#what-we-need-from-you'
          },
          {
            link: homePage.guidanceContents.whenToCreateYourRecordLink(),
            heading: homePage.guidanceHeadings.whenToCreateYourRecordHeading(),
            hash: '#when-to-create-your-record'
          },
          {
            link: homePage.guidanceContents.specialCasesLink(),
            heading: homePage.guidanceHeadings.specialCasesHeading(),
            hash: '#special-cases-ices-areas'
          },
          {
            link: homePage.guidanceContents.howToCreateARecordLink(),
            heading: homePage.guidanceHeadings.howToCreateARecordHeading(),
            hash: '#how-to-create-a-record'
          },
          {
            link: homePage.guidanceContents.getHelpLink(),
            heading: homePage.guidanceHeadings.getHelpWithYourRecordHeading(),
            hash: '#get-help-with-your-record'
          }
        ];

        for (const testCase of testCases) {
          await testCase.link.click();
          await expect(homePage.page).toHaveURL(new RegExp(`.*${testCase.hash}$`));
          await expect(testCase.heading).toBeInViewport();
        }
      });
    }
  );

  test(
    'Opens the sign-in page when Start now is selected',
    { tag: ['@ui', '@smoke', '@homePage'] },
    async ({ homePage }) => {
      await test.step('Clicking Start now button navigates to sign-in page', async () => {
        await homePage.goto('/');
        await homePage.startNowButton().click();
        await expect(homePage.page).toHaveURL(/.*\/sign-in/);
      });
    }
  );
});
