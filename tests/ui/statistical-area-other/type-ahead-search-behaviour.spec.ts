import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Type-Ahead Search Behaviour', () => {
    test('typing in the search field triggers a search against statistical sub area reference data', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27');

      await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toBeVisible();
    });

    test('search results narrow as the user types more characters', async ({ statisticalAreaOtherPage }) => {
      const items = statisticalAreaOtherPage.alternativeAreaResultItems();
      await statisticalAreaOtherPage.typeInAlternativeArea('27');
      await expect(items.first()).toBeVisible();
      const broadCount = await items.count();

      await statisticalAreaOtherPage.alternativeAreaInput().fill(AREA_A);
      await expect.poll(() => items.count()).toBeLessThan(broadCount);
      await expect(items.first()).toContainText(AREA_A);
    });

    test('clearing the search field hides the results list', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27');
      await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeVisible();

      await statisticalAreaOtherPage.alternativeAreaInput().clear();
      await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeHidden();
    });
  });
});
