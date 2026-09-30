import { type APIResponse } from '@playwright/test';
import { BaseApi } from './baseApi';

export class HealthApi extends BaseApi {
  checkHealth(): Promise<APIResponse> {
    return this.get('/health');
  }
}
