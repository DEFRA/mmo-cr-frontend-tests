/**
 * Confirm all catch will be landed and continue to the review.
 * Traceability: UAT-12 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearData, type SpeciesCatch, noFavourites } from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const notLandedKey = 'Not landed';
const notLandedSpeciesKey = 'Species';
const weightKeptOnboardKey = 'Weight above minimum size kept onboard or in keep pots (kg)';
const noAnswer = 'No';
const testFavourites: Favourites = { ports: [plymouth], gears: [pots.name], species: [cod.name] };

test.describe('Landing Information', () => {
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
    'Confirm all catch will be landed',
    {
      tag: ['@ui', '@regression', '@landingInformation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-12' }
    },
    async ({ catchRecordFlow, catchNotLandedPage, checkAnswersPage }) => {
      await test.step('I am completing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
        await catchRecordFlow.selectGears([pots]);
        await catchRecordFlow.enterCatchDetailsForEachGear([{ gear: pots, areaCode, species: [cod] }]);
      });

      await test.step('I confirm that no catch is being kept onboard or in keep pots', async () => {
        await catchNotLandedPage.selectCatchNotLanded(false);
        await catchNotLandedPage.clickSaveAndContinue();
      });

      await test.step('I should continue to the review screen', async () => {
        await checkAnswersPage.expectUrl(/\/check-answers$/);
        await expect(checkAnswersPage.pageHeading()).toBeVisible();
      });

      // UNVERIFIED (OQ-8): the live review still shows a "Species not landed" section with "Not landed: No"
      await test.step('No catch-not-landed section should be displayed', async () => {
        await expect(checkAnswersPage.notLandedValue(notLandedKey)).toHaveText(noAnswer);
        await expect(checkAnswersPage.notLandedValue(notLandedSpeciesKey)).toHaveCount(0);
        await expect(checkAnswersPage.notLandedValue(weightKeptOnboardKey)).toHaveCount(0);
      });
    }
  );
});
