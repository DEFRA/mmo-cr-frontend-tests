import { expect, test } from '../../../fixtures/commonfixture';

const AREA_A = '46D86';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Invalid Area Validation', () => {
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
