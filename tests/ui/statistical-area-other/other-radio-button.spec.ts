import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
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
