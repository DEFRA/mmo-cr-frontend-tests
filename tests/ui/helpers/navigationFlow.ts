import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type ConfirmSamePortPage } from '../../../pages/confirmSamePortPage';
import { type DeparturePortPage } from '../../../pages/departurePortPage';
import { type RecordsPage } from '../../../pages/recordsPage';
import { type ReturnPortPage } from '../../../pages/returnPortPage';
import { type SelectVesselPage } from '../../../pages/selectVesselPage';
import { type SigninPage } from '../../../pages/sign-in.page';
import { type SpeciesSelectionPage } from '../../../pages/speciesSelectionPage';
import { type StatisticalAreaOtherPage } from '../../../pages/statisticalAreaOtherPage';
import { type StatisticalAreaPage } from '../../../pages/statisticalAreaPage';
import { type TripDatePage } from '../../../pages/tripDatePage';

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
      selectVesselPage: SelectVesselPage;
      tripDatePage: TripDatePage;
      departurePortPage: DeparturePortPage;
      returnPortPage: ReturnPortPage;
      statisticalAreaPage: StatisticalAreaPage;
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
    await expect(addSpeciesPage.speciesInput()).toBeEditable();
  }

  async startCatchRecord(vesselName = 'ACHILLES'): Promise<void> {
    const { recordsPage, selectVesselPage, tripDatePage } = this.pages;

    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await selectVesselPage.selectVessel(vesselName);
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
  }

  async openStatisticalAreaMap(
    options: { portName?: string; vesselName?: string; signInOptions?: SignInOptions } = {}
  ): Promise<void> {
    const { statisticalAreaPage } = this.pages;
    const { portName = 'Plymouth', vesselName = 'ACHILLES', signInOptions } = options;

    await this.signIn(signInOptions);
    await this.startCatchRecord(vesselName);
    await this.selectDeparturePort(portName);
    await statisticalAreaPage.goto('/statistical-area');
    await statisticalAreaPage.expectUrl(/\/statistical-area$/);
  }

  async openStatisticalAreaOther(portName = 'Hamble', vesselName = 'ACHILLES'): Promise<void> {
    const { statisticalAreaPage } = this.pages;

    await this.openStatisticalAreaMap({
      portName,
      vesselName,
      signInOptions: {
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for statistical area UI tests'
      }
    });
    await statisticalAreaPage.clickOther();
  }

  async selectDeparturePort(portName: string): Promise<void> {
    const { addPortPage, confirmSamePortPage, returnPortPage } = this.pages;

    await addPortPage.goto('/add-port?for=departure&entry=1');
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();
    await expect(confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading())).toBeVisible();

    // Accounts with favourite ports go to the return-port list instead of the same-port confirmation
    if (await confirmSamePortPage.pageHeading().isVisible()) {
      await confirmSamePortPage.selectSamePort(true);
      await confirmSamePortPage.clickSaveAndContinue();
    } else {
      await addPortPage.goto('/add-port?for=return&entry=1');
      await addPortPage.searchAndSelectPort(portName);
      await addPortPage.clickSaveAndContinue();
    }
    await addPortPage.expectUrl(/\/gear-selection$/);
  }
}
