import { expect, type APIRequestContext, type Page, test as base } from '@playwright/test';
import { SigninPage } from '../pages/sign-in.page';
import { HomePage } from '../pages/homePage';
import { RecordsPage } from '../pages/recordsPage';
import { DraftRecordPage } from '../pages/draftRecordPage';
import { SelectVesselPage } from '../pages/selectVesselPage';
import { HealthApi } from '../services/health.api';
import { ReferenceDataApi } from '../services/referenceData.api';
import { createApiContext } from '../services/apiContext';
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
import { RemoveSpeciesPage } from '../pages/removeSpeciesPage';
import { CheckAnswersPage } from '../pages/checkAnswersPage';
import { SubmittedRecordPage } from '../pages/submittedRecordPage';
import { EditReasonPage } from '../pages/editReasonPage';
import { AccountPage } from '../pages/accountPage';
import { RemoveGearPage } from '../pages/removeGearPage';
import { RemovePortPage } from '../pages/removePortPage';
import { withSteps } from '../utils/withSteps';
import { MapFlow } from '../tests/ui/helpers/mapFlow';
import { NavigationFlow } from '../tests/ui/helpers/navigationFlow';
import { GearFlow } from '../tests/ui/helpers/gearFlow';
import { SpeciesFlow } from '../tests/ui/helpers/speciesFlow';
import { FavouritesFlow } from '../tests/ui/helpers/favouritesFlow';
import { SpeciesNotLandedPage } from '../pages/speciesNotLandedPage';
import { CatchRecordFlow, type Favourites, noFavourites } from '../tests/ui/helpers/catchRecordFlow';

const pageObject =
  <T>(PageObjectClass: new (page: Page) => T) =>
  async ({ page }: { page: Page }, use: (pageObject: T) => Promise<void>) => {
    await use(new PageObjectClass(page));
  };

type CatchRecordSessionFixtures = {
  // Favourites the account needs for the test; set per describe block with test.use({ testFavourites })
  testFavourites: Favourites;
  // Favourites that must not be saved during the test; removed at sign-in and restored afterwards
  absentFavourites: Favourites;
  // Signs in and prepares favourites; afterwards deletes the test's drafts and restores the favourites it changed
  createdRecords: string[];
};

type CommonFixtures = CatchRecordSessionFixtures & {
  signInPage: SigninPage;
  homePage: HomePage;
  recordsPage: RecordsPage;
  draftRecordPage: DraftRecordPage;
  selectVesselPage: SelectVesselPage;
  healthApi: HealthApi;
  referenceDataApi: ReferenceDataApi;
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
  removeSpeciesPage: RemoveSpeciesPage;
  checkAnswersPage: CheckAnswersPage;
  submittedRecordPage: SubmittedRecordPage;
  editReasonPage: EditReasonPage;
  accountPage: AccountPage;
  removeGearPage: RemoveGearPage;
  removePortPage: RemovePortPage;
  mapFlow: MapFlow;
  navigationFlow: NavigationFlow;
  gearFlow: GearFlow;
  speciesFlow: SpeciesFlow;
  favouritesFlow: FavouritesFlow;
  speciesNotLandedPage: SpeciesNotLandedPage;
  catchRecordFlow: CatchRecordFlow;
};

export const test = base.extend<CommonFixtures>({
  testFavourites: [noFavourites, { option: true }],
  absentFavourites: [noFavourites, { option: true }],
  createdRecords: async ({ navigationFlow, catchRecordFlow, testFavourites, absentFavourites }, use) => {
    const createdRecords: string[] = [];
    let addedFavourites: Favourites = noFavourites;
    let removedFavourites: Favourites = noFavourites;

    await base.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
      removedFavourites = await catchRecordFlow.removeSavedFavourites(absentFavourites);
    });

    await use(createdRecords);

    await catchRecordFlow.deleteCreatedDrafts();
    await catchRecordFlow.restoreFavourites(addedFavourites);
    await catchRecordFlow.restoreAbsentFavourites(absentFavourites, removedFavourites);
  },
  navigationFlow: async (
    {
      signInPage,
      accountPage,
      recordsPage,
      speciesSelectionPage,
      addSpeciesPage,
      statisticalAreaOtherPage,
      addPortPage,
      confirmSamePortPage,
      selectVesselPage,
      tripDatePage,
      departurePortPage,
      returnPortPage,
      statisticalAreaPage
    },
    use
  ) => {
    await use(
      withSteps(
        new NavigationFlow({
          signInPage,
          accountPage,
          recordsPage,
          speciesSelectionPage,
          addSpeciesPage,
          statisticalAreaOtherPage,
          addPortPage,
          confirmSamePortPage,
          selectVesselPage,
          tripDatePage,
          departurePortPage,
          returnPortPage,
          statisticalAreaPage
        })
      )
    );
  },
  gearFlow: async ({ addGearPage, accountPage, removeGearPage }, use) => {
    await use(withSteps(new GearFlow({ addGearPage, accountPage, removeGearPage })));
  },
  speciesFlow: async ({ addSpeciesPage }, use) => {
    await use(withSteps(new SpeciesFlow({ addSpeciesPage })));
  },
  favouritesFlow: async (
    { accountPage, addSpeciesPage, removeSpeciesPage, removeGearPage, addPortPage, removePortPage, gearFlow },
    use
  ) => {
    await use(
      withSteps(
        new FavouritesFlow(
          { accountPage, addSpeciesPage, removeSpeciesPage, removeGearPage, addPortPage, removePortPage },
          gearFlow
        )
      )
    );
  },
  mapFlow: async ({ statisticalAreaPage, navigationFlow }, use) => {
    await use(withSteps(new MapFlow(statisticalAreaPage, navigationFlow)));
  },
  catchRecordFlow: async (
    {
      accountPage,
      recordsPage,
      tripDatePage,
      tripDepartureDatePage,
      tripReturnDatePage,
      departurePortPage,
      returnPortPage,
      gearSelectionPage,
      statisticalAreaPage,
      statisticalAreaOtherPage,
      speciesSelectionPage,
      catchNotLandedPage,
      speciesNotLandedPage,
      checkAnswersPage,
      draftRecordPage,
      navigationFlow,
      favouritesFlow
    },
    use
  ) => {
    await use(
      withSteps(
        new CatchRecordFlow(
          {
            accountPage,
            recordsPage,
            tripDatePage,
            tripDepartureDatePage,
            tripReturnDatePage,
            departurePortPage,
            returnPortPage,
            gearSelectionPage,
            statisticalAreaPage,
            statisticalAreaOtherPage,
            speciesSelectionPage,
            catchNotLandedPage,
            speciesNotLandedPage,
            checkAnswersPage,
            draftRecordPage
          },
          navigationFlow,
          favouritesFlow
        )
      )
    );
  },
  speciesNotLandedPage: pageObject(SpeciesNotLandedPage),
  signInPage: pageObject(SigninPage),
  homePage: pageObject(HomePage),
  recordsPage: pageObject(RecordsPage),
  draftRecordPage: pageObject(DraftRecordPage),
  selectVesselPage: pageObject(SelectVesselPage),
  tripDatePage: pageObject(TripDatePage),
  tripDepartureDatePage: pageObject(TripDepartureDatePage),
  tripReturnDatePage: pageObject(TripReturnDatePage),
  addPortPage: pageObject(AddPortPage),
  confirmSamePortPage: pageObject(ConfirmSamePortPage),
  departurePortPage: pageObject(DeparturePortPage),
  returnPortPage: pageObject(ReturnPortPage),
  gearSelectionPage: pageObject(GearSelectionPage),
  addGearPage: pageObject(AddGearPage),
  statisticalAreaPage: pageObject(StatisticalAreaPage),
  statisticalAreaOtherPage: pageObject(StatisticalAreaOtherPage),
  speciesSelectionPage: pageObject(SpeciesSelectionPage),
  addSpeciesPage: pageObject(AddSpeciesPage),
  catchNotLandedPage: pageObject(CatchNotLandedPage),
  removeSpeciesPage: pageObject(RemoveSpeciesPage),
  checkAnswersPage: pageObject(CheckAnswersPage),
  submittedRecordPage: pageObject(SubmittedRecordPage),
  editReasonPage: pageObject(EditReasonPage),
  accountPage: pageObject(AccountPage),
  removeGearPage: pageObject(RemoveGearPage),
  removePortPage: pageObject(RemovePortPage),
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  },
  // Own request context so UI projects (whose baseURL is the frontend) can also reach the API host
  referenceDataApi: async ({ playwright }, use) => {
    const apiBaseURL = process.env.CATCH_RECORDING_API_BASE_URL;

    if (!apiBaseURL) {
      throw new Error('CATCH_RECORDING_API_BASE_URL must be set to use referenceDataApi');
    }

    const apiRequest = await createApiContext(playwright.request, apiBaseURL);

    await use(new ReferenceDataApi(apiRequest));
    await apiRequest.dispose();
  }
});

export { expect };
