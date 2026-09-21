import { expect, test } from '../../fixtures/commonfixture';

test.describe('Dashboard & Health check', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Validate page title and root container
    await expect(page).toHaveTitle(/Copilot analytics/i);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('health endpoint responds with success', async ({ healthApi }) => {
    const response = await healthApi.checkHealth();
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toEqual({ message: 'success' });
  });
});
