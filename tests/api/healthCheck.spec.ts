import { expect, test } from '../../fixtures/commonfixture';

test.describe('API health check', () => {
  test('service reports healthy status', { tag: ['@api', '@smoke', '@apiHealth'] }, async ({ healthApi }) => {
    await test.step('Scenario: service reports healthy status', async () => {
      const response = await healthApi.checkHealth();

      if (!response.ok()) {
        console.error(`Health check failed with status ${response.status()}: ${await response.text()}`);
      }

      expect(response.ok()).toBeTruthy();
    });
  });
});
