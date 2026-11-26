/**
 * Reusable journeys for signing in and navigating through the catch record pages.
 *
 * @author Randhir Patel
 * @since 2026-10-27
 */
import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type CatchNotLandedPage } from '../../../pages/catchNotLandedPage';
import { type ConfirmSamePortPage } from '../../../pages/confirmSamePortPage';
import { type DeparturePortPage } from '../../../pages/departurePortPage';
import { type HomePage } from '../../../pages/homePage';
import { type GearSelectionPage } from '../../../pages/gearSelectionPage';
import { type RecordsPage } from '../../../pages/recordsPage';
import { type ReturnPortPage } from '../../../pages/returnPortPage';
import { type SelectVesselPage } from '../../../pages/selectVesselPage';
import { type SigninPage } from '../../../pages/sign-in.page';
import { type SpeciesSelectionPage } from '../../../pages/speciesSelectionPage';
import { type StatisticalAreaOtherPage } from '../../../pages/statisticalAreaOtherPage';
import { type StatisticalAreaPage } from '../../../pages/statisticalAreaPage';
import { type TripDatePage } from '../../../pages/tripDatePage';
import { vessels, ports, gears } from '../../../test-data/testData';

export type SignInOptions = {
  email?: string;
  password?: string;
  requiredCredentialsMessage?: string;
};

export class NavigationFlow {
  readonly createdRecordReferences = new Set<string>();

  constructor(
    private readonly pages: {
      homePage: HomePage;
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
      gearSelectionPage: GearSelectionPage;
      catchNotLandedPage: CatchNotLandedPage;
      addGearPage: AddGearPage;
    }
  ) {}

  async openHomePage(): Promise<void> {
    const { homePage } = this.pages;

    await homePage.goto('/');
    await homePage.expectOnPage();
  }

  // Starts from the home page, as a user would, and selects Start now
  async openSignIn(): Promise<void> {
    const { homePage, signInPage } = this.pages;

    await this.openHomePage();
    await homePage.startNowButton().click();
    await signInPage.expectOnPage();
  }

  async signIn(options: SignInOptions = {}): Promise<void> {
    const { signInPage, recordsPage } = this.pages;

    const email = options.email ?? process.env.CATCH_RECORDING_EMAIL ?? '';
    const password = options.password ?? process.env.CATCH_RECORDING_PASSWORD ?? '';
    if (options.requiredCredentialsMessage && (!email || !password)) {
      throw new Error(options.requiredCredentialsMessage);
    }

    await this.openSignIn();
    await signInPage.login(email, password);
    await recordsPage.expectOnPage();
  }

  async openAccount(): Promise<void> {
    const { accountPage } = this.pages;

    await accountPage.header.accountLink().click();
    await accountPage.expectOnPage();
  }

  async openRecords(): Promise<void> {
    const { recordsPage } = this.pages;

    await recordsPage.header.homeLink().click();
    await recordsPage.expectOnPage();
  }

  async signInAndOpenAccount(options: SignInOptions = {}): Promise<void> {
    await this.signIn(options);
    await this.openAccount();
  }

  async signInAndOpenAccountFromRecords(options: SignInOptions = {}): Promise<void> {
    const { recordsPage, accountPage } = this.pages;

    await this.signIn(options);
    await recordsPage.topMenu.yourAccount().click();
    await expect(accountPage.vesselDetailsHeading(), 'Vessel details heading to be visible').toBeVisible();
  }

  async openAddGear(): Promise<void> {
    const { accountPage, addGearPage } = this.pages;

    await this.openAccount();
    await accountPage.clickAddGear();
    await addGearPage.expectOnPage();
  }

  // Follows the Back link from the page being shown (catch not landed, add species) to species selection
  async returnToSpeciesSelection(): Promise<void> {
    const { speciesSelectionPage } = this.pages;

    await speciesSelectionPage.common.backLink().click();
    await speciesSelectionPage.expectOnPage();
  }

  async saveSpeciesAndReturn(): Promise<void> {
    const { speciesSelectionPage, catchNotLandedPage } = this.pages;

    await speciesSelectionPage.clickSaveAndContinue();
    await catchNotLandedPage.expectOnPage();
    await this.returnToSpeciesSelection();
  }

  // Follows the Back link from species selection to the map for the gear
  async returnToMap(): Promise<void> {
    const { statisticalAreaPage } = this.pages;

    await statisticalAreaPage.common.backLink().click();
    await statisticalAreaPage.expectOnPage();
  }

  // Selects a favourite gear on gear selection, which opens the map for that gear
  async selectGearForMap(gearName = gears.pots.name): Promise<void> {
    const { gearSelectionPage, statisticalAreaPage } = this.pages;

    await gearSelectionPage.gearCheckbox(gearName).check();
    await gearSelectionPage.clickSaveAndContinue();
    await statisticalAreaPage.expectOnPage();
  }

  // Requires a signed-in user; reaches species selection through a new catch record
  async openSpeciesSelectionForNewRecord(
    portName = ports.first,
    vesselName = vessels.testVessel,
    returnPortName = ports.third
  ): Promise<void> {
    const { statisticalAreaPage, speciesSelectionPage } = this.pages;

    await this.openGearSelectionForNewRecord(portName, vesselName, returnPortName);
    await statisticalAreaPage.installCanvasProbe();
    await this.selectGearForMap();
    await statisticalAreaPage.selectMiddleMapArea();
    await speciesSelectionPage.expectOnPage();
  }

  async openGearSelectionForNewRecord(
    portName = ports.first,
    vesselName = vessels.testVessel,
    returnPortName = ports.third
  ): Promise<void> {
    await this.startCatchRecord(vesselName);
    await this.selectDepartureAndReturnPorts(portName, returnPortName);
  }

  async openAddSpecies(): Promise<void> {
    const { speciesSelectionPage, addSpeciesPage } = this.pages;

    await speciesSelectionPage.clickAddSpecies();
    await addSpeciesPage.expectOnPage();
    await expect(addSpeciesPage.speciesInput(), 'Species input to be visible').toBeVisible();
    await expect(addSpeciesPage.speciesInput(), 'Species input to be editable').toBeEditable();
  }

  // Creates a draft for the vessel and stops on the trip-date question
  async openNewRecord(vesselName = vessels.testVessel): Promise<void> {
    const { recordsPage, selectVesselPage, tripDatePage } = this.pages;

    await this.openRecords();
    await recordsPage.createNewRecordButton().click();
    await selectVesselPage.selectVessel(vesselName);
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.expectOnPage();
    this.createdRecordReferences.add(await tripDatePage.getRecordReference());
  }

  async startCatchRecord(vesselName = vessels.testVessel): Promise<void> {
    const { tripDatePage, departurePortPage, addPortPage } = this.pages;

    await this.openNewRecord(vesselName);
    await tripDatePage.yesRadio().check();
    await tripDatePage.clickSaveAndContinue();
    await expect(
      departurePortPage.pageHeading().or(addPortPage.pageHeading()),
      'Departure port heading to be visible'
    ).toBeVisible();
  }

  async openStatisticalAreaMap(
    options: { portName?: string; returnPortName?: string; vesselName?: string; signInOptions?: SignInOptions } = {}
  ): Promise<void> {
    const {
      portName = ports.first,
      returnPortName = ports.third,
      vesselName = vessels.testVessel,
      signInOptions
    } = options;

    await this.signIn(signInOptions);
    await this.openGearSelectionForNewRecord(portName, vesselName, returnPortName);
    await this.selectGearForMap();
  }

  async openStatisticalAreaOther(portName = ports.fifth, vesselName = vessels.testVessel): Promise<void> {
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
  async selectDepartureAndReturnPorts(portName: string, returnPortName = ports.third): Promise<void> {
    const { addPortPage, confirmSamePortPage, departurePortPage, returnPortPage, gearSelectionPage } = this.pages;

    // The account's favourite ports are listed first; adding another port opens the search
    if (await departurePortPage.pageHeading().isVisible()) {
      await departurePortPage.clickAddPort();
    }
    await addPortPage.expectOnPage();
    await addPortPage.searchAndSelectPort(portName);
    await addPortPage.clickSaveAndContinue();

    // Depending on the account's favourite ports, the app asks to confirm the same port,
    // lists favourite return ports, or goes straight to the return-port search
    await expect(
      confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading()).or(addPortPage.returnPortHeading()),
      'Page heading to be visible'
    ).toBeVisible();

    if (returnPortName === portName && (await confirmSamePortPage.pageHeading().isVisible())) {
      await confirmSamePortPage.selectSamePort(true);
      await confirmSamePortPage.clickSaveAndContinue();
    } else {
      if (await returnPortPage.pageHeading().isVisible()) {
        await returnPortPage.clickAddPort();
      }
      await expect(addPortPage.returnPortHeading(), 'Return port heading to be visible').toBeVisible();
      await addPortPage.searchAndSelectPort(returnPortName);
      await addPortPage.clickSaveAndContinue();
    }
    await gearSelectionPage.expectOnPage();
  }
}
