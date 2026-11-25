/**
 * Change an answer from the catch record review and keep the other answers.
 * Traceability: UAT-14 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type MultiDayCatchRecordData, daysAgo, reviewDate } from '../helpers/catchRecordFlow';
import { vessels, ports, gears, catchSpecies, checkAnswers } from '../../../test-data/testData';

const testFavourites: Favourites = {
  ports: [ports.first, ports.second],
  gears: [gears.seineNets.name],
  species: [catchSpecies.cod.name]
};

test.describe('Amend Catch Record', () => {
  test.use({ testFavourites });

  let reviewRecord: MultiDayCatchRecordData;

  test.beforeEach(() => {
    reviewRecord = {
      vesselName: vessels.testVessel,
      tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
      departurePort: ports.first,
      returnPort: ports.second,
      // No areaCode, so the area is selected on the map rather than under "Other"
      gearCatches: [{ gear: gears.seineNets, species: [catchSpecies.cod] }]
    };
  });

  test(
    'Correct information during review',
    {
      tag: ['@ui', '@regression', '@amendCatchRecord', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-14' }
    },
    async ({ createdRecords, catchRecordFlow, checkAnswersPage, tripReturnDatePage }) => {
      const amendedReturnDate = daysAgo(0);
      const mapAreaByGear = new Map<string, string>();

      await test.step('I am reviewing my catch record', async () => {
        createdRecords.push(await catchRecordFlow.completeRecordToReview(reviewRecord));
        for (const { gear } of reviewRecord.gearCatches) {
          mapAreaByGear.set(
            gear.name,
            (
              await checkAnswersPage
                .gearSummaryValue(gear.name, checkAnswers.summaryKeys.statisticalSubArea)
                .innerText()
            ).trim()
          );
        }
      });

      await test.step('I select Change for an answer', async () => {
        await checkAnswersPage.changeLinkNamed(checkAnswers.changeLinks.returnDate).click();
      });

      await test.step('I update the information', async () => {
        await tripReturnDatePage.enterDateFrom(amendedReturnDate);
      });

      await test.step('I return to the review', async () => {
        await tripReturnDatePage.clickSaveAndContinue();
        await checkAnswersPage.expectUrl(/\/check-answers$/);
      });

      await test.step('The updated information should be displayed', async () => {
        await expect(checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnDate)).toHaveText(
          reviewDate(amendedReturnDate)
        );
      });

      await test.step('All unchanged information should remain the same', async () => {
        const unchangedTripInformation: [string, string][] = [
          [checkAnswers.summaryKeys.vessel, reviewRecord.vesselName],
          [checkAnswers.summaryKeys.departureDate, reviewDate(reviewRecord.tripDates.departureDate)],
          [checkAnswers.summaryKeys.departurePort, reviewRecord.departurePort],
          [checkAnswers.summaryKeys.returnPort, reviewRecord.returnPort]
        ];
        for (const [key, value] of unchangedTripInformation) {
          await expect(checkAnswersPage.summaryValue(key)).toHaveText(value);
        }
        for (const { gear, species } of reviewRecord.gearCatches) {
          await expect(
            checkAnswersPage.gearSummaryValue(gear.name, checkAnswers.summaryKeys.statisticalSubArea)
          ).toHaveText(mapAreaByGear.get(gear.name)!);
          for (const caught of species) {
            await expect(
              checkAnswersPage.speciesSummaryValue(caught.name, gear.name, checkAnswers.summaryKeys.weightRetained)
            ).toHaveText(`${caught.weight} kg`);
          }
        }
      });
    }
  );
});
