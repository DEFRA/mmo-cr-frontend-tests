import { expect, test } from '../../fixtures/commonfixture';

test.describe('Copilot Dashboard', () => {
  test('validates page title and container', async ({ page, baseURL }) => {
    console.log(`Navigating to baseURL: ${baseURL}`);
    await page.goto('/');

    // Validate page title
    await expect(page).toHaveTitle(/Copilot analytics/i);

    // Validate main dashboard container
    await expect(page.locator('#root')).toBeVisible();
  });
});
