import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class RemovePortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1, name: /Remove ports from vessel/i });

  public readonly portCheckbox = (portName: string): Locator =>
    this.page.getByRole('checkbox', { name: portName, exact: true });

  public readonly continueButton = (): Locator => this.page.getByRole('button', { name: 'Continue', exact: true });

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  async removePorts(...portNames: string[]) {
    for (const portName of portNames) {
      await this.portCheckbox(portName).check();
    }
    await this.continueButton().click();
  }
}
