/**
 * Reusable journeys for signing in and navigating through the catch record pages.
 *
 * @author Randhir Patel
 * @since 2026-10-27
 */
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
import { vessels, ports } from '../../../test-data/testData';

export type SignInOptions = {
  email?: string;
  password?: string;
  requiredCredentialsMessage?: string;
};

export class NavigationFlow {
  readonly createdRecordReferences = new Set<string>();

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

  // Requires a signed-in user; reaches species selection through a new catch record
  async openSpeciesSelectionForNewRecord(
    portName = ports.plymouth,
    vesselName = vessels.achilles,
    returnPortName = ports.hastings
  ): Promise<void> {
    const { statisticalAreaPage, speciesSelectionPage } = this.pages;

    await this.startCatchRecord(vesselName);
    await this.selectDepartureAndReturnPorts(portName, returnPortName);
    await statisticalAreaPage.installCanvasProbe();
    await statisticalAreaPage.goto('/statistical-area');
    await statisticalAreaPage.selectMiddleMapArea();
    await speciesSelectionPage.expectUrl(/\/species-selection$/);
    await expect(speciesSelectionPage.pageHeading()).toBeVisible();
  }

  async openAddSpecies(): Promise<void> {
    const { speciesSelectionPage, addSpeciesPage } = this.pages;

    await speciesSelectionPage.clickAddSpecies();
    await expect(addSpeciesPage.page).toHaveURL(/\/add-species\?return=\/species-selection/);
    await expect(addSpeciesPage.speciesInput()).toBeVisible();
    await expect(addSpeciesPage.speciesInput()).toBeEditable();
  }

  // Creates a draft for the vessel and stops on the trip-date question
  async openNewRecord(vesselName = vessels.achilles): Promise<void> {
    const { recordsPage, selectVesselPage, tripDatePage } = this.pages;

    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await selectVesselPage.selectVessel(vesselName);
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.expectUrl(/\/trip-date$/);
    this.createdRecordReferences.add(await tripDatePage.getRecordReference());
  }

  async startCatchRecord(vesselName = vessels.achilles): Promise<void> {
    const { tripDatePage } = this.pages;

    await this.openNewRecord(vesselName);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await tripDatePage.expectUrl(/\/(departure-port|add-port)(\?|$)/);
  }

  async openStatisticalAreaMap(
    options: { portName?: string; returnPortName?: string; vesselName?: string; signInOptions?: SignInOptions } = {}
  ): Promise<void> {
    const { statisticalAreaPage } = this.pages;
    const {
      portName = ports.plymouth,
      returnPortName = ports.hastings,
      vesselName = vessels.achilles,
      signInOptions
    } = options;

    await this.signIn(signInOptions);
    await this.startCatchRecord(vesselName);
    await this.selectDepartureAndReturnPorts(portName, returnPortName);
    await statisticalAreaPage.goto('/statistical-area');
    await statisticalAreaPage.expectUrl(/\/statistical-area$/);
  }

  async openStatisticalAreaOther(portName = ports.hamble, vesselName = vessels.achilles): Promise<void> {
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

  // Selects the departure and return ports, then lands on gear selection
  async selectDepartureAndReturnPorts(portName: string, returnPortName = ports.hastings): Promise<void> {
    const { addPortPage, confirmSamePortPage, returnPortPage } = this.pages;

    await addPortPage.goto('/add-port?for=departure&entry=1');
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();

    // Depending on the account's favourite ports, the app asks to confirm the same port,
    // lists favourite return ports, or goes straight to the return-port search
    await expect(
      confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading()).or(addPortPage.returnPortHeading())
    ).toBeVisible();

    if (returnPortName === portName && (await confirmSamePortPage.pageHeading().isVisible())) {
      await confirmSamePortPage.selectSamePort(true);
      await confirmSamePortPage.clickSaveAndContinue();
    } else {
      if (!(await addPortPage.returnPortHeading().isVisible())) {
        await addPortPage.goto('/add-port?for=return&entry=1');
      }
      await addPortPage.searchAndSelectPort(returnPortName);
      await addPortPage.clickSaveAndContinue();
    }
    await addPortPage.expectUrl(/\/gear-selection$/);
  }
}
