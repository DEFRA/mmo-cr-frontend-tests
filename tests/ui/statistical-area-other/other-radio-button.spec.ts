import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Other Radio Button', () => {
    test('Other radio button is displayed beneath the suggested statistical sub area list', async ({
      statisticalAreaOtherPage
    }) => {
      await expect(statisticalAreaOtherPage.otherRadio()).toBeVisible();
    });

    test('Other radio button is not pre-selected by default', async ({ statisticalAreaOtherPage }) => {
      await expect(statisticalAreaOtherPage.otherRadio()).not.toBeChecked();
    });
  });
});
