import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class AddSpeciesPage extends BasePage {
  // Uses a regex because the vessel name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /What species did you catch using .*\?/ });

  public readonly speciesInput = (): Locator => this.page.locator('#species');

  // Since this uses an HTML5 datalist, filling the input and pressing Enter typically sets the value.
  async searchAndSelectSpecies(speciesName: string) {
    await this.speciesInput().fill(speciesName);
    await this.page.keyboard.press('Enter');
  }
}
