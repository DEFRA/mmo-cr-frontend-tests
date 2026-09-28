import { expect, type APIRequestContext, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';
import { HomePage } from '../pages/homePage';
import { RecordsPage } from '../pages/recordsPage';
import { HealthApi } from '../services/health.api';

type CommonFixtures = {
  signInPage: SigninPage;
  homePage: HomePage;
  recordsPage: RecordsPage;
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
  recordsPage: async ({ page }: { page: Page }, use) => {
    const recordsPage = new RecordsPage(page);
    await use(recordsPage);
  },
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  },
});

export { expect };
