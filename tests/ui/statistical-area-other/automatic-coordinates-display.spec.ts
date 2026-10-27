import { expect, test } from '../../../fixtures/commonfixture';
import { NavigationFlow } from '../helpers/navigationFlow';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await NavigationFlow.openStatisticalAreaOther(statisticalAreaOtherPage);
  });

  test.describe('Automatic Coordinates Display', () => {
    test('coordinates appear automatically when a valid area is selected from the dropdown', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);

      await expect(statisticalAreaOtherPage.coordinatesDisplay()).toBeVisible();
      await expect(statisticalAreaOtherPage.coordinatesDisplay()).toHaveText(/\S/);
    });

    test('coordinates update when a different valid area is selected', async ({ statisticalAreaOtherPage }) => {
      const coords = statisticalAreaOtherPage.coordinatesDisplay();
      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await expect(coords).toHaveText(/\S/);
      const firstCoords = (await coords.textContent()) ?? '';

      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_B);
      await expect(coords).not.toHaveText(firstCoords);
    });

    test('coordinates are not displayed before a valid area is selected', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27');
      await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeVisible();
      await expect(statisticalAreaOtherPage.coordinatesDisplay()).toBeHidden();
    });
  });
});
