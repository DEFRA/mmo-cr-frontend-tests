import { expect, type APIRequestContext, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';
import { HomePage } from '../pages/homePage';
import { RecordsPage } from '../pages/recordsPage';
import { DraftRecordPage } from '../pages/draftRecordPage';
import { SelectVesselPage } from '../pages/selectVesselPage';
import { HealthApi } from '../services/health.api';
import { TripDatePage } from '../pages/tripDatePage';
import { TripDepartureDatePage } from '../pages/tripDepartureDatePage';
import { TripReturnDatePage } from '../pages/tripReturnDatePage';
import { AddPortPage } from '../pages/addPortPage';
import { ConfirmSamePortPage } from '../pages/confirmSamePortPage';
import { DeparturePortPage } from '../pages/departurePortPage';
import { ReturnPortPage } from '../pages/returnPortPage';
import { GearSelectionPage } from '../pages/gearSelectionPage';
import { AddGearPage } from '../pages/addGearPage';
import { StatisticalAreaPage } from '../pages/statisticalAreaPage';
import { StatisticalAreaOtherPage } from '../pages/statisticalAreaOtherPage';
import { SpeciesSelectionPage } from '../pages/speciesSelectionPage';
import { AddSpeciesPage } from '../pages/addSpeciesPage';
import { CatchNotLandedPage } from '../pages/catchNotLandedPage';
import { CheckAnswersPage } from '../pages/checkAnswersPage';
import { SubmittedRecordPage } from '../pages/submittedRecordPage';

type CommonFixtures = {
  signInPage: SigninPage;
  homePage: HomePage;
  recordsPage: RecordsPage;
  draftRecordPage: DraftRecordPage;
  selectVesselPage: SelectVesselPage;
  healthApi: HealthApi;
  tripDatePage: TripDatePage;
  tripDepartureDatePage: TripDepartureDatePage;
  tripReturnDatePage: TripReturnDatePage;
  addPortPage: AddPortPage;
  confirmSamePortPage: ConfirmSamePortPage;
  departurePortPage: DeparturePortPage;
  returnPortPage: ReturnPortPage;
  gearSelectionPage: GearSelectionPage;
  addGearPage: AddGearPage;
  statisticalAreaPage: StatisticalAreaPage;
  statisticalAreaOtherPage: StatisticalAreaOtherPage;
  speciesSelectionPage: SpeciesSelectionPage;
  addSpeciesPage: AddSpeciesPage;
  catchNotLandedPage: CatchNotLandedPage;
  checkAnswersPage: CheckAnswersPage;
  submittedRecordPage: SubmittedRecordPage;
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
  draftRecordPage: async ({ page }: { page: Page }, use) => {
    const draftRecordPage = new DraftRecordPage(page);
    await use(draftRecordPage);
  },
  selectVesselPage: async ({ page }: { page: Page }, use) => {
    const selectVesselPage = new SelectVesselPage(page);
    await use(selectVesselPage);
  },

  tripDatePage: async ({ page }: { page: Page }, use) => {
    await use(new TripDatePage(page));
  },
  tripDepartureDatePage: async ({ page }: { page: Page }, use) => {
    await use(new TripDepartureDatePage(page));
  },
  tripReturnDatePage: async ({ page }: { page: Page }, use) => {
    await use(new TripReturnDatePage(page));
  },
  addPortPage: async ({ page }: { page: Page }, use) => {
    await use(new AddPortPage(page));
  },
  confirmSamePortPage: async ({ page }: { page: Page }, use) => {
    await use(new ConfirmSamePortPage(page));
  },
  departurePortPage: async ({ page }: { page: Page }, use) => {
    await use(new DeparturePortPage(page));
  },
  returnPortPage: async ({ page }: { page: Page }, use) => {
    await use(new ReturnPortPage(page));
  },
  gearSelectionPage: async ({ page }: { page: Page }, use) => {
    await use(new GearSelectionPage(page));
  },
  addGearPage: async ({ page }: { page: Page }, use) => {
    await use(new AddGearPage(page));
  },
  statisticalAreaPage: async ({ page }: { page: Page }, use) => {
    await use(new StatisticalAreaPage(page));
  },
  statisticalAreaOtherPage: async ({ page }: { page: Page }, use) => {
    await use(new StatisticalAreaOtherPage(page));
  },
  speciesSelectionPage: async ({ page }: { page: Page }, use) => {
    await use(new SpeciesSelectionPage(page));
  },
  addSpeciesPage: async ({ page }: { page: Page }, use) => {
    await use(new AddSpeciesPage(page));
  },
  catchNotLandedPage: async ({ page }: { page: Page }, use) => {
    await use(new CatchNotLandedPage(page));
  },
  checkAnswersPage: async ({ page }: { page: Page }, use) => {
    await use(new CheckAnswersPage(page));
  },
  submittedRecordPage: async ({ page }: { page: Page }, use) => {
    await use(new SubmittedRecordPage(page));
  },
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  },
});

export { expect };
