import { expect } from '@playwright/test';
import { type AccountPage } from '../../../pages/accountPage';
import { type CatchNotLandedPage } from '../../../pages/catchNotLandedPage';
import { type CheckAnswersPage } from '../../../pages/checkAnswersPage';
import { type DeparturePortPage } from '../../../pages/departurePortPage';
import { type DraftRecordPage } from '../../../pages/draftRecordPage';
import { type GearSelectionPage } from '../../../pages/gearSelectionPage';
import { type RecordsPage } from '../../../pages/recordsPage';
import { type ReturnPortPage } from '../../../pages/returnPortPage';
import { type SelectVesselPage } from '../../../pages/selectVesselPage';
import { type SpeciesNotLandedPage } from '../../../pages/speciesNotLandedPage';
import { type SpeciesSelectionPage } from '../../../pages/speciesSelectionPage';
import { type StatisticalAreaOtherPage } from '../../../pages/statisticalAreaOtherPage';
import { type StatisticalAreaPage } from '../../../pages/statisticalAreaPage';
import { type TripDatePage } from '../../../pages/tripDatePage';
import { type TripDepartureDatePage } from '../../../pages/tripDepartureDatePage';
import { type TripReturnDatePage } from '../../../pages/tripReturnDatePage';
import { type FavouritesFlow } from './favouritesFlow';
import { type NavigationFlow } from './navigationFlow';

export type SpeciesCatch = { name: string; code: string; weight: string };
export type GearData = { name: string; potsDetails?: { hauled: string; inWater: string } };
export type GearCatch = { gear: GearData; areaCode: string; species: SpeciesCatch[] };
export type NotLandedCatch = { speciesName: string; weightKeptOnboard: string };
export type Favourites = { ports: string[]; gears: string[]; species: string[] };
export type TripDates = { departureDate: Date; returnDate: Date };
export type CatchRecordData = {
  vesselName: string;
  // Omit for a trip that started and finished today
  tripDates?: TripDates;
  departurePort: string;
  returnPort: string;
  gearCatches: GearCatch[];
  notLanded?: NotLandedCatch;
};

export const noFavourites: Favourites = { ports: [], gears: [], species: [] };

// Observed in the test environment, e.g. GBR-PH1234-171126-170520
export const recordReferencePattern = /GBR-[A-Z0-9]+-\d{6}-\d{6}/;

export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Check your catch record shows dates as "14 November 2026"
export const reviewDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// The records table shows trip end dates as "16 Nov 2026"
export const recordsListDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Complete catch-record journeys for the end-to-end UAT specs.
 * Starts, fills and reviews catch records, and restores favourites and drafts created by a test.
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
export class CatchRecordFlow {
  constructor(
    private readonly pages: {
      accountPage: AccountPage;
      recordsPage: RecordsPage;
      selectVesselPage: SelectVesselPage;
      tripDatePage: TripDatePage;
      tripDepartureDatePage: TripDepartureDatePage;
      tripReturnDatePage: TripReturnDatePage;
      departurePortPage: DeparturePortPage;
      returnPortPage: ReturnPortPage;
      gearSelectionPage: GearSelectionPage;
      statisticalAreaPage: StatisticalAreaPage;
      statisticalAreaOtherPage: StatisticalAreaOtherPage;
      speciesSelectionPage: SpeciesSelectionPage;
      catchNotLandedPage: CatchNotLandedPage;
      speciesNotLandedPage: SpeciesNotLandedPage;
      checkAnswersPage: CheckAnswersPage;
      draftRecordPage: DraftRecordPage;
    },
    private readonly navigationFlow: NavigationFlow,
    private readonly favouritesFlow: FavouritesFlow
  ) {}

  // Returns only the favourites this call added so the shared account can be restored afterwards
  async ensureFavourites(favourites: Favourites): Promise<Favourites> {
    const { accountPage } = this.pages;

    await this.navigationFlow.openAccount();
    const savedPorts = await accountPage.getPortsUsed();
    const savedGear = await accountPage.getGearOnboardText();
    const savedSpecies = await accountPage.getSpeciesCaught();
    const added: Favourites = {
      ports: favourites.ports.filter((port) => !savedPorts.includes(port)),
      gears: favourites.gears.filter((gear) => !savedGear.includes(gear)),
      species: favourites.species.filter((species) => !savedSpecies.includes(species))
    };

    for (const port of added.ports) await this.favouritesFlow.addPortToAccount(port);
    for (const gear of added.gears) await this.favouritesFlow.addGearToAccount(gear);
    for (const species of added.species) await this.favouritesFlow.addSpeciesToAccount(species);
    return added;
  }

  async restoreFavourites(added: Favourites): Promise<void> {
    if (added.ports.length + added.gears.length + added.species.length === 0) return;

    await this.navigationFlow.openAccount();
    for (const port of added.ports) await this.favouritesFlow.removePortFromAccount(port);
    for (const gear of added.gears) await this.favouritesFlow.removeGearFromAccount(gear);
    for (const species of added.species) await this.favouritesFlow.removeSpeciesFromAccount(species);
  }

  // Creates the draft and returns its reference
  async startRecord(vesselName: string): Promise<string> {
    const { recordsPage, selectVesselPage, tripDatePage } = this.pages;

    await recordsPage.goto('/records');
    await recordsPage.createNewRecordButton().click();
    await selectVesselPage.selectVessel(vesselName);
    await selectVesselPage.clickSaveAndContinue();
    await tripDatePage.expectUrl(/\/trip-date$/);
    return this.readRecordReference();
  }

  // Journey headings start with the reference, e.g. "GBR-PH1234-171126-170520 Did your trip start and finish today?"
  async readRecordReference(): Promise<string> {
    const { tripDatePage } = this.pages;

    const reference = (await tripDatePage.pageHeading().innerText()).match(recordReferencePattern)?.[0];
    if (!reference) throw new Error('The trip date heading did not include a catch record reference');
    return reference;
  }

  async enterSameDayTrip(): Promise<void> {
    const { tripDatePage, departurePortPage } = this.pages;

    await tripDatePage.selectSameDate(true);
    await tripDatePage.clickSaveAndContinue();
    await departurePortPage.expectUrl(/\/departure-port$/);
  }

  async enterMultiDayTrip({ departureDate, returnDate }: TripDates): Promise<void> {
    const { tripDatePage, tripDepartureDatePage, tripReturnDatePage, departurePortPage } = this.pages;

    await tripDatePage.selectSameDate(false);
    await tripDatePage.clickSaveAndContinue();
    await tripDepartureDatePage.expectUrl(/\/trip-departure-date$/);
    await tripDepartureDatePage.enterDateFrom(departureDate);
    await tripDepartureDatePage.clickSaveAndContinue();
    await tripReturnDatePage.expectUrl(/\/trip-return-date$/);
    await tripReturnDatePage.enterDateFrom(returnDate);
    await tripReturnDatePage.clickSaveAndContinue();
    await departurePortPage.expectUrl(/\/departure-port$/);
  }

  // Both ports must be favourites so the radio lists are shown instead of the port search
  async selectPorts(departurePort: string, returnPort: string): Promise<void> {
    const { departurePortPage, returnPortPage, gearSelectionPage } = this.pages;

    await departurePortPage.selectPort(departurePort);
    await departurePortPage.clickSaveAndContinue();
    await returnPortPage.expectUrl(/\/return-port$/);
    await returnPortPage.selectPort(returnPort);
    await returnPortPage.clickSaveAndContinue();
    await gearSelectionPage.expectUrl(/\/gear-selection$/);
  }

  async selectGears(gears: GearData[]): Promise<void> {
    const { gearSelectionPage, statisticalAreaPage } = this.pages;

    for (const gear of gears) {
      await gearSelectionPage.gearCheckbox(gear.name).check();
      if (gear.potsDetails) {
        await gearSelectionPage.enterPotsDetails(gear.potsDetails.hauled, gear.potsDetails.inWater);
      }
    }
    await gearSelectionPage.clickSaveAndContinue();
    await statisticalAreaPage.expectUrl(/\/statistical-area\?gearId=/);
  }

  async selectAreaForCurrentGear(areaCode: string): Promise<void> {
    const { statisticalAreaPage, statisticalAreaOtherPage, speciesSelectionPage } = this.pages;

    await statisticalAreaPage.clickOther();
    await statisticalAreaOtherPage.searchAndSelectAlternativeArea(areaCode);
    await statisticalAreaOtherPage.clickSaveAndContinue();
    await speciesSelectionPage.expectUrl(/\/species-selection\?gearId=/);
  }

  async enterSpeciesForCurrentGear(species: SpeciesCatch[]): Promise<void> {
    const { speciesSelectionPage } = this.pages;

    for (const caught of species) {
      await speciesSelectionPage.speciesCheckbox(caught.name).check();
      await speciesSelectionPage.enterSpeciesWeights(caught.code, caught.weight);
    }
    await speciesSelectionPage.clickSaveAndContinue();
  }

  // Gears are visited one at a time; the area heading names the gear being recorded
  async enterCatchDetailsForEachGear(gearCatches: GearCatch[]): Promise<void> {
    const { catchNotLandedPage } = this.pages;

    for (let visited = 0; visited < gearCatches.length; visited++) {
      const gearCatch = await this.currentGearCatch(gearCatches);
      await this.selectAreaForCurrentGear(gearCatch.areaCode);
      await this.enterSpeciesForCurrentGear(gearCatch.species);
    }
    await catchNotLandedPage.expectUrl(/\/catch-not-landed$/);
  }

  private async currentGearCatch(gearCatches: GearCatch[]): Promise<GearCatch> {
    const { statisticalAreaPage } = this.pages;

    await expect(statisticalAreaPage.pageHeadingForGear()).toBeVisible();
    for (const gearCatch of gearCatches) {
      if (await statisticalAreaPage.pageHeadingForGear(gearCatch.gear.name).isVisible()) return gearCatch;
    }
    throw new Error('The statistical area heading did not name any expected gear');
  }

  async confirmAllCatchLanded(): Promise<void> {
    const { catchNotLandedPage, checkAnswersPage } = this.pages;

    await catchNotLandedPage.selectCatchNotLanded(false);
    await catchNotLandedPage.clickSaveAndContinue();
    await checkAnswersPage.expectUrl(/\/check-answers$/);
  }

  async recordCatchNotLanded({ speciesName, weightKeptOnboard }: NotLandedCatch): Promise<void> {
    const { catchNotLandedPage, speciesNotLandedPage, checkAnswersPage } = this.pages;

    await catchNotLandedPage.selectCatchNotLanded(true);
    await catchNotLandedPage.clickSaveAndContinue();
    await speciesNotLandedPage.expectUrl(/\/species-not-landed$/);
    await speciesNotLandedPage.selectSpecies(speciesName);
    await speciesNotLandedPage.enterWeightKeptOnboard(weightKeptOnboard);
    await speciesNotLandedPage.clickSaveAndContinue();
    await checkAnswersPage.expectUrl(/\/check-answers$/);
  }

  // Answers every question up to "Check your catch record" without submitting; returns the reference
  async completeRecordToReview(record: CatchRecordData): Promise<string> {
    const reference = await this.startRecord(record.vesselName);
    if (record.tripDates) {
      await this.enterMultiDayTrip(record.tripDates);
    } else {
      await this.enterSameDayTrip();
    }
    await this.selectPorts(record.departurePort, record.returnPort);
    await this.selectGears(record.gearCatches.map(({ gear }) => gear));
    await this.enterCatchDetailsForEachGear(record.gearCatches);
    if (record.notLanded) {
      await this.recordCatchNotLanded(record.notLanded);
    } else {
      await this.confirmAllCatchLanded();
    }
    return reference;
  }

  // Deletes drafts created by a test; submitted records and records already removed are left alone
  async deleteDraftsIfPresent(references: string[]): Promise<void> {
    const { recordsPage, draftRecordPage } = this.pages;

    for (const reference of references) {
      await recordsPage.goto('/records');
      if ((await recordsPage.recordRow(reference).count()) === 0) continue;
      if ((await recordsPage.recordStatus(reference).innerText()).trim() !== 'Draft') continue;

      await recordsPage.openRecord(reference);
      await draftRecordPage.deleteDraft();
      await recordsPage.expectUrl(/\/records$/);
    }
  }
}
