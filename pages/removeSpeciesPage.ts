import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Remove saved favourite species.
 * Select saved species for removal and handle validation messages.
 *
 * @author Randhir Patel
 * @since 2026-10-05
 */
export class RemoveSpeciesPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /Remove species from vessel/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly speciesCheckboxes = (): Locator => this.page.locator('.govuk-checkboxes__input');

  public readonly errorSummary = (): Locator => this.common.errorSummary();

  public readonly errorMessage = (): Locator => this.common.errorMessage();

  public readonly continueButton = (): Locator => this.common.saveAndContinueButton();

  async selectSpeciesToRemove(speciesName: string) {
    await this.speciesCheckbox(speciesName).check();
  }

  async clickContinue() {
    await this.continueButton().click();
  }
}
