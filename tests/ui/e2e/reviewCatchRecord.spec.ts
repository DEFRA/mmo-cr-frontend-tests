/**
 * Review a completed catch record before submission.
 * Traceability: UAT-13 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type MultiDayCatchRecordData, daysAgo, reviewDate } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, areas, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first, ports.second],
  gears: [gears.pots.name, gears.trollingLines.name],
  species: [catchSpecies.cod.name, catchSpecies.mackerel.name]
};

test.describe('Review Catch Record', () => {
  test.use({ testFavourites });

  let reviewRecord: MultiDayCatchRecordData;

  test.beforeEach(() => {
    reviewRecord = {
      vesselName: vessels.testVessel,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: ports.first,
      returnPort: ports.second,
      gearCatches: [
        { gear: gears.pots, areaCode: areas.validCode, species: [catchSpecies.cod] },
        { gear: gears.trollingLines, areaCode: areas.validCode, species: [catchSpecies.mackerel] }
      ]
    };
  });

  test(
    'Review completed information',
    {
      tag: ['@ui', '@regression', '@reviewCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-13' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage }) => {
      await test.step('I have completed all required catch information', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(reviewRecord));
      });

      await test.step('I open the catch record review', async () => {
        await checkAnswersPage.goto('/check-answers');
      });

      await test.step('I should see the trip information', async () => {
        const tripInformation: [string, string][] = [
          [checkAnswers.summaryKeys.vessel, reviewRecord.vesselName],
          [checkAnswers.summaryKeys.departureDate, reviewDate(reviewRecord.tripDates.departureDate)],
          [checkAnswers.summaryKeys.returnDate, reviewDate(reviewRecord.tripDates.returnDate)],
          [checkAnswers.summaryKeys.departurePort, reviewRecord.departurePort],
          [checkAnswers.summaryKeys.returnPort, reviewRecord.returnPort]
        ];
        for (const [key, value] of tripInformation) {
          await expect(checkAnswersPage.summaryValue(key), `Summary value to have text ${value}`).toHaveText(value);
        }
      });

      await test.step('I should see gear and catch areas', async () => {
        for (const { gear } of reviewRecord.gearCatches) {
          await expect(checkAnswersPage.gearSection(gear.name), 'Gear section to be visible').toBeVisible();
          await expect(
            checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.areaMajorityCaught),
            `Gear summary value to have text ${areas.validCode}`
          ).toHaveText(areas.validCode);
        }
      });

      await test.step('I should see species and weights', async () => {
        for (const { gear, species } of reviewRecord.gearCatches) {
          for (const caught of species) {
            await expect(
              checkAnswersPage.speciesSummaryValue(caught.name, gear.name, checkAnswers.summaryKeys.weightRetained),
              'Species summary value to have text'
            ).toHaveText(`${caught.weight} kg`);
          }
        }
      });

      // UNVERIFIED (OQ-6): "identify anything requiring correction" is assumed to mean every answer has a Change link
      await test.step('I should be able to identify anything requiring correction', async () => {
        for (const changeLink of Object.values(checkAnswers.changeLinks)) {
          await expect(checkAnswersPage.changeLinkNamed(changeLink), 'Change link named to be visible').toBeVisible();
        }
      });
    }
  );
});
