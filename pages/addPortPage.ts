import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddPortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Enter the port or closest port you set off from' });

  public readonly portInput = (): Locator => this.page.getByLabel('Enter the port or closest port you set off from');

  public readonly portResultsList = (): Locator => this.page.locator('#port-results');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly portResultItem = (portName: string): Locator =>
    this.portResultsList().locator('li').filter({ hasText: portName });

  async searchPorts(searchTerm: string): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.portInput().fill(searchTerm);
    await expect(this.portResultsList().getByRole('option').first()).toBeVisible();
  }

  async searchAndSelectPort(portName: string) {
    await this.searchPorts(portName);
    await this.portResultItem(portName).getByRole('option', { name: portName, exact: true }).click();
    await expect(this.portInput()).toHaveValue(portName);
  }
}
