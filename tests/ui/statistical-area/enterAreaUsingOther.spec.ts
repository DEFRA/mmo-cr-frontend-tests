/**
 * A fisher whose statistical sub area is not in the suggested list selects "Other" and uses a type-ahead field
 * to search for and select the correct statistical sub area code, with matching coordinates shown and stored.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';

const VALID_AREA_CODE: string = '46D86';
const SEARCH_TERM: string = VALID_AREA_CODE.slice(0, 2);
const ADDITIONAL_CHARACTERS: string = VALID_AREA_CODE.slice(2);
const INVALID_AREA_CODE: string = 'ZZZZZ';
const AREA_CODE_PATTERN: RegExp = /\d{2}[A-Z]\d{2}/;
const COORDINATES_PATTERN: RegExp = /[-\u2212]?\d+\.\d+,\s*[-\u2212]?\d+\.\d+/;
const CHECK_ANSWERS_AREA_KEY: string = 'Statistical sub area';
const INVALID_AREA_MESSAGE: string = 'Enter a statistical subrectangle in the correct format, for example 38E84';
const OTHER_OPTION: string = 'Other';

test.describe('Enter statistical sub area using the Other option', () => {
  test.beforeEach(async ({ navigationFlow }) => {
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
        await expect(statisticalAreaOtherPage.areaRadio(VALID_AREA_CODE)).toHaveCount(0);
      });

      await test.step('The fisher selects the "Other" radio button', async () => {
        await statisticalAreaOtherPage.selectAreaRadio(OTHER_OPTION);
      });

      await test.step('A type-ahead input field is displayed', async () => {
        await expect(statisticalAreaOtherPage.otherRadio()).toBeChecked();
        await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeVisible();
        await expect(statisticalAreaOtherPage.alternativeAreaInput()).toBeEditable();
      });

      await test.step('The fisher can manually enter a statistical sub area code', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(VALID_AREA_CODE);
        await expect(statisticalAreaOtherPage.alternativeAreaInput()).toHaveValue(VALID_AREA_CODE);
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
        await statisticalAreaOtherPage.selectAreaRadio(OTHER_OPTION);
      });

      await test.step('The fisher enters two or more characters into the type-ahead field', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(SEARCH_TERM);
      });

      await test.step('Matching statistical sub area codes are displayed in a dropdown list', async () => {
        await expect(statisticalAreaOtherPage.alternativeAreaResultsList()).toBeVisible();
        await expect(statisticalAreaOtherPage.alternativeAreaResultItem(VALID_AREA_CODE)).toBeVisible();
      });

      await test.step('Each matching result displays the statistical sub area code, associated coordinates and related ICES rectangle (where applicable)', async () => {
        await expect(statisticalAreaOtherPage.coordinatesDisplay(VALID_AREA_CODE)).toContainText(COORDINATES_PATTERN);

        for (const resultItem of await statisticalAreaOtherPage.alternativeAreaResultItems().all()) {
          await expect(resultItem).toContainText(SEARCH_TERM);
          await expect(resultItem).toContainText(AREA_CODE_PATTERN);
          await expect(resultItem).toContainText(COORDINATES_PATTERN);
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
        await statisticalAreaOtherPage.selectAreaRadio(OTHER_OPTION);
        await statisticalAreaOtherPage.alternativeAreaInput().focus();
      });

      await test.step('The entered value matches a valid statistical sub area', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().fill(SEARCH_TERM);
      });

      await test.step('The corresponding coordinates are displayed automatically', async () => {
        const coordinates = statisticalAreaOtherPage.coordinatesDisplay(VALID_AREA_CODE);
        await expect(coordinates).toBeVisible();
        await expect(coordinates).toContainText(COORDINATES_PATTERN);
        initialCoordinates = (await coordinates.innerText()).match(COORDINATES_PATTERN)?.[0];
      });

      await test.step('The coordinates update dynamically as additional characters are entered', async () => {
        await statisticalAreaOtherPage.alternativeAreaInput().pressSequentially(ADDITIONAL_CHARACTERS);
        await expect(statisticalAreaOtherPage.alternativeAreaInput()).toHaveValue(VALID_AREA_CODE);

        await expect(statisticalAreaOtherPage.alternativeAreaResultItems().first()).toContainText(VALID_AREA_CODE);
        const coordinates = statisticalAreaOtherPage.coordinatesDisplay(VALID_AREA_CODE);
        await expect(coordinates).toBeVisible();
        expect(initialCoordinates).toBeDefined();
        await expect(coordinates).toContainText(initialCoordinates ?? '');
      });
    }
  );

  test(
    'Saves the area code when a suggested result is selected',
    { tag: ['@ui', '@smoke', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage, checkAnswersPage }) => {
      test.info().annotations.push({
        type: 'unverified',
        description: 'Check answers evidence covers the area code only; stored coordinates are not asserted'
      });

      await test.step('One or more matching statistical sub areas are displayed', async () => {
        await statisticalAreaOtherPage.typeInAlternativeArea(SEARCH_TERM);
        await statisticalAreaOtherPage.alternativeAreaResultItem(VALID_AREA_CODE).waitFor({ state: 'visible' });
      });

      await test.step('The fisher selects a result from the dropdown', async () => {
        await statisticalAreaOtherPage.alternativeAreaResultItem(VALID_AREA_CODE).click();
      });

      await test.step('The statistical sub area code is populated into the field', async () => {
        await expect(statisticalAreaOtherPage.alternativeAreaInput()).toHaveValue(new RegExp(VALID_AREA_CODE));
      });

      await test.step('The corresponding coordinates are saved against the catch record', async () => {
        await statisticalAreaOtherPage.clickSaveAndContinue();
        await expect(statisticalAreaOtherPage.page).not.toHaveURL(/\/statistical-area-other/);

        await checkAnswersPage.goto('/check-answers');
        await expect(checkAnswersPage.summaryValue(CHECK_ANSWERS_AREA_KEY)).toContainText(VALID_AREA_CODE);
      });
    }
  );

  test(
    'Displays an error when the statistical sub area code is invalid',
    { tag: ['@ui', '@regression', '@statisticalAreaManualEntry'] },
    async ({ statisticalAreaOtherPage }) => {
      await test.step('The fisher has entered a statistical sub area code', async () => {
        await statisticalAreaOtherPage.typeInAlternativeArea(INVALID_AREA_CODE);
      });

      await test.step('The code does not exist in the reference dataset', async () => {
        await statisticalAreaOtherPage.clickSaveAndContinue();
      });

      await test.step(`An error message is displayed stating: "${INVALID_AREA_MESSAGE}"`, async () => {
        await expect(statisticalAreaOtherPage.errorSummary()).toBeVisible();
        await expect(statisticalAreaOtherPage.errorSummary()).toContainText(INVALID_AREA_MESSAGE);
        await expect(statisticalAreaOtherPage.fieldErrorMessage()).toContainText(INVALID_AREA_MESSAGE);
      });
    }
  );
});
