import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class RemoveSpeciesPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: /Remove a species/ });

  public readonly speciesCheckbox = (speciesName: string): Locator => this.page.getByLabel(speciesName);

  public readonly speciesCheckboxes = (): Locator => this.page.locator('.govuk-checkboxes__input');

  public readonly errorSummary = (): Locator => this.page.locator('.govuk-error-summary');

  public readonly errorMessage = (): Locator => this.page.locator('.govuk-error-message');

  async selectSpeciesToRemove(speciesName: string) {
    await this.speciesCheckbox(speciesName).check();
  }

  async getVisibleSpeciesCount(): Promise<number> {
    return await this.speciesCheckboxes().count();
  }
}
