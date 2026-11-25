/**
 * Record species and catch weights against the gear they were caught with.
 * Traceability: UAT-09, UAT-10 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type GearCatch } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const sameSpeciesCatches: GearCatch[] = [
  { gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] },
  { gear: gears.trollingLines, areaCode: areas.validCode, species: [catchSpecies.codWithTrollingLines] }
];
const testFavourites: Favourites = {
  ports: [ports.first],
  gears: [gears.pots.name, gears.trollingLines.name],
  species: [catchSpecies.cod.name]
};

test.describe('Species and Weight', () => {
  test.use({ testFavourites });

  test(
    'Record species and catch weight',
    {
      tag: ['@ui', '@regression', '@catchWeightRecording', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-09' }
    },
    async ({ createdRecords, catchRecordFlow, speciesSelectionPage, checkAnswersPage }) => {
      await test.step('I have recorded the fishing gear and catch area', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
        await catchRecordFlow.selectGears([gears.pots]);
        await catchRecordFlow.selectAreaForCurrentGear(areas.validCode);
      });

      await test.step('I select a species', async () => {
        await speciesSelectionPage.selectSpecies(catchSpecies.cod.name);
      });

      await test.step('I enter its catch weight', async () => {
        await speciesSelectionPage.enterSpeciesWeights(catchSpecies.cod.code, catchSpecies.cod.weight);
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The species and weight should be recorded', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(
          checkAnswersPage.speciesSummaryValue(
            catchSpecies.cod.name,
            gears.pots.name,
            checkAnswers.summaryKeys.weightRetained
          ),
          'Species summary value to have text'
        ).toHaveText(`${catchSpecies.cod.weight} kg`);
      });

      await test.step('They should be linked to the correct fishing gear', async () => {
        await expect(
          checkAnswersPage.gearSummaryValue(gears.pots.name, checkAnswers.summaryKeys.speciesCaught),
          `Gear summary value to contain text ${catchSpecies.cod.name}`
        ).toContainText(catchSpecies.cod.name);
        await expect(
          checkAnswersPage.speciesSection(catchSpecies.cod.name, gears.pots.name),
          'Species section to be visible'
        ).toBeVisible();
      });
    }
  );

  test(
    'Same species against multiple gears',
    {
      tag: ['@ui', '@regression', '@catchWeightRecording', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-10' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage }) => {
      await test.step('I used more than one fishing gear', async () => {
        createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(ports.first, ports.first);
        await catchRecordFlow.selectGears(sameSpeciesCatches.map(({ gear }) => gear));
      });

      await test.step('I record the same species with the relevant weight against each gear', async () => {
        await catchRecordFlow.enterCatchDetailsForEachGear(sameSpeciesCatches);
      });

      await test.step('Each weight should remain linked to the correct gear', async () => {
        await checkAnswersPage.goto('/check-answers');
        for (const { gear, species } of sameSpeciesCatches) {
          for (const caught of species) {
            await expect(
              checkAnswersPage.speciesSummaryValue(caught.name, gear.name, checkAnswers.summaryKeys.weightRetained),
              'Species summary value to have text'
            ).toHaveText(`${caught.weight} kg`);
          }
        }
      });

      await test.step('The review should display the correct values', async () => {
        for (const { gear, species } of sameSpeciesCatches) {
          await expect(
            checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.areaMajorityCaught),
            `Gear summary value to have text ${areas.validCode}`
          ).toHaveText(areas.validCode);
          for (const caught of species) {
            await expect(
              checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.speciesCaught),
              `Gear summary value to contain text ${caught.name}`
            ).toContainText(caught.name);
          }
        }
      });
    }
  );
});
