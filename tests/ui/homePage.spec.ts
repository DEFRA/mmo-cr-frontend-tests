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

        await expect(homePage.pageTitle(), 'Page title to be visible').toBeVisible();
        await expect(homePage.pageTitle(), 'Page title to have text How to record your catch').toHaveText(
          'How to record your catch'
        );
        await expect(homePage.pageCaption(), 'Page caption to have text Guidance').toHaveText('Guidance');

        await expect(homePage.phaseBanner(), 'Phase banner to be visible').toBeVisible();
        await expect(homePage.warningText(), 'Warning text to be visible').toBeVisible();
        await expect(
          homePage.warningText(),
          'Warning text to contain text You need to create a catch record within 24 hours of landing your catch.'
        ).toContainText('You need to create a catch record within 24 hours of landing your catch.');

        await expect(homePage.languageSwitcher.container(), 'Container to be visible').toBeVisible();
        await expect(homePage.languageSwitcher.english(), 'English to be visible').toBeVisible();
        await expect(homePage.languageSwitcher.welsh(), 'Welsh to be visible').toBeVisible();

        await expect(
          homePage.guidanceContents.whatWeNeedFromYouLink(),
          'What we need from you link to be visible'
        ).toBeVisible();
        await expect(
          homePage.guidanceContents.whenToCreateYourRecordLink(),
          'When to create your record link to be visible'
        ).toBeVisible();
        await expect(homePage.guidanceContents.specialCasesLink(), 'Special cases link to be visible').toBeVisible();
        await expect(
          homePage.guidanceContents.howToCreateARecordLink(),
          'How to create arecord link to be visible'
        ).toBeVisible();
        await expect(homePage.guidanceContents.getHelpLink(), 'Get help link to be visible').toBeVisible();

        await expect(
          homePage.guidanceHeadings.whatWeNeedFromYouHeading(),
          'What we need from you heading to be visible'
        ).toBeVisible();
        await expect(
          homePage.guidanceHeadings.whenToCreateYourRecordHeading(),
          'When to create your record heading to be visible'
        ).toBeVisible();
        await expect(
          homePage.guidanceHeadings.specialCasesHeading(),
          'Special cases heading to be visible'
        ).toBeVisible();
        await expect(
          homePage.guidanceHeadings.howToCreateARecordHeading(),
          'How to create arecord heading to be visible'
        ).toBeVisible();
        await expect(
          homePage.guidanceHeadings.getHelpWithYourRecordHeading(),
          'Get help with your record heading to be visible'
        ).toBeVisible();

        await expect(homePage.startNowButton(), 'Start now button to be visible').toBeVisible();
        await expect(homePage.startNowButton(), 'Start now button to have attribute').toHaveAttribute(
          'href',
          '/sign-in'
        );

        await expect(homePage.privacyPolicyLink(), 'Privacy policy link to be visible').toBeVisible();
        await expect(homePage.privacyPolicyLink(), 'Privacy policy link to have attribute').toHaveAttribute(
          'href',
          '/privacy-notice'
        );
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
          await expect(homePage.page, 'Page to have url').toHaveURL(new RegExp(`.*${testCase.hash}$`));
          await expect(testCase.heading, 'Heading to be in viewport').toBeInViewport();
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
        await expect(homePage.page, 'Page to have url').toHaveURL(/.*\/sign-in/);
      });
    }
  );
});
