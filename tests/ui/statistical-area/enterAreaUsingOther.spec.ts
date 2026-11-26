/**
 * A fisher whose statistical sub area is not in the suggested list selects "Other" and uses a type-ahead field
 * to search for and select the correct statistical sub area code, with matching coordinates shown and stored.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, noFavourites } from '../helpers/catchRecordFlow';
import { areas, checkAnswers, errorMessages, gears, ports } from '../../../test-data/testData';

const searchTerm: string = areas.validCode.slice(0, 2);
const additionalCharacters: string = areas.validCode.slice(2);
const areaCodePattern: RegExp = /\d{2}[A-Z]\d{2}/;
const coordinatesPattern: RegExp = /[-\u2212]?\d+\.\d+,\s*[-\u2212]?\d+\.\d+/;

// Departure and return ports the journey saves as favourites; removed after each test unless already saved
const absentFavourites: Favourites = { ...noFavourites, ports: [ports.fifth, ports.third] };
// Gear the journey selects to reach the map; saved for the test and removed afterwards unless already saved
const testFavourites: Favourites = { ...noFavourites, gears: [gears.pots.name] };

test.describe('Enter statistical sub area using the Other option', () => {
  test.use({ testFavourites, absentFavourites });

  // Requesting createdRecords signs in and restores the favourites and drafts after each test
  test.beforeEach(async ({ navigationFlow, createdRecords }) => {
    void createdRecords;
    await navigationFlow.openStatisticalAreaOther();
  });

  test(
    'Displays an editable type-ahead field when the Other option is selected',
    { tag: ['@ui', '@regression', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage }) => {
      await test.step('The fisher is on the Statistical Sub Area screen', async () => {
        await statisticalAreaOtherPage.otherRadio().waitFor({ state: 'visible' });
      });

      await test.step('The required statistical sub area is not displayed in the list', async () => {
        // Precondition guard: suggestions depend on the departure port, so confirm the test area is not a suggestion
        await expect(statisticalAreaOtherPage.areaRadio(areas.validCode), 'Area radio to have count').toHaveCount(0);
      });

      await test.step('The fisher selects the "Other" radio button', async () => {
        await statisticalAreaOtherPage.selectAreaRadio(areas.otherOption);
      });

      await test.step('A type-ahead input field is displayed', async () => {
        await expect(statisticalAreaOtherPage.otherRadio(), 'Other radio to be checked').toBeChecked();
        await expect(
          statisticalAreaOtherPage.alternativeAreaInput(),
          'Alternative area input to be visible'
        ).toBeVisible();
        await expect(
          statisticalAreaOtherPage.alternativeAreaInput(),
          'Alternative area input to be editable'
        ).toBeEditable();
      });

      await test.step('The fisher can manually enter a statistical sub area code', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(areas.validCode);
        await expect(
          statisticalAreaOtherPage.alternativeAreaInput(),
          `Alternative area input to have value ${areas.validCode}`
        ).toHaveValue(areas.validCode);
      });
    }
  );

  test(
    'Displays matching area codes and coordinates when a partial code is entered',
    { tag: ['@ui', '@regression', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage }) => {
      test.info().annotations.push({
        type: 'unverified',
        description: 'Related ICES rectangle (where applicable) is not asserted: no existing selector or evidence'
      });

      await test.step('The fisher has selected "Other"', async () => {
        await statisticalAreaOtherPage.selectAreaRadio(areas.otherOption);
      });

      await test.step('The fisher enters two or more characters into the type-ahead field', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(searchTerm);
      });

      await test.step('Matching statistical sub area codes are displayed in a dropdown list', async () => {
        await expect(
          statisticalAreaOtherPage.alternativeAreaResultsList(),
          'Alternative area results list to be visible'
        ).toBeVisible();
        await expect(
          statisticalAreaOtherPage.alternativeAreaResultItem(areas.validCode),
          'Alternative area result item to be visible'
        ).toBeVisible();
      });

      await test.step('Each matching result displays the statistical sub area code, associated coordinates and related ICES rectangle (where applicable)', async () => {
        await expect(
          statisticalAreaOtherPage.coordinatesDisplay(areas.validCode),
          `Coordinates display to contain text ${coordinatesPattern}`
        ).toContainText(coordinatesPattern);

        for (const resultItem of await statisticalAreaOtherPage.alternativeAreaResultItems().all()) {
          await expect(resultItem, `Result item to contain text ${searchTerm}`).toContainText(searchTerm);
          await expect(resultItem, `Result item to contain text ${areaCodePattern}`).toContainText(areaCodePattern);
          await expect(resultItem, `Result item to contain text ${coordinatesPattern}`).toContainText(
            coordinatesPattern
          );
        }
      });
    }
  );

  test(
    'Displays corresponding coordinates as a valid area code is entered',
    { tag: ['@ui', '@regression', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage }) => {
      let initialCoordinates: string | undefined;

      await test.step('The fisher is entering a statistical sub area code', async () => {
        await statisticalAreaOtherPage.selectAreaRadio(areas.otherOption);
        await statisticalAreaOtherPage.alternativeAreaInput().focus();
      });

      await test.step('The entered value matches a valid statistical sub area', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(searchTerm);
      });

      await test.step('The corresponding coordinates are displayed automatically', async () => {
        const coordinates = statisticalAreaOtherPage.coordinatesDisplay(areas.validCode);
        await expect(coordinates, 'Coordinates to be visible').toBeVisible();
        await expect(coordinates, `Coordinates to contain text ${coordinatesPattern}`).toContainText(
          coordinatesPattern
        );
        initialCoordinates = (await coordinates.innerText()).match(coordinatesPattern)?.[0];
      });

      await test.step('The coordinates update dynamically as additional characters are entered', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().pressSequentially(additionalCharacters);
        await expect(
          statisticalAreaOtherPage.alternativeAreaInput(),
          `Alternative area input to have value ${areas.validCode}`
        ).toHaveValue(areas.validCode);

        await expect(
          statisticalAreaOtherPage.alternativeAreaResultItems().first(),
          `Alternative area result items to contain text ${areas.validCode}`
        ).toContainText(areas.validCode);
        const coordinates = statisticalAreaOtherPage.coordinatesDisplay(areas.validCode);
        await expect(coordinates, 'Coordinates to be visible').toBeVisible();
        expect(initialCoordinates, 'Initial coordinates to be defined').toBeDefined();
        await expect(coordinates, 'Coordinates to contain text').toContainText(initialCoordinates ?? '');
      });
    }
  );

  test(
    'Saves the area code when a suggested result is selected',
    { tag: ['@ui', '@smoke', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage, speciesSelectionPage, checkAnswersPage }) => {
      test.info().annotations.push({
        type: 'unverified',
        description: 'Check answers evidence covers the area code only; stored coordinates are not asserted'
      });

      await test.step('One or more matching statistical sub areas are displayed', async () => {
        await statisticalAreaOtherPage.typeInAlternativeArea(searchTerm);
        await statisticalAreaOtherPage.alternativeAreaResultItem(areas.validCode).waitFor({ state: 'visible' });
      });

      await test.step('The fisher selects a result from the dropdown', async () => {
        await statisticalAreaOtherPage.alternativeAreaResultItem(areas.validCode).click();
      });

      await test.step('The statistical sub area code is populated into the field', async () => {
        await expect(
          statisticalAreaOtherPage.alternativeAreaInput(),
          'Alternative area input to have value'
        ).toHaveValue(new RegExp(areas.validCode));
      });

      await test.step('The corresponding coordinates are saved against the catch record', async () => {
        await statisticalAreaOtherPage.clickSaveAndContinue();
        await speciesSelectionPage.expectOnPage();

        await checkAnswersPage.goto('/check-answers');
        await expect(
          checkAnswersPage.summaryValue(checkAnswers.summaryKeys.statisticalSubArea),
          `Summary value to contain text ${areas.validCode}`
        ).toContainText(areas.validCode);
      });
    }
  );

  test(
    'Displays an error when the statistical sub area code is invalid',
    { tag: ['@ui', '@regression', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage }) => {
      await test.step('The fisher has entered a statistical sub area code', async () => {
        await statisticalAreaOtherPage.typeInAlternativeArea(areas.invalidCode);
      });

      await test.step('The code does not exist in the reference dataset', async () => {
        await statisticalAreaOtherPage.clickSaveAndContinue();
      });

      await test.step(`An error message is displayed stating: "${errorMessages.areas.invalidFormat}"`, async () => {
        await expect(statisticalAreaOtherPage.errorSummary(), 'Error summary to be visible').toBeVisible();
        await expect(
          statisticalAreaOtherPage.errorSummary(),
          `Error summary to contain text ${errorMessages.areas.invalidFormat}`
        ).toContainText(errorMessages.areas.invalidFormat);
        await expect(
          statisticalAreaOtherPage.fieldErrorMessage(),
          `Field error message to contain text ${errorMessages.areas.invalidFormat}`
        ).toContainText(errorMessages.areas.invalidFormat);
      });
    }
  );
});
