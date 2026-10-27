import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
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

    test('selected area and coordinates persist after save and continue', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
      await expect(statisticalAreaOtherPage.otherRadio()).toBeChecked();
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toHaveValue(
        new RegExp(AREA_A.replace(/\./g, '\\.'))
      );
      await expect(statisticalAreaOtherPage.coordinatesDisplay()).toHaveText(/\S/);
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
