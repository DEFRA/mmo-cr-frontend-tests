import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { searchTermFor } from '../utils/search';

/**
 * Select a port from the catalogue.
 * Search approved ports and select a result, including handling validation messages.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class AddPortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Enter the port or closest port you set off from' });

  public readonly returnPortHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Enter the port or closest port you returned to' });

  public readonly portInput = (): Locator =>
    this.page.getByLabel(/Enter the port or closest port you (set off from|returned to)|Add a port to your favourites/);

  public readonly portResultsList = (): Locator => this.page.locator('#port-results');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly portResultItem = (portName: string): Locator =>
    this.portResultsList().locator('li').filter({ hasText: portName });

  async searchPorts(searchTerm: string): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.portInput().fill(searchTerm);
    await expect(this.portResultsList().getByRole('option').first(), 'Port results list to be visible').toBeVisible();
  }

  async searchAndSelectPort(portName: string) {
    await this.searchPorts(searchTermFor(portName));
    await this.portResultItem(portName).getByRole('option', { name: portName, exact: true }).click();
    await expect(this.portInput(), `Port input to have value ${portName}`).toHaveValue(portName);
  }
}
