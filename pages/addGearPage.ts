import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddGearPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'What gear did you use?' });

  public readonly pageCaption = (): Locator => this.page.getByTestId('app-add-gear-caption');

  public readonly gearInput = (): Locator => this.page.getByLabel('What gear did you use?');

  public readonly gearResultsList = (): Locator => this.page.getByRole('listbox');

  public readonly hooksHauledInput = (): Locator => this.page.getByLabel('Total hooks hauled');

  public readonly hooksInWaterInput = (): Locator => this.page.getByLabel('Total hooks left in water');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  async searchGearOptions(searchTerm: string): Promise<string[]> {
    if (searchTerm.length < 2) {
      throw new Error('Gear searches require at least two characters');
    }

    await this.gearInput().fill(searchTerm);
    const options = this.gearResultsList().getByRole('option');
    await expect(options.first()).toBeVisible();
    return (await options.allTextContents()).map((name) => name.trim());
  }

  async searchAndSelectGear(gearName: string): Promise<void> {
    await this.searchGearOptions(gearName.slice(0, 2));
    await this.gearResultsList().getByRole('option', { name: gearName, exact: true }).click();
    await expect(this.gearInput()).toHaveValue(gearName);
  }
}
