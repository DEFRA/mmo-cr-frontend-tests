import { expect, test } from '../../../fixtures/commonfixture';

const AREA_A = '46D86';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Invalid Area Validation', () => {
    test(
      'submitting with Other selected but no area entered shows a validation error',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: submitting with Other selected but no area entered shows a validation error', async () => {
          await statisticalAreaOtherPage.selectAreaRadio('Other');
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
          await expect(statisticalAreaOtherPage.fieldErrorMessage()).toBeVisible();
        });
      }
    );

    test(
      'entering a completely invalid area code shows a validation error',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: entering a completely invalid area code shows a validation error', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('ZZZZZ');
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'entering a partial area code without selecting from the dropdown shows a validation error',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: entering a partial area code without selecting from the dropdown shows a validation error', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('27.4');
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'entering special characters as an area code shows a validation error',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: entering special characters as an area code shows a validation error', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('!@#$%');
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
        });
      }
    );

    test(
      'error summary links focus the alternative area input field',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: error summary links focus the alternative area input field', async () => {
          await statisticalAreaOtherPage.selectAreaRadio('Other');
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummaryLinks().first()).toBeVisible();
          await statisticalAreaOtherPage.errorSummaryLinks().first().click();
          await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeFocused();
        });
      }
    );

    test(
      'no suggestions are shown when a non-existent area code is searched',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: no suggestions are shown when a non-existent area code is searched', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('99.99.z');

          await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeHidden();
          await expect(statisticalAreaOtherPage.alternativeAreaResultItems()).toHaveCount(0);
        });
      }
    );

    test(
      'validation error is cleared after selecting a valid area',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: validation error is cleared after selecting a valid area', async () => {
          await statisticalAreaOtherPage.selectAreaRadio('Other');
          await statisticalAreaOtherPage.clickSaveAndContinue();
          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();

          await statisticalAreaOtherPage.searchAndSelectAlternativeArea(AREA_A);
          await statisticalAreaOtherPage.clickSaveAndContinue();
          await expect(statisticalAreaOtherPage.errorSummary()).toBeHidden();
        });
      }
    );

    test(
      'submitting without selecting any radio button shows a validation error',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: submitting without selecting any radio button shows a validation error', async () => {
          await statisticalAreaOtherPage.clickSaveAndContinue();

          await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
        });
      }
    );
  });
});
