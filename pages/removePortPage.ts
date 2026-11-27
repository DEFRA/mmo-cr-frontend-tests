import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Remove saved favourite ports.
 * Select one or more saved ports for removal and continue.
 *
 * @author Hemasrivani07
 * @since 2026-10-27
 */
export class RemovePortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1, name: /Remove ports from your favourites/i });

  public readonly portCheckbox = (portName: string): Locator =>
    this.page.getByRole('checkbox', { name: portName, exact: true });

  public readonly continueButton = (): Locator => this.page.getByRole('button', { name: 'Continue', exact: true });

  public readonly errorSummary = (): Locator => this.common.errorSummary();

  async removePorts(...portNames: string[]) {
    for (const portName of portNames) {
      await this.portCheckbox(portName).check();
    }
    await this.continueButton().click();
  }
}
