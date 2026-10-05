import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class RemoveGearPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1, name: /Remove gear from vessel/i });

  public readonly hintText = (): Locator => this.page.locator('#gearIds-hint');

  public readonly gearCheckboxes = (): Locator => this.page.locator('input.govuk-checkboxes__input[name="gearIds"]');

  public readonly gearCheckbox = (gearName: string): Locator =>
    this.page.getByRole('checkbox', { name: gearName, exact: true });

  public readonly gearHint = (gearName: string): Locator =>
    this.page
      .locator('.govuk-checkboxes__item')
      .filter({ has: this.gearCheckbox(gearName) })
      .locator('.govuk-checkboxes__hint');

  public readonly continueButton = (): Locator => this.page.getByRole('button', { name: 'Continue', exact: true });

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');
  public readonly errorMessage = (): Locator => this.page.locator('.govuk-error-message');

  async selectGearToRemove(...gearNames: string[]) {
    for (const gearName of gearNames) {
      await this.gearCheckbox(gearName).check();
    }
  }

  async clickContinue() {
    await this.continueButton().click();
  }
}
