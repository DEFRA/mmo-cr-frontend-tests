import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const accountPath = '/account';

test.describe('Favourites', () => {
  test.beforeEach(async ({ signInPage, accountPage }) => {
    await NavigationFlow.signInAndOpenAccount(signInPage, accountPage);
  });

  test.describe('Welsh language', () => {
    test('account favourites page is translated when Cymraeg is selected', async ({ page, accountPage }) => {
      test.fail(true, 'Known gap: Cymraeg link does not translate content');
      await accountPage.common.languageCymraeg().click();

      await expect(page).toHaveURL(/lang=cy/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'cy', { timeout: 5000 });
      await expect(accountPage.pageHeading()).not.toHaveText('Your account');
    });
  });
});
