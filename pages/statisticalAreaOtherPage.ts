import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Select or enter a statistical sub-area.
 * Choose a suggested area or search for an alternative area.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class StatisticalAreaOtherPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', {
      name: /Select the statistical sub area where the majority of your catch was caught using .*\?/
    });

  public readonly areaRadio = (areaName: string): Locator => this.page.getByLabel(areaName, { exact: true });

  public readonly otherRadio = (): Locator => this.page.getByLabel('Other', { exact: true });

  // Suggestions depend on the departure port, so tests should not hard-code an area code
  public readonly suggestedAreaRadios = (): Locator =>
    this.page.locator('input[name="statisticalArea"]:not([value="other"])');

  public readonly alternativeAreaInput = (): Locator => this.page.locator('#alternativeStatisticalArea');

  public readonly alternativeAreaResultsList = (): Locator => this.page.locator('#statistical-area-results');

  public readonly alternativeAreaResultItem = (areaName: string): Locator =>
    this.alternativeAreaResultsList().getByText(areaName, { exact: true });

  public readonly alternativeAreaResultItems = (): Locator => this.alternativeAreaResultsList().locator('li');

  public readonly coordinatesDisplay = (areaName: string): Locator =>
    this.alternativeAreaResultsList()
      .getByRole('option')
      .filter({ has: this.page.getByText(areaName, { exact: true }) })
      .locator('.app-statistical-area-search__option-detail');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorSummaryLinks = (): Locator => this.page.locator('.govuk-error-summary__list a');

  public readonly fieldErrorMessage = (): Locator => this.page.locator('#alternativeStatisticalArea-error');

  async selectAreaRadio(areaName: string) {
    await this.page.waitForLoadState('load');
    await this.areaRadio(areaName).check();
  }

  async searchAndSelectAlternativeArea(areaName: string) {
    await this.selectAreaRadio('Other');

    await this.alternativeAreaInput().fill(areaName.slice(0, 2));

    await this.alternativeAreaResultsList().waitFor({ state: 'visible' });
    const matchingArea = this.alternativeAreaResultItem(areaName);
    await matchingArea.waitFor({ state: 'visible' });
    await matchingArea.click();
  }

  async typeInAlternativeArea(text: string) {
    await this.selectAreaRadio('Other');
    await this.alternativeAreaInput().fill(text);
  }
}
