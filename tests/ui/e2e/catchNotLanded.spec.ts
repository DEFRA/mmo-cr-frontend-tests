/**
 * Record catch that will not be landed straight away and show it on the review.
 * Traceability: UAT-11 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearData, type SpeciesCatch, noFavourites } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots', potsDetails: { hauled: '1', inWater: '1' } };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const weightKeptOnboard = '10';
const notLandedKey = 'Not landed';
const notLandedSpeciesKey = 'Species';
const weightKeptOnboardKey = 'Weight above minimum size kept onboard or in keep pots (kg)';
const yesAnswer = 'Yes';
const testFavourites: Favourites = { ports: [plymouth], gears: [pots.name], species: [cod.name] };

test.describe('Catch Not Landed', () => {
  let addedFavourites: Favourites = noFavourites;
  let createdRecords: string[] = [];

  test.beforeEach(async ({ navigationFlow, catchRecordFlow }) => {
    createdRecords = [];
    await test.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
    });
  });

  test.afterEach(async ({ catchRecordFlow }) => {
    await catchRecordFlow.deleteDraftsIfPresent(createdRecords);
    await catchRecordFlow.restoreFavourites(addedFavourites);
  });

  test(
    'Record catch not landed straight away',
    {
      tag: ['@ui', '@regression', '@catchNotLanded', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-11' }
    },
    async ({ catchRecordFlow, catchNotLandedPage, speciesNotLandedPage, checkAnswersPage }) => {
      await test.step('I am completing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
        await catchRecordFlow.selectGears([pots]);
        await catchRecordFlow.enterCatchDetailsForEachGear([{ gear: pots, areaCode, species: [cod] }]);
      });

      await test.step('I confirm that some catch will not be landed straight away', async () => {
        await catchNotLandedPage.selectCatchNotLanded(true);
        await catchNotLandedPage.clickSaveAndContinue();
      });

      await test.step('I select the relevant species', async () => {
        await speciesNotLandedPage.selectSpecies(cod.name);
      });

      await test.step('I enter the weight kept onboard or in keep pots', async () => {
        await speciesNotLandedPage.enterWeightKeptOnboard(weightKeptOnboard);
        await speciesNotLandedPage.clickSaveAndContinue();
      });

      await test.step('The catch not landed should be recorded', async () => {
        await checkAnswersPage.expectUrl(/\/check-answers$/);
        await expect(checkAnswersPage.notLandedValue(notLandedKey)).toHaveText(yesAnswer);
      });

      await test.step('It should appear correctly on the review screen', async () => {
        await expect(checkAnswersPage.notLandedValue(notLandedSpeciesKey)).toHaveText(cod.name);
        await expect(checkAnswersPage.notLandedValue(weightKeptOnboardKey)).toHaveText(weightKeptOnboard);
      });
    }
  );
});
