/**
 * Base class for API clients, wrapping the Playwright request context.
 *
 * @author Randhir Patel
 * @since 2026-08-27
 */
import { test, type APIRequestContext, type APIResponse } from '@playwright/test';

export abstract class BaseApi {
  constructor(protected readonly request: APIRequestContext) {}

  private isInsideTest(): boolean {
    try {
      test.info();
      return true;
    } catch {
      return false;
    }
  }

  private async send(method: string, url: string, execute: () => Promise<APIResponse>): Promise<APIResponse> {
    if (!this.isInsideTest()) {
      return execute();
    }

    return test.step(`${method} ${url}`, async () => {
      const response = await execute();
      await test.step(`Response: ${response.status()} ${response.statusText()}`, () => {});
      return response;
    });
  }

  protected get(url: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    return this.send('GET', url, () => this.request.get(url, options));
  }

  protected post(url: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<APIResponse> {
    return this.send('POST', url, () => this.request.post(url, options));
  }

  protected put(url: string, options?: Parameters<APIRequestContext['put']>[1]): Promise<APIResponse> {
    return this.send('PUT', url, () => this.request.put(url, options));
  }

  protected delete(url: string, options?: Parameters<APIRequestContext['delete']>[1]): Promise<APIResponse> {
    return this.send('DELETE', url, () => this.request.delete(url, options));
  }
}
