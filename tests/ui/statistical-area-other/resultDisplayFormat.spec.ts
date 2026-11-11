import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Statistical Sub Area – Other Selection', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.openStatisticalAreaOther();
  });

  test.describe('Result Display Format', () => {
    test(
      'matching results display the statistical sub area code',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: matching results display the statistical sub area code', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('27E');

          await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toContainText(/\d+\.\d+/);
        });
      }
    );

    test(
      'matching results display associated coordinates alongside the area code',
      { tag: ['@ui', '@regression', '@statiscaAreaManualEntry'] },
      async ({ statisticalAreaOtherPage }) => {
        await test.step('Scenario: matching results display associated coordinates alongside the area code', async () => {
          await statisticalAreaOtherPage.typeInAlternativeArea('27D');

          await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toContainText(
            /\d+\.\d+(\.\w+)?.*\d+/
          );
        });
      }
    );
  });
});
