/**
 * Shared settings for API request contexts: the bearer token header and a context factory used by the
 * `api` project config, the reference data fixture and the reference data global setup.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */
import { type APIRequest, type APIRequestContext } from '@playwright/test';

export const apiAuthHeaders = (): Record<string, string> => {
  const apiToken = process.env.CATCH_RECORDING_API_TOKEN;
  return apiToken ? { Authorization: `Bearer ${apiToken}` } : {};
};

export const createApiContext = (requestFactory: APIRequest, baseURL: string): Promise<APIRequestContext> =>
  requestFactory.newContext({ baseURL, ignoreHTTPSErrors: true, extraHTTPHeaders: apiAuthHeaders() });
