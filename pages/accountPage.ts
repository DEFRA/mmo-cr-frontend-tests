import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AccountPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByTestId('app-heading-title');

  public readonly personalDetailsHeading = (): Locator => this.page.getByRole('heading', { name: 'Personal details' });

  public readonly vesselDetailsHeading = (): Locator => this.page.getByRole('heading', { name: 'Vessel details' });

  public readonly vesselNameHeading = (): Locator => this.page.getByRole('heading', { level: 3 });

  public readonly summaryRow = (key: string): Locator =>
    this.page.locator('.govuk-summary-list__row').filter({
      has: this.page.locator('.govuk-summary-list__key', { hasText: key })
    });

  public readonly summaryValue = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__value');

  public readonly gearOnboardValue = (): Locator => this.summaryValue('Gear onboard');

  public readonly addGearLink = (): Locator => this.summaryRow('Gear onboard').getByRole('link', { name: 'Add gear' });

  public readonly removeGearLink = (): Locator =>
    this.summaryRow('Gear onboard').getByRole('link', { name: 'Remove gear' });

  public readonly speciesCaughtValue = (): Locator => this.summaryValue('Species caught');

  public readonly addSpeciesLink = (): Locator =>
    this.summaryRow('Species caught').getByRole('link', { name: 'Add species' });

  public readonly removeSpeciesLink = (): Locator =>
    this.summaryRow('Species caught').getByRole('link', { name: 'Remove species' });

  public readonly portsUsedValue = (): Locator => this.summaryValue('Ports used');

  public readonly addPortLink = (): Locator => this.summaryRow('Ports used').getByRole('link', { name: 'Add port' });

  public readonly removePortLink = (): Locator =>
    this.summaryRow('Ports used').getByRole('link', { name: 'Remove port' });

  public readonly viewAllCatchRecordsButton = (): Locator =>
    this.page.getByRole('button', { name: 'View all catch records' });

  async getGearOnboardText(): Promise<string> {
    const text = await this.gearOnboardValue().textContent();
    return text ? text.trim() : '';
  }

  async clickRemoveGear() {
    await this.removeGearLink().click();
  }

  async clickAddGear() {
    await this.addGearLink().click();
  }
}
