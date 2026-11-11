import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Type-Ahead Search Field', () => {
    test(
      'type-ahead search field is hidden before selecting Other',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: type-ahead search field is hidden before selecting Other', async () => {
          await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeHidden();
        });
      }
    );

    test(
      'selecting Other reveals the type-ahead search field',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: selecting Other reveals the type-ahead search field', async () => {
          await statisticalAreaOtherPage.selectAreaRadio('Other');

          await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeVisible();
        });
      }
    );

    test(
      'selecting a suggested area radio after Other hides the type-ahead search field',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: selecting a suggested area radio after Other hides the type-ahead search field', async () => {
          await statisticalAreaOtherPage.selectAreaRadio('Other');
          await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeVisible();

          await statisticalAreaOtherPage.suggestedAreaRadios().first().check();
          await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeHidden();
        });
      }
    );
  });
});
