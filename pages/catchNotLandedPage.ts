import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Record catch that will not be landed straight away.
 * Select whether any catch will be landed later.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class CatchNotLandedPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Is there any catch you won’t be landing straight away?' });

  public readonly yesRadio = (): Locator => this.page.getByLabel('Yes');
  public readonly noRadio = (): Locator => this.page.getByLabel('No');

  async selectCatchNotLanded(notLanded: boolean) {
    if (notLanded) {
      await this.yesRadio().click();
    } else {
      await this.noRadio().click();
    }
  }
}
