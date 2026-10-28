import { expect, test } from '../../../fixtures/commonfixture';

const AREA_A = '46D86';
const AREA_B = '27D86';
const COORDINATES_PATTERN = /[-\u2212]?\d+\.\d+,\s*[-\u2212]?\d+\.\d+/;

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Automatic Coordinates Display', () => {
    test('coordinates appear alongside a matching dropdown result before selection', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea(AREA_A.slice(0, 2));

      const coords = statisticalAreaOtherPage.coordinatesDisplay(AREA_A);
      await expect(coords).toBeVisible();
      await expect(coords).toContainText(COORDINATES_PATTERN);
    });

    test('coordinates update for matching results when the search changes', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea(AREA_A.slice(0, 2));
      const firstResult = statisticalAreaOtherPage.coordinatesDisplay(AREA_A);
      await expect(firstResult).toBeVisible();
      await expect(firstResult).toContainText(COORDINATES_PATTERN);
      const firstCoords = (await firstResult.innerText()).match(COORDINATES_PATTERN)?.[0];

      await statisticalAreaOtherPage.alternativeAreaInput().fill(AREA_B.slice(0, 2));
      const secondResult = statisticalAreaOtherPage.coordinatesDisplay(AREA_B);
      await expect(secondResult).toBeVisible();
      await expect(secondResult).toContainText(COORDINATES_PATTERN);
      const secondCoords = (await secondResult.innerText()).match(COORDINATES_PATTERN)?.[0];
      expect(secondCoords).not.toEqual(firstCoords);
      await expect(firstResult).toBeHidden();
    });

    test('coordinates are not displayed before searching', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeEmpty();
      await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeHidden();
      await expect(statisticalAreaOtherPage.coordinatesDisplay(AREA_A)).toBeHidden();
    });
  });
});
