/**
 * Record catch that will not be landed straight away and show it on the review.
 * Traceability: UAT-11 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first],
  gears: [gears.seineNets.name],
  species: [catchSpecies.cod.name]
};

test.describe('Catch Not Landed', () => {
  test.use({ testFavourites });

  test(
    'Record catch not landed straight away',
    {
      tag: ['@ui', '@regression', '@catchNotLanded', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-11' }
    },
    async ({ createdRecords, catchRecordFlow, catchNotLandedPage, speciesNotLandedPage, checkAnswersPage }) => {
      await test.step('I am completing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
        await catchRecordFlow.selectGears([gears.seineNets]);
        await catchRecordFlow.enterCatchDetailsForEachGear([{ gear: gears.seineNets, species: [catchSpecies.cod] }]);
      });

      await test.step('I confirm that some catch will not be landed straight away', async () => {
        await catchNotLandedPage.selectCatchNotLanded(true);
        await catchNotLandedPage.clickSaveAndContinue();
      });

      await test.step('I select the relevant species', async () => {
        await speciesNotLandedPage.selectSpecies(catchSpecies.cod.name);
      });

      await test.step('I enter the weight kept onboard or in keep pots', async () => {
        await speciesNotLandedPage.enterWeightKeptOnboard(catchSpecies.weights.keptOnboard);
        await speciesNotLandedPage.clickSaveAndContinue();
      });

      await test.step('The catch not landed should be recorded', async () => {
        await checkAnswersPage.expectUrl(/\/check-answers$/);
        await expect(checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.notLanded)).toHaveText(
          checkAnswers.answers.yes
        );
      });

      await test.step('It should appear correctly on the review screen', async () => {
        await expect(checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.notLandedSpecies)).toHaveText(
          catchSpecies.cod.name
        );
        await expect(checkAnswersPage.notLandedValue(checkAnswers.summaryKeys.weightKeptOnboard)).toHaveText(
          catchSpecies.weights.keptOnboard
        );
      });
    }
  );
});
