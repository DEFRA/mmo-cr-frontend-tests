import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount();
  });

  test.describe('Welsh language', () => {
    test('account favourites page is translated when Cymraeg is selected', async ({ accountPage }) => {
      test.fail(true, 'Known gap: Cymraeg link does not translate content');
      await accountPage.common.languageCymraeg().click();

      await accountPage.expectUrl(/lang=cy/);
      await expect(accountPage.htmlRoot()).toHaveAttribute('lang', 'cy', { timeout: 5000 });
      await expect(accountPage.pageHeading()).not.toHaveText('Your account');
    });
  });
});
