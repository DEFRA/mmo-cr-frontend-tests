import { expect, type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export type MapLabel = { code: string; x: number; y: number };

/**
 * Select a statistical area on the map.
 * Use map controls or choose the alternative area-selection route.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class StatisticalAreaPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Where was the majority of your catch caught?', exact: true });

  // With gears selected the heading names the gear in lower case; name matching is case-insensitive
  public readonly pageHeadingForGear = (gearName?: string): Locator =>
    this.page.getByRole('heading', {
      level: 1,
      name: gearName
        ? `Where was the majority of your catch caught using ${gearName}?`
        : /Where was the majority of your catch caught using /
    });

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

  // Records the codes and positions the map draws on its canvas so tests can read and click sub-rectangles
  async installCanvasProbe(): Promise<void> {
    await this.page.addInitScript(() => {
      const clearRect = CanvasRenderingContext2D.prototype.clearRect;
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      const stroke = CanvasRenderingContext2D.prototype.stroke;

      CanvasRenderingContext2D.prototype.clearRect = function (x, y, width, height) {
        this.canvas.dataset.playwrightMapLabels = '[]';
        this.canvas.dataset.playwrightGridCount = '0';
        this.canvas.dataset.playwrightSelectedGridCount = '0';
        return clearRect.call(this, x, y, width, height);
      };

      CanvasRenderingContext2D.prototype.stroke = function () {
        if (['#0b6b3a', '#e8a63a'].includes(String(this.strokeStyle).toLowerCase())) {
          const count = Number(this.canvas.dataset.playwrightGridCount ?? '0') + 1;
          this.canvas.dataset.playwrightGridCount = String(count);
          if (String(this.strokeStyle).toLowerCase() === '#e8a63a' || this.lineWidth > 1) {
            const selectedCount = Number(this.canvas.dataset.playwrightSelectedGridCount ?? '0') + 1;
            this.canvas.dataset.playwrightSelectedGridCount = String(selectedCount);
          }
        }
        return Reflect.apply(stroke, this, []);
      };

      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (/^\d{2}[A-Z]\d{2}$/i.test(String(text))) {
          const labels = JSON.parse(this.canvas.dataset.playwrightMapLabels ?? '[]') as MapLabel[];
          labels.push({ code: String(text), x, y });
          this.canvas.dataset.playwrightMapLabels = JSON.stringify(labels);
        }
        return maxWidth === undefined ? fillText.call(this, text, x, y) : fillText.call(this, text, x, y, maxWidth);
      };
    });
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

  // Needs installCanvasProbe before the page loads; clicks a sub-rectangle near the middle and returns its code
  async selectMiddleMapArea(): Promise<string> {
    await expect(this.mapCanvas()).toBeVisible();
    await expect.poll(async () => (await this.readMapLabels()).length, { timeout: 15_000 }).toBeGreaterThan(0);
    const labels = await this.readMapLabels();
    const label = labels[Math.floor(labels.length / 2)]!;
    await this.clickMapLabel(label);
    return label.code;
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
