import { expect } from '../../../fixtures/commonfixture';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
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
  static async signIn(signInPage: SigninPage, options: SignInOptions = {}): Promise<void> {
    const email = options.email ?? process.env.CATCH_RECORDING_EMAIL ?? '';
    const password = options.password ?? process.env.CATCH_RECORDING_PASSWORD ?? '';
    if (options.requiredCredentialsMessage && (!email || !password)) {
      throw new Error(options.requiredCredentialsMessage);
    }

    await signInPage.goto('/sign-in');
    await signInPage.login(email, password);
    await expect(signInPage.page).toHaveURL(/\/records$/);
  }

  static async openAccount(accountPage: AccountPage): Promise<void> {
    await accountPage.goto('/account');
    await accountPage.expectUrl(/\/account$/);
    await expect(accountPage.pageHeading()).toBeVisible();
  }

  static async signInAndOpenAccount(
    signInPage: SigninPage,
    accountPage: AccountPage,
    options: SignInOptions = {}
  ): Promise<void> {
    await this.signIn(signInPage, options);
    await this.openAccount(accountPage);
  }

  static async signInAndOpenAccountFromRecords(
    signInPage: SigninPage,
    recordsPage: RecordsPage,
    accountPage: AccountPage,
    options: SignInOptions = {}
  ): Promise<void> {
    await this.signIn(signInPage, options);
    await recordsPage.topMenu.yourAccount().click();
    await expect(accountPage.vesselDetailsHeading()).toBeVisible();
  }

  static async openAddGear(accountPage: AccountPage): Promise<void> {
    await accountPage.goto('/account');
    await accountPage.clickAddGear();
    await expect(accountPage.page).toHaveURL(/\/add-gear\?return=/);
  }

  static async openSpeciesSelection(speciesSelectionPage: SpeciesSelectionPage): Promise<void> {
    await speciesSelectionPage.goto('/species-selection');
    await expect(speciesSelectionPage.pageHeading()).toBeVisible();
  }

  static async openAddSpecies(
    speciesSelectionPage: SpeciesSelectionPage,
    addSpeciesPage: AddSpeciesPage
  ): Promise<void> {
    await speciesSelectionPage.clickAddSpecies();
    await expect(addSpeciesPage.page).toHaveURL(/\/add-species\?return=\/species-selection/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
  }

  static async openStatisticalAreaOther(page: StatisticalAreaOtherPage): Promise<void> {
    await page.goto('/statistical-area-other');
  }

  static async selectDeparturePort(
    addPortPage: AddPortPage,
    confirmSamePortPage: ConfirmSamePortPage,
    portName: string
  ): Promise<void> {
    await addPortPage.goto('/add-port?for=departure&entry=1');
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await expect(confirmSamePortPage.pageHeading()).toBeVisible();
    await confirmSamePortPage.selectSamePort(true);
    await confirmSamePortPage.clickSaveAndContinue();
    await addPortPage.expectUrl(/\/gear-selection$/);
  }
}
