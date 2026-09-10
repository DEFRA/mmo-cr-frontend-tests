import { expect, type APIRequestContext, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';
import { HomePage } from '../pages/homePage';
import { MapPage } from '../pages/mapPage';
import { HealthApi } from '../services/health.api';

type CommonFixtures = {
  signInPage: SigninPage;
  homePage: HomePage;
  mapPage: MapPage;
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
  mapPage: async ({ page }: { page: Page }, use) => {
    const mapPage = new MapPage(page);
    await use(mapPage);
  },
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  },
});

export { expect };
