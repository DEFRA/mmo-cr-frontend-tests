import { expect, test } from '../../../fixtures/commonfixture';

const AREA_A = '46D86';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Data Storage', () => {
    test('selected statistical sub area is stored and visible on the check answers page', async ({
      statisticalAreaOtherPage,
      checkAnswersPage
    }) => {
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await checkAnswersPage.goto('/check-answers');
      expect(await checkAnswersPage.getSummaryValueText('Statistical sub area')).toContain(AREA_A);
    });

    test('selected area persists after save and continue', async ({ navigationFlow, statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await navigationFlow.openStatisticalAreaOther();
      await expect(statisticalAreaOtherPage.otherRadio()).toBeChecked();
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toHaveValue(
        new RegExp(AREA_A.replace(/\./g, '\\.'))
      );
    });

    test('selecting a valid area via Other and saving allows continuation to the next page', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.page).not.toHaveURL(/\/statistical-area-other/);
    });
  });
});
