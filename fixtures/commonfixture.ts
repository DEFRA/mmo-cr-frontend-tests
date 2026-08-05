import { expect, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';

type CommonFixtures = {
  signInPage: SigninPage;
};

export const test = base.extend<CommonFixtures>({
  signInPage: async ({ page }: { page: Page }, use) => {
    const signInPage = new SigninPage(page);
    await use(signInPage);
  },
});

export { expect };
