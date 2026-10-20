import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddGearPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'What gear did you use?' });

  public readonly pageCaption = (): Locator => this.page.getByTestId('app-add-gear-caption');

  public readonly gearInput = (): Locator => this.page.getByLabel('What gear did you use?');

  public readonly gearResultsList = (): Locator => this.page.locator('#gear-options');

  public readonly hooksHauledInput = (): Locator => this.page.getByLabel('Total hooks hauled');

  public readonly hooksInWaterInput = (): Locator => this.page.getByLabel('Total hooks left in water');

  public readonly gearDimensionInput = (): Locator => this.page.getByLabel(/Gear dimension by number/);

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly gearOption = (gearName: string): Locator =>
    this.page.getByRole('option', { name: gearName, exact: true });

  async searchAndSelectGear(gearName: string): Promise<void> {
    await this.gearInput().fill('');
    await this.gearInput().pressSequentially(gearName);
    await this.gearOption(gearName).click();
    await expect(this.gearInput()).toHaveValue(gearName);
  }
}
