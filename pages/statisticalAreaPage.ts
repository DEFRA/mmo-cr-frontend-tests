import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class StatisticalAreaPage extends BasePage {
  // Uses a regex because the gear name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /Where was most of your catch caught using .*\?/ });

  public readonly mapCanvas = (): Locator => this.page.locator('.app-offline-map__canvas');

  public readonly otherButton = (): Locator => this.page.getByRole('button', { name: 'Other' });

  public readonly zoomInButton = (): Locator => this.page.getByRole('button', { name: 'Zoom in' });

  public readonly zoomOutButton = (): Locator => this.page.getByRole('button', { name: 'Zoom out' });

  public readonly selectedAreaInput = (): Locator => this.page.locator('input[name="statisticalArea"]');

  async clickOther() {
    await this.otherButton().click();
  }

  // To select an area on the canvas map, you usually have to click at specific coordinates
  async clickMapAt(x: number, y: number) {
    await this.mapCanvas().click({ position: { x, y } });
  }
}
