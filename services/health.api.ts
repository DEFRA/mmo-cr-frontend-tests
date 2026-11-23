/**
 * API client for the service health endpoint.
 *
 * @author Randhir Patel
 * @since 2026-08-27
 */
import { type APIResponse } from '@playwright/test';
import { BaseApi } from './baseApi';

export class HealthApi extends BaseApi {
  checkHealth(): Promise<APIResponse> {
    return this.get('/health');
  }
}
