import { type Locator } from '@playwright/test';
import { vessels } from '../test-data/testData';
import { BasePage, escapeRegExp } from './basePage';

/**
 * View account details and saved selections.
 * Access personal and vessel information and manage favourite species, gear and ports.
 *
 * @author Randhir Patel
 * @since 2026-10-05
 */
export class AccountPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'Your account', exact: true });

  public readonly personalDetailsHeading = (): Locator => this.page.getByRole('heading', { name: 'Personal details' });

  public readonly vesselDetailsHeading = (): Locator => this.page.getByRole('heading', { name: 'Vessel details' });

  public readonly vesselNameHeading = (vesselName: string): Locator =>
    this.page.getByRole('heading', {
      level: 3,
      name: new RegExp(`^${escapeRegExp(vesselName)}\\s*\\(`)
    });

  /** Summary list under a vessel heading; defaults to the configured test vessel. */
  public readonly vesselSummary = (vesselName: string = vessels.testVessel): Locator =>
    this.vesselNameHeading(vesselName).locator('xpath=following-sibling::dl[1]');

  public readonly summaryRow = (key: string, vesselName: string = vessels.testVessel): Locator =>
    this.summaryRowIn(this.vesselSummary(vesselName), new RegExp(`^\\s*${escapeRegExp(key)}\\s*$`)).first();

  public readonly summaryValue = (key: string, vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow(key, vesselName).locator('.govuk-summary-list__value');

  public readonly gearOnboardValue = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryValue('Gear onboard', vesselName);

  public readonly addGearLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Gear onboard', vesselName).getByRole('link', { name: 'Add gear' });

  public readonly removeGearLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Gear onboard', vesselName).getByRole('link', { name: 'Remove gear' });

  public readonly speciesCaughtValue = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryValue('Species caught', vesselName);

  public readonly addSpeciesLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Species caught', vesselName).getByRole('link', { name: 'Add species' });

  public readonly removeSpeciesLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Species caught', vesselName).getByRole('link', { name: 'Remove species' });

  public readonly portsUsedValue = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryValue('Ports used', vesselName);

  public readonly addPortLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Ports used', vesselName).getByRole('link', { name: 'Add port' });

  public readonly removePortLink = (vesselName: string = vessels.testVessel): Locator =>
    this.summaryRow('Ports used', vesselName).getByRole('link', { name: 'Remove port' });

  public readonly viewAllCatchRecordsButton = (): Locator =>
    this.page.getByRole('button', { name: 'View all catch records' });

  async getPortsUsed(vesselName: string = vessels.testVessel): Promise<string[]> {
    return this.listValues(this.portsUsedValue(vesselName));
  }

  async getSpeciesCaught(vesselName: string = vessels.testVessel): Promise<string[]> {
    return this.listValues(this.speciesCaughtValue(vesselName));
  }

  private async listValues(value: Locator): Promise<string[]> {
    return (await value.innerText())
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async getGearOnboardText(vesselName: string = vessels.testVessel): Promise<string> {
    const text = await this.gearOnboardValue(vesselName).textContent();
    return text ? text.trim() : '';
  }

  async clickRemoveGear(vesselName: string = vessels.testVessel) {
    await this.removeGearLink(vesselName).click();
  }

  async clickAddGear(vesselName: string = vessels.testVessel) {
    await this.addGearLink(vesselName).click();
  }
}
