import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class DeparturePortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Select the port you left from' });

  public readonly portRadio = (portName: string): Locator => this.page.getByLabel(portName);

  public readonly addPortButton = (): Locator => this.page.getByRole('button', { name: 'Add port' });

  async selectPort(portName: string) {
    await this.portRadio(portName).click();
  }

  async clickAddPort() {
    await this.addPortButton().click();
  }
}
