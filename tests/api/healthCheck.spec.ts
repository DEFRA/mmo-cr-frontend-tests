/**
 * Check API health.
 * Verify the service reports a healthy status when available.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../fixtures/commonfixture';

test.describe('API health check', () => {
  test(
    'Reports a healthy status when the service is available',
    { tag: ['@api', '@smoke', '@apiHealth'] },
    async ({ healthApi }) => {
      await test.step('Service reports healthy status', async () => {
        const response = await healthApi.checkHealth();

        if (!response.ok()) {
          console.error(`Health check failed with status ${response.status()}: ${await response.text()}`);
        }

        expect(response.ok(), 'Ok to be truthy').toBeTruthy();
      });
    }
  );
});
