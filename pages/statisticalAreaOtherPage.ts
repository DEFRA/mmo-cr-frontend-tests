import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class StatisticalAreaOtherPage extends BasePage {
  // Uses a regex because the gear name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', {
      name: /Select the statistical sub area where the majority of your catch was caught using .*\?/,
    });

  // Allows selecting a specific area radio button (including "Other")
  public readonly areaRadio = (areaName: string): Locator => this.page.getByLabel(areaName, { exact: true });

  public readonly alternativeAreaInput = (): Locator => this.page.locator('#alternativeStatisticalArea');

  public readonly alternativeAreaResultsList = (): Locator => this.page.locator('#statistical-area-results');

  public readonly alternativeAreaResultItem = (areaName: string): Locator =>
    this.alternativeAreaResultsList().locator('li').filter({ hasText: areaName });

  async selectAreaRadio(areaName: string) {
    await this.areaRadio(areaName).click();
  }

  async searchAndSelectAlternativeArea(areaName: string) {
    // First, select 'Other' to reveal the search input
    await this.selectAreaRadio('Other');

    // Type the area to search
    await this.alternativeAreaInput().fill(areaName);

    // Wait for the autocomplete dropdown and select the option
    await this.alternativeAreaResultsList().waitFor({ state: 'visible' });
    await this.alternativeAreaResultItem(areaName).click();
  }
}
