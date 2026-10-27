import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Type-Ahead Search Field', () => {
    test('type-ahead search field is hidden before selecting Other', async ({ statisticalAreaOtherPage }) => {
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeHidden();
    });

    test('selecting Other reveals the type-ahead search field', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');

      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeVisible();
    });

    test('selecting a suggested area radio after Other hides the type-ahead search field', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeVisible();

      await statisticalAreaOtherPage.selectAreaRadio(AREA_A);
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeHidden();
    });
  });
});
