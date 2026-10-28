import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class RemoveSpeciesPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /Remove species from vessel/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly speciesCheckboxes = (): Locator => this.page.locator('.govuk-checkboxes__input');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorMessage = (): Locator => this.page.locator('.govuk-error-message');

  public readonly continueButton = (): Locator => this.common.saveAndContinueButton();

  async selectSpeciesToRemove(speciesName: string) {
    await this.speciesCheckbox(speciesName).check();
  }

  async clickContinue() {
    await this.continueButton().click();
  }
}
