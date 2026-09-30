import { expect, type APIRequestContext, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';
import { HomePage } from '../pages/homePage';
import { HealthApi } from '../services/health.api';

type CommonFixtures = {
  signInPage: SigninPage;
  homePage: HomePage;
  healthApi: HealthApi;
};

export const test = base.extend<CommonFixtures>({
  signInPage: async ({ page }: { page: Page }, use) => {
    const signInPage = new SigninPage(page);
    await use(signInPage);
  },
  homePage: async ({ page }: { page: Page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  },
});

export { expect };
