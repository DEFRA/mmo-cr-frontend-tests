import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export type MapLabel = { code: string; x: number; y: number };

export class StatisticalAreaPage extends BasePage {
  // Uses a regex because the gear name is dynamically inserted into the heading
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /Where was most of your catch caught using .*\?/ });

  public readonly mapCanvas = (): Locator => this.page.locator('.app-offline-map__canvas');

  public readonly mapRegion = (): Locator => this.page.locator('[data-statistical-area-map]');

  public readonly mapError = (): Locator => this.page.locator('[data-statistical-area-map-error]');

  public readonly retryButton = (): Locator => this.page.getByRole('button', { name: 'Retry' });

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

  async readMapLabels(): Promise<MapLabel[]> {
    return this.mapCanvas().evaluate((canvas) => {
      return JSON.parse((canvas as HTMLCanvasElement).dataset.playwrightMapLabels ?? '[]') as MapLabel[];
    });
  }

  async readMapSubrectangleCount(): Promise<number> {
    return this.mapCanvas().evaluate((canvas) =>
      Number((canvas as HTMLCanvasElement).dataset.playwrightGridCount ?? '0')
    );
  }

  async readSelectedGridCount(): Promise<number> {
    return this.mapCanvas().evaluate((canvas) =>
      Number((canvas as HTMLCanvasElement).dataset.playwrightSelectedGridCount ?? '0')
    );
  }

  async clickMapLabel(label: MapLabel): Promise<void> {
    const pixelRatio = await this.page.evaluate(() => window.devicePixelRatio || 1);
    await this.clickMapAt((label.x - 4) / pixelRatio, (label.y + 4) / pixelRatio);
  }

  async canvasFingerprint(): Promise<string> {
    return this.mapCanvas().evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const pixels = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
      if (!pixels) {
        throw new Error('The map canvas could not be read');
      }

      let hash = 2166136261;
      for (let index = 0; index < pixels.length; index += 8) {
        hash = Math.imul(hash ^ pixels[index]!, 16777619);
      }
      return `${canvas.width}x${canvas.height}:${hash >>> 0}`;
    });
  }

  async dragMap(offsetX: number, offsetY: number): Promise<void> {
    await this.mapCanvas().scrollIntoViewIfNeeded();
    const bounds = await this.mapCanvas().boundingBox();
    if (!bounds) {
      throw new Error('The statistical area map canvas has no visible bounds');
    }

    const startX = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + offsetX, startY + offsetY, { steps: 5 });
    await this.page.mouse.up();
  }
}
