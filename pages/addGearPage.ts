import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddGearPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'What gear did you use?' });

  public readonly pageCaption = (): Locator => this.page.getByTestId('app-add-gear-caption');

  public readonly gearInput = (): Locator => this.page.getByLabel('What gear did you use?');

  public readonly gearResultsList = (): Locator => this.page.locator('#gear-options');

  public readonly hooksHauledInput = (): Locator => this.page.getByLabel('Total hooks hauled');

  public readonly hooksInWaterInput = (): Locator => this.page.getByLabel('Total hooks left in water');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  async searchAndSelectGear(gearName: string): Promise<void> {
    await expect(this.gearResultsList().locator(`option[value="${gearName}"]`)).toHaveCount(1);
    await this.gearInput().fill(gearName);
  }
}
