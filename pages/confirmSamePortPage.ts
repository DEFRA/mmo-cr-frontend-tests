import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class ConfirmSamePortPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', {
      name: /Was .* the port or the closest port you set off from and returned to\?/
    });

  public readonly yesRadio = (): Locator => this.page.getByLabel('Yes');
  public readonly noRadio = (): Locator => this.page.getByLabel('No');

  public readonly addAnotherPortButton = (): Locator => this.page.getByRole('button', { name: 'Add another port' });

  async selectSamePort(isSamePort: boolean) {
    if (isSamePort) {
      await this.yesRadio().click();
    } else {
      await this.noRadio().click();
    }
  }

  async clickAddAnotherPort() {
    await this.addAnotherPortButton().click();
  }
}
