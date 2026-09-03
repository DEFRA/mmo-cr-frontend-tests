import { expect, test } from '../../fixtures/commonfixture';

test.describe('Home', () => {
  test('home page displays the required controls', async ({ homePage }) => {
    await homePage.goto('/');

    await expect(homePage.header.govukHeader()).toBeVisible();
    await expect(homePage.startNowButton()).toBeVisible();
    await expect(homePage.startNowButton()).toHaveAttribute('href', '/sign-in');

    await expect(homePage.guidanceHeadings.whatWeNeedFromYouHeading()).toBeVisible();
    await expect(homePage.guidanceHeadings.whenToCreateYourRecordHeading()).toBeVisible();
    await expect(homePage.guidanceHeadings.specialCasesHeading()).toBeVisible();
    await expect(homePage.guidanceHeadings.howToCreateARecordHeading()).toBeVisible();
    await expect(homePage.guidanceHeadings.getHelpWithYourRecordHeading()).toBeVisible();

    await expect(homePage.guidanceContents.whatWeNeedFromYouLink()).toBeVisible();
    await expect(homePage.guidanceContents.whenToCreateYourRecordLink()).toBeVisible();
    await expect(homePage.guidanceContents.specialCasesLink()).toBeVisible();
    await expect(homePage.guidanceContents.howToCreateARecordLink()).toBeVisible();
    await expect(homePage.guidanceContents.getHelpLink()).toBeVisible();

    await expect(homePage.footer.footerMeta()).toBeVisible();
  });

  const guidanceSections = [
    { link: 'whatWeNeedFromYouLink', heading: 'whatWeNeedFromYouHeading', hash: '#what-we-need-from-you' },
    {
      link: 'whenToCreateYourRecordLink',
      heading: 'whenToCreateYourRecordHeading',
      hash: '#when-to-create-your-record',
    },
    { link: 'specialCasesLink', heading: 'specialCasesHeading', hash: '#special-cases-ices-areas' },
    { link: 'howToCreateARecordLink', heading: 'howToCreateARecordHeading', hash: '#how-to-create-a-record' },
    { link: 'getHelpLink', heading: 'getHelpWithYourRecordHeading', hash: '#get-help-with-your-record' },
  ] as const;

  guidanceSections.forEach(({ link, heading, hash }) => {
    test(`clicking the ${link} scrolls to the matching section`, async ({ page, homePage }) => {
      await homePage.goto('/');

      await homePage.guidanceContents[link]().click();
      await page.waitForTimeout(500);

      await expect(page).toHaveURL(new RegExp(`\\${hash}$`));
      await expect(homePage.guidanceHeadings[heading]()).toBeInViewport();
      await page.waitForTimeout(500);
    });
  });

  test('clicking start now navigates to the sign-in page', async ({ page, homePage }) => {
    await homePage.goto('/');

    await homePage.startNowButton().click();

    await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);
  });
});
