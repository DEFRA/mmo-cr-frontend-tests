/**
 * Record species and catch weights against the gear they were caught with.
 * Traceability: UAT-09, UAT-10 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import {
  type Favourites,
  type GearCatch,
  type GearData,
  type SpeciesCatch
} from '../helpers/catchRecordFlow';

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const areaCode = '46D86';
const pots: GearData = { name: 'Pots' };
const trollingLines: GearData = { name: 'Trolling lines' };
const cod: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '100' };
const codWithTrollingLines: SpeciesCatch = { name: 'Atlantic cod (COD)', code: 'COD', weight: '50' };
const sameSpeciesCatches: GearCatch[] = [
  { gear: pots, areaCode, species: [cod] },
  { gear: trollingLines, areaCode, species: [codWithTrollingLines] }
];
const areaKey = 'Area majority catch caught';
const speciesCaughtKey = 'Species caught';
const weightRetainedKey = 'Weight above minimum size retained (kg)';
const testFavourites: Favourites = {
  ports: [plymouth],
  gears: [pots.name, trollingLines.name],
  species: [cod.name]
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
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
        await catchRecordFlow.selectGears([pots]);
        await catchRecordFlow.selectAreaForCurrentGear(areaCode);
      });

      await test.step('I select a species', async () => {
        await speciesSelectionPage.selectSpecies(cod.name);
      });

      await test.step('I enter its catch weight', async () => {
        await speciesSelectionPage.enterSpeciesWeights(cod.code, cod.weight);
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('The species and weight should be recorded', async () => {
        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.speciesSummaryValue(cod.name, pots.name, weightRetainedKey)).toHaveText(
          cod.weight
        );
      });

      await test.step('They should be linked to the correct fishing gear', async () => {
        await expect(checkAnswersPage.gearSummaryValue(pots.name, speciesCaughtKey)).toContainText(cod.name);
        await expect(checkAnswersPage.speciesSection(cod.name, pots.name)).toBeVisible();
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
        createdRecords.push(await catchRecordFlow.startRecord(vesselName));
        await catchRecordFlow.enterSameDayTrip();
        await catchRecordFlow.selectPorts(plymouth, plymouth);
        await catchRecordFlow.selectGears(sameSpeciesCatches.map(({ gear }) => gear));
      });

      await test.step('I record the same species with the relevant weight against each gear', async () => {
        await catchRecordFlow.enterCatchDetailsForEachGear(sameSpeciesCatches);
      });

      await test.step('Each weight should remain linked to the correct gear', async () => {
        await checkAnswersPage.goto('/check-answers');
        for (const { gear, species } of sameSpeciesCatches) {
          for (const caught of species) {
            await expect(checkAnswersPage.speciesSummaryValue(caught.name, gear.name, weightRetainedKey)).toHaveText(
              caught.weight
            );
          }
        }
      });

      await test.step('The review should display the correct values', async () => {
        for (const { gear, species } of sameSpeciesCatches) {
          await expect(checkAnswersPage.gearSummaryValue(gear.name, areaKey)).toHaveText(areaCode);
          for (const caught of species) {
            await expect(checkAnswersPage.gearSummaryValue(gear.name, speciesCaughtKey)).toContainText(caught.name);
          }
        }
      });
    }
  );
});
