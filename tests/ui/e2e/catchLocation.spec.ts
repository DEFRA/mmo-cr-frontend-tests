/**
 * Record the statistical area where most of the catch was caught for a gear.
 * Traceability: UAT-08 (CRAR ticket TBC).
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

test.describe('Catch Location', () => {
  test.use({ testFavourites });

  test(
    'Record where catch was caught',
    {
      tag: ['@ui', '@regression', '@catchLocation', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-08' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, speciesSelectionPage }) => {
      let areaCode = '';

      await test.step('I am creating a catch record', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
      });

      await test.step('I have selected the fishing gear', async () => {
        await catchRecordFlow.selectGears([gears.seineNets]);
      });

      await test.step('I select the area where most of my catch was caught', async () => {
        areaCode = await catchRecordFlow.selectAreaFromMapForCurrentGear();
      });

      await test.step('I should continue to species selection', async () => {
        await speciesSelectionPage.expectOnPage();
        await expect(
          speciesSelectionPage.pageHeadingForGear(gears.seineNets.name),
          'Page heading for gear to be visible'
        ).toBeVisible();
      });

      await test.step('The selected area should be recorded', async () => {
        await catchRecordFlow.completeSpeciesToReview([catchSpecies.cod]);
        await expect(
          checkAnswersPage.gearSummaryValue(gears.seineNets.name, checkAnswers.summaryKeys.statisticalSubArea),
          `Gear summary value to have text ${areaCode}`
        ).toHaveText(areaCode);
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.statisticalSubArea),
          `Summary value to contain text ${areaCode}`
        ).toContainText(areaCode);
      });
    }
  );
});
