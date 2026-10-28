import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type ConfirmSamePortPage } from '../../../pages/confirmSamePortPage';
import { type RecordsPage } from '../../../pages/recordsPage';
import { type SigninPage } from '../../../pages/sign-in.page';
import { type SpeciesSelectionPage } from '../../../pages/speciesSelectionPage';
import { type StatisticalAreaOtherPage } from '../../../pages/statisticalAreaOtherPage';

export type SignInOptions = {
  email?: string;
  password?: string;
  requiredCredentialsMessage?: string;
};

export class NavigationFlow {
  constructor(
    private readonly pages: {
      signInPage: SigninPage;
      accountPage: AccountPage;
      recordsPage: RecordsPage;
      speciesSelectionPage: SpeciesSelectionPage;
      addSpeciesPage: AddSpeciesPage;
      statisticalAreaOtherPage: StatisticalAreaOtherPage;
      addPortPage: AddPortPage;
      confirmSamePortPage: ConfirmSamePortPage;
    }
  ) {}

  async signIn(options: SignInOptions = {}): Promise<void> {
    const { signInPage } = this.pages;

    const email = options.email ?? process.env.CATCH_RECORDING_EMAIL ?? '';
    const password = options.password ?? process.env.CATCH_RECORDING_PASSWORD ?? '';
    if (options.requiredCredentialsMessage && (!email || !password)) {
      throw new Error(options.requiredCredentialsMessage);
    }

    await signInPage.goto('/sign-in');
    await signInPage.login(email, password);
    await expect(signInPage.page).toHaveURL(/\/records$/);
  }

  async openAccount(): Promise<void> {
    const { accountPage } = this.pages;

    await accountPage.goto('/account');
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  }

  async signInAndOpenAccount(options: SignInOptions = {}): Promise<void> {
    await this.signIn(options);
    await this.openAccount();
  }

  async signInAndOpenAccountFromRecords(options: SignInOptions = {}): Promise<void> {
    const { recordsPage, accountPage } = this.pages;

    await this.signIn(options);
    await recordsPage.topMenu.yourAccount().click();
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
  }

  async openAddGear(): Promise<void> {
    const { accountPage } = this.pages;

    await accountPage.goto('/account');
    await accountPage.clickAddGear();
    await expect(accountPage.page).toHaveURL(/\/add-gear\?return=/);
  }

  async openSpeciesSelection(): Promise<void> {
    const { speciesSelectionPage } = this.pages;

    await speciesSelectionPage.goto('/species-selection');
    await expect(speciesSelectionPage.pageHeading()).toBeVisible();
  }

  async openAddSpecies(): Promise<void> {
    const { speciesSelectionPage, addSpeciesPage } = this.pages;

    await speciesSelectionPage.clickAddSpecies();
    await expect(addSpeciesPage.page).toHaveURL(/\/add-species\?return=\/species-selection/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
  }

  async openStatisticalAreaOther(): Promise<void> {
    const { statisticalAreaOtherPage: page } = this.pages;

    await page.goto('/statistical-area-other');
  }

  async selectDeparturePort(portName: string): Promise<void> {
    const { addPortPage, confirmSamePortPage } = this.pages;

    await addPortPage.goto('/add-port?for=departure&entry=1');
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await expect(confirmSamePortPage.pageHeading()).toBeVisible();
    await confirmSamePortPage.selectSamePort(true);
    await confirmSamePortPage.clickSaveAndContinue();
    await addPortPage.expectUrl(/\/gear-selection$/);
  }
}
