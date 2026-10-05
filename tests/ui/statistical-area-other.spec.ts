import { expect, test } from '../../fixtures/commonfixture';

const AREA_A = '27.4.b';
const AREA_B = '27.7.a';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ statisticalAreaOtherPage }) => {
    await statisticalAreaOtherPage.goto('/statistical-area-other');
  });

  test.describe('FR1 – Other Radio Button', () => {
    test('Other radio button is displayed beneath the suggested statistical sub area list', async ({
      statisticalAreaOtherPage
    }) => {
      await expect(statisticalAreaOtherPage.otherRadio()).toBeVisible();
    });

    test('Other radio button is not pre-selected by default', async ({ statisticalAreaOtherPage }) => {
      await expect(statisticalAreaOtherPage.otherRadio()).not.toBeChecked();
    });
  });

  test.describe('FR2 – Type-Ahead Search Field', () => {
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

  test.describe('FR3 – Type-Ahead Search Behaviour', () => {
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

  test.describe('FR4 – Real-Time Results', () => {
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

  test.describe('FR5 – Result Display Format', () => {
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

  test.describe('FR6 – Automatic Coordinates Display', () => {
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

  test.describe('FR7 – Data Storage', () => {
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

      await statisticalAreaOtherPage.goto('/statistical-area-other');
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

  test.describe('FR8 – Invalid Area Validation', () => {
    test('submitting with Other selected but no area entered shows a validation error', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
      await expect(statisticalAreaOtherPage.fieldErrorMessage()).toBeVisible();
    });

    test('entering a completely invalid area code shows a validation error', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('ZZZZZ');
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
    });

    test('entering a partial area code without selecting from the dropdown shows a validation error', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('27.4');
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
    });

    test('entering special characters as an area code shows a validation error', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('!@#$%');
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
    });

    test('error summary links focus the alternative area input field', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummaryLinks().first()).toBeVisible();
      await statisticalAreaOtherPage.errorSummaryLinks().first().click();
      await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeFocused();
    });

    test('no results message is shown when a non-existent area code is searched', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.typeInAlternativeArea('99.99.z');

      await expect(statisticalAreaOtherPage.noResultsMessage()).toBeVisible();
    });

    test('validation error is cleared after selecting a valid area', async ({ statisticalAreaOtherPage }) => {
      await statisticalAreaOtherPage.selectAreaRadio('Other');
      await statisticalAreaOtherPage.clickSaveAndContinue();
      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();

      await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
      await statisticalAreaOtherPage.clickSaveAndContinue();
      await expect(statisticalAreaOtherPage.errorSummary()).toBeHidden();
    });

    test('submitting without selecting any radio button shows a validation error', async ({
      statisticalAreaOtherPage
    }) => {
      await statisticalAreaOtherPage.clickSaveAndContinue();

      await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
    });
  });
});
