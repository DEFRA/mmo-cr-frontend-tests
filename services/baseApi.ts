import { type APIRequestContext, type APIResponse } from '@playwright/test';

export abstract class BaseApi {
  constructor(protected readonly request: APIRequestContext) {}

  protected get(url: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    return this.request.get(url, options);
  }

  protected post(url: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<APIResponse> {
    return this.request.post(url, options);
  }

  protected put(url: string, options?: Parameters<APIRequestContext['put']>[1]): Promise<APIResponse> {
    return this.request.put(url, options);
  }

  protected delete(url: string, options?: Parameters<APIRequestContext['delete']>[1]): Promise<APIResponse> {
    return this.request.delete(url, options);
  }
}
