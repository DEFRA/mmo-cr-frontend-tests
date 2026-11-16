import { createBdd, test as bddTest } from 'playwright-bdd';
import { AccountPage } from '../pages/accountPage';
import { AddGearPage } from '../pages/addGearPage';
import { AddPortPage } from '../pages/addPortPage';
import { AddSpeciesPage } from '../pages/addSpeciesPage';
import { ConfirmSamePortPage } from '../pages/confirmSamePortPage';
import { DeparturePortPage } from '../pages/departurePortPage';
import { GearSelectionPage } from '../pages/gearSelectionPage';
import { RecordsPage } from '../pages/recordsPage';
import { RemoveGearPage } from '../pages/removeGearPage';
import { RemovePortPage } from '../pages/removePortPage';
import { RemoveSpeciesPage } from '../pages/removeSpeciesPage';
import { SelectVesselPage } from '../pages/selectVesselPage';
import { SigninPage } from '../pages/sign-in.page';
import { SpeciesSelectionPage } from '../pages/speciesSelectionPage';
import { StatisticalAreaOtherPage } from '../pages/statisticalAreaOtherPage';
import { TripDatePage } from '../pages/tripDatePage';
import { FavouritesFlow } from '../tests/ui/helpers/favouritesFlow';
import { GearFlow } from '../tests/ui/helpers/gearFlow';
import { NavigationFlow } from '../tests/ui/helpers/navigationFlow';

export type AccountPageBddContext = {
  accountPage: AccountPage;
  addGearPage: AddGearPage;
  addPortPage: AddPortPage;
  addSpeciesPage: AddSpeciesPage;
  departurePortPage: DeparturePortPage;
  gearFlow: GearFlow;
  gearSelectionPage: GearSelectionPage;
  favouritesFlow: FavouritesFlow;
  navigationFlow: NavigationFlow;
  recordsPage: RecordsPage;
  removeGearPage: RemoveGearPage;
  removePortPage: RemovePortPage;
  removeSpeciesPage: RemoveSpeciesPage;
  selectVesselPage: SelectVesselPage;
  speciesSelectionPage: SpeciesSelectionPage;
  tripDatePage: TripDatePage;
  state: {
    gearBefore: string;
  };
};

export const test = bddTest.extend<{ accountBdd: AccountPageBddContext }>({
  accountBdd: async ({ page }, use) => {
    const accountPage = new AccountPage(page);
    const addGearPage = new AddGearPage(page);
    const addPortPage = new AddPortPage(page);
    const addSpeciesPage = new AddSpeciesPage(page);
    const confirmSamePortPage = new ConfirmSamePortPage(page);
    const departurePortPage = new DeparturePortPage(page);
    const gearSelectionPage = new GearSelectionPage(page);
    const recordsPage = new RecordsPage(page);
    const removeGearPage = new RemoveGearPage(page);
    const removePortPage = new RemovePortPage(page);
    const removeSpeciesPage = new RemoveSpeciesPage(page);
    const selectVesselPage = new SelectVesselPage(page);
    const signInPage = new SigninPage(page);
    const speciesSelectionPage = new SpeciesSelectionPage(page);
    const statisticalAreaOtherPage = new StatisticalAreaOtherPage(page);
    const tripDatePage = new TripDatePage(page);
    const gearFlow = new GearFlow({ addGearPage, accountPage, removeGearPage });
    const favouritesFlow = new FavouritesFlow(
      { accountPage, addSpeciesPage, removeSpeciesPage, removeGearPage, addPortPage, removePortPage },
      gearFlow
    );
    const navigationFlow = new NavigationFlow({
      signInPage,
      accountPage,
      recordsPage,
      speciesSelectionPage,
      addSpeciesPage,
      statisticalAreaOtherPage,
      addPortPage,
      confirmSamePortPage
    });

    await use({
      accountPage,
      addGearPage,
      addPortPage,
      addSpeciesPage,
      departurePortPage,
      gearFlow,
      gearSelectionPage,
      favouritesFlow,
      navigationFlow,
      recordsPage,
      removeGearPage,
      removePortPage,
      removeSpeciesPage,
      selectVesselPage,
      speciesSelectionPage,
      tripDatePage,
      state: { gearBefore: '' }
    });
  }
});

export const { Given, When, Then } = createBdd(test);
