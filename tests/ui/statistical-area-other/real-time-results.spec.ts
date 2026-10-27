import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Real-Time Results', () => {
    test('matching results appear in real time without requiring a submit action', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');

      await statisticalAreaOtherPage.alternativeAreaInput().pressSequentially('27', { delay: 100 });

      await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toBeVisible();
    });

    test('results update dynamically as the search term changes', async ({ statisticalAreaOtherPage }) => {
      const firstItem = statisticalAreaOtherPage.alternativeAreaResultItems().first();
      await statisticalAreaOtherPage.typeInAlternativeArea('27.4');
      await expect(firstItem).toContainText('27.4');

      await statisticalAreaOtherPage.alternativeAreaInput().fill('27.7');
      await expect(firstItem).toContainText('27.7');
    });
  });
});
