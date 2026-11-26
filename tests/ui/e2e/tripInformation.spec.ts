/**
 * Record different departure and return ports for a trip.
 * Traceability: UAT-06 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first, ports.second],
  gears: [gears.pots.name],
  species: [catchSpecies.cod.name]
};

test.describe('Trip Information', () => {
  test.use({ testFavourites });

  test(
    'Different departure and return ports',
    {
      tag: ['@ui', '@regression', '@tripDetails', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-06' }
    },
    async ({
      createdRecords,
      catchRecordFlow,
      departurePortPage,
      returnPortPage,
      checkAnswersPage,
      gearSelectionPage
    }) => {
      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
      });

      await test.step('I select a departure port', async () => {
        await departurePortPage.selectPort(ports.first);
        await departurePortPage.clickSaveAndContinue();
      });

      await test.step('I select a different return port', async () => {
        await returnPortPage.selectPort(ports.second);
        await returnPortPage.clickSaveAndContinue();
      });

      await test.step('I should be able to continue', async () => {
        await gearSelectionPage.expectOnPage();
      });

      await test.step('Both ports should be saved against the trip', async () => {
        // "Check your details" is reached by answering the remaining questions
        await catchRecordFlow.completeCatchToReview([
          { gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] }
        ]);
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort),
          `Summary value to have text ${ports.first}`
        ).toHaveText(ports.first);
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort),
          `Summary value to have text ${ports.second}`
        ).toHaveText(ports.second);
      });
    }
  );
});
