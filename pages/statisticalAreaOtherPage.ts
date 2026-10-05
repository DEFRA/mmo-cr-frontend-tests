import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class StatisticalAreaOtherPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', {
      name: /Select the statistical sub area where the majority of your catch was caught using .*\?/
    });

  public readonly areaRadio = (areaName: string): Locator => this.page.getByLabel(areaName, { exact: true });

  public readonly otherRadio = (): Locator => this.page.getByLabel('Other', { exact: true });

  public readonly alternativeAreaInput = (): Locator => this.page.locator('#alternativeStatisticalArea');

  public readonly alternativeAreaResultsList = (): Locator => this.page.locator('#statistical-area-results');

  public readonly alternativeAreaResultItem = (areaName: string): Locator =>
    this.alternativeAreaResultsList()
      .locator('li')
      .filter({ hasText: new RegExp(`(^|\\s)${areaName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`) })
      .first();

  public readonly alternativeAreaResultItems = (): Locator => this.alternativeAreaResultsList().locator('li');

  public readonly coordinatesDisplay = (): Locator => this.page.locator('#statistical-area-coordinates');

  public readonly noResultsMessage = (): Locator =>
    this.alternativeAreaResultsList()
      .locator('li')
      .filter({ hasText: /no results/i });

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorSummaryLinks = (): Locator => this.page.locator('.govuk-error-summary__list a');

  public readonly fieldErrorMessage = (): Locator => this.page.locator('#alternativeStatisticalArea-error');

  async selectAreaRadio(areaName: string) {
    await this.areaRadio(areaName).click();
  }

  async searchAndSelectAlternativeArea(areaName: string) {
    await this.selectAreaRadio('Other');

    await this.alternativeAreaInput().fill(areaName);

    await this.alternativeAreaResultsList().waitFor({ state: 'visible' });
    await this.alternativeAreaResultItem(areaName).click();
  }

  async typeInAlternativeArea(text: string) {
    await this.selectAreaRadio('Other');
    await this.alternativeAreaInput().fill(text);
  }
}
