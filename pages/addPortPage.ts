import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddPortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Enter the port or closest port you set off from' });

  public readonly portInput = (): Locator => this.page.getByLabel('Enter the port or closest port you set off from');

  public readonly portResultsList = (): Locator => this.page.locator('#port-results');

  public readonly portResultItem = (portName: string): Locator =>
    this.portResultsList().locator('li').filter({ hasText: portName });

  async searchAndSelectPort(portName: string) {
    await this.portInput().fill(portName);
    await this.portResultsList().waitFor({ state: 'visible' });
    await this.portResultItem(portName).click();
  }
}
