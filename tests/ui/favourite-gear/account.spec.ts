import { expect, test } from '../../../fixtures/commonfixture';

test.describe('Favourite Gear Management (Account Page)', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccountFromRecords({
      email: process.env.CATCH_RECORDING_EMAIL ?? 'test@example.com',
      password: process.env.CATCH_RECORDING_PASSWORD ?? 'password'
    });
  });

  test('Verify Favourite Gear List is Displayed', async ({ accountPage }) => {
    await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
    await expect(accountPage.gearOnboardValue()).toBeVisible();
  });

  test('Verify Remove Option is Available for Favourite Gear', async ({ accountPage }) => {
    await expect(accountPage.removeGearLink()).toBeVisible();
  });
});
