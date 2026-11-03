import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
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
      await statisticalAreaOtherPage.typeInAlternativeArea('27');
      await expect(firstItem).toContainText('27');

      await statisticalAreaOtherPage.alternativeAreaInput().fill('27E');
      await expect(firstItem).toContainText('27E');
    });
  });
});
