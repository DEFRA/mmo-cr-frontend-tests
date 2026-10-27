import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Result Display Format', () => {
    test('matching results display the statistical sub area code', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27.4');

      await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toContainText(/\d+\.\d+/);
    });

    test('matching results display associated coordinates alongside the area code', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27.4');

      await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toContainText(
        /\d+\.\d+(\.\w+)?.*\d+/
      );
    });
  });
});
