import { expect, test } from '../../../fixtures/commonfixture';

const AREA_A = '27E06';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
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
