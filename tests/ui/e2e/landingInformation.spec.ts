/**
 * Confirm all catch will be landed and continue to the review.
 * Traceability: UAT-12 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first],
  gears: [gears.pots.name],
  species: [catchSpecies.cod.name]
};

test.describe('Landing Information', () => {
  test.use({ testFavourites });

  test(
    'Confirm all catch will be landed',
    {
      tag: ['@ui', '@regression', '@landingInformation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-12' }
    },
    async ({ createdRecords, catchRecordFlow, catchNotLandedPage, checkAnswersPage }) => {
      await test.step('I am completing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
        await catchRecordFlow.selectGears([gears.pots]);
        await catchRecordFlow.enterCatchDetailsForEachGear([
          { gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] }
        ]);
      });

      await test.step('I confirm that no catch is being kept onboard or in keep pots', async () => {
        await catchNotLandedPage.selectCatchNotLanded(false);
        await catchNotLandedPage.clickSaveAndContinue();
      });

      await test.step('I should continue to the review screen', async () => {
        await checkAnswersPage.expectOnPage();
      });

      // UNVERIFIED (OQ-8): the live review still shows a "Species not landed" section with "Not landed: No"
      await test.step('No catch-not-landed section should be displayed', async () => {
        await expect(
          checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.notLanded),
          `Not landed value to have text ${checkAnswers.answers.no}`
        ).toHaveText(checkAnswers.answers.no);
        await expect(
          checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.notLandedSpecies),
          'Not landed value to have count'
        ).toHaveCount(0);
        await expect(
          checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.weightKeptOnboard),
          'Not landed value to have count'
        ).toHaveCount(0);
      });
    }
  );
});
