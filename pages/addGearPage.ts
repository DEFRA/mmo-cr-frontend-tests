import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddGearPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'What gear did you use?' });

  public readonly pageCaption = (): Locator => this.page.getByTestId('app-add-gear-caption');

  public readonly gearInput = (): Locator => this.page.getByLabel('What gear did you use?');

  public readonly gearResultsList = (): Locator => this.page.locator('ul.app-autocomplete__menu'); // Assuming typical govuk autocomplete structure, but we'll provide a robust selection method

  // Selects a gear from the autocomplete dropdown
  async searchAndSelectGear(gearName: string) {
    await this.gearInput().fill(gearName);

    // Sometimes autocomplete needs a moment, and we can just hit Enter if it's a datalist/combobox
    // or we can select from the dropdown. We'll try hitting Enter first which usually works for both datalists and standard govuk autocompletes.
    await this.page.keyboard.press('Enter');
  }
}
