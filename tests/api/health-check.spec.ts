import { expect, test } from '../../fixtures/commonfixture';

test.describe('API health check', () => {
  test('service reports healthy status', async ({ healthApi }) => {
    const response = await healthApi.checkHealth();

    expect(response.ok()).toBeTruthy();
  });
});
