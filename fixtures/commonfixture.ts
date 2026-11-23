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
import { RemoveSpeciesPage } from '../pages/removeSpeciesPage';
import { CheckAnswersPage } from '../pages/checkAnswersPage';
import { SubmittedRecordPage } from '../pages/submittedRecordPage';
import { AccountPage } from '../pages/accountPage';
import { RemoveGearPage } from '../pages/removeGearPage';
import { RemovePortPage } from '../pages/removePortPage';
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
  // 'created' deletes only drafts the test recorded; 'all' deletes every draft on the account
  draftCleanup: 'created' | 'all';
  // Signs in and saves testFavourites; afterwards deletes drafts and removes the favourites it added
  createdRecords: string[];
};

type CommonFixtures = CatchRecordSessionFixtures & {
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
  removeSpeciesPage: RemoveSpeciesPage;
  checkAnswersPage: CheckAnswersPage;
  submittedRecordPage: SubmittedRecordPage;
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
  draftCleanup: ['created', { option: true }],
  createdRecords: async ({ navigationFlow, catchRecordFlow, testFavourites, draftCleanup }, use) => {
    const createdRecords: string[] = [];
    let addedFavourites: Favourites = noFavourites;

    await base.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });

    await use(createdRecords);

    if (draftCleanup === 'all') {
      await catchRecordFlow.deleteAllDrafts();
    } else {
      await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    }
    await catchRecordFlow.restoreFavourites(addedFavourites);
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
    );
  },
  gearFlow: async ({ addGearPage, accountPage, removeGearPage }, use) => {
    await use(new GearFlow({ addGearPage, accountPage, removeGearPage }));
  },
  speciesFlow: async ({ addSpeciesPage }, use) => {
    await use(new SpeciesFlow({ addSpeciesPage }));
  },
  favouritesFlow: async (
    { accountPage, addSpeciesPage, removeSpeciesPage, removeGearPage, addPortPage, removePortPage, gearFlow },
    use
  ) => {
    await use(
      new FavouritesFlow(
        { accountPage, addSpeciesPage, removeSpeciesPage, removeGearPage, addPortPage, removePortPage },
        gearFlow
      )
    );
  },
  mapFlow: async ({ statisticalAreaPage, navigationFlow }, use) => {
    await use(new MapFlow(statisticalAreaPage, navigationFlow));
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
  accountPage: pageObject(AccountPage),
  removeGearPage: pageObject(RemoveGearPage),
  removePortPage: pageObject(RemovePortPage),
  healthApi: async ({ request }: { request: APIRequestContext }, use) => {
    await use(new HealthApi(request));
  }
});

export { expect };
