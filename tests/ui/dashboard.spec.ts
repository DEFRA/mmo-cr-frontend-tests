import { expect, test } from '../../fixtures/commonfixture';

test.describe('Copilot Dashboard', () => {
  test('dashboard loads successfully and displays title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Copilot analytics/i);
    await expect(page.locator('#root')).toBeVisible();
  });
});
