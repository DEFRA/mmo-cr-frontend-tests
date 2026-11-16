import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords();
  });

  test(
    'Verify Favourite Gear List is Displayed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage }) => {
      await test.step('Scenario: Verify Favourite Gear List is Displayed', async () => {
        await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
        await expect(accountPage.gearOnboardValue()).toBeVisible();
      });
    }
  );

  test(
    'Verify Remove Option is Available for Favourite Gear',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage }) => {
      await test.step('Scenario: Verify Remove Option is Available for Favourite Gear', async () => {
        await expect(accountPage.removeGearLink()).toBeVisible();
      });
    }
  );
});
