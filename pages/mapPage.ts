import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

type PanDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Page object for the ICES Statistical sub-rectangle map (CRAR-113).
 * The map is not yet built in the application, so locators use proposed
 * data-testid hooks - confirm/update these against the real markup once the
 * feature ships (see tests/ui/map.spec.ts).
 */
export class MapPage extends BasePage {
  public readonly mapCanvas = (): Locator => this.page.getByTestId('ices-map-canvas');
  public readonly zoomInButton = (): Locator => this.page.getByRole('button', { name: 'Zoom in' });
  public readonly zoomOutButton = (): Locator => this.page.getByRole('button', { name: 'Zoom out' });
  public readonly errorBanner = (): Locator => this.page.getByTestId('ices-map-error');
  public readonly retryButton = (): Locator => this.page.getByRole('button', { name: 'Retry' });
  public readonly missingPortMessage = (): Locator => this.page.getByTestId('ices-map-missing-port');
  public readonly selectedSubRectangleBadge = (): Locator => this.page.getByTestId('ices-map-selected-sub-rectangle');

  public subRectangle(code: string): Locator {
    return this.page.getByTestId(`ices-sub-rectangle-${code}`);
  }

  public visibleSubRectangles(): Locator {
    return this.page.getByTestId(/^ices-sub-rectangle-/);
  }

  async countVisibleSubRectangles(): Promise<number> {
    return this.visibleSubRectangles().count();
  }

  async zoomIn(times = 1): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      await this.zoomInButton().click();
    }
  }

  async zoomOut(times = 1): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      await this.zoomOutButton().click();
    }
  }

  async pan(direction: PanDirection, distance = 150): Promise<void> {
    const map = this.mapCanvas();
    const box = await map.boundingBox();
    if (!box) {
      throw new Error('Map canvas is not visible');
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const offsets: Record<PanDirection, [number, number]> = {
      left: [distance, 0],
      right: [-distance, 0],
      up: [0, distance],
      down: [0, -distance],
    };
    const [dx, dy] = offsets[direction];

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + dx, startY + dy, { steps: 10 });
    await this.page.mouse.up();
  }

  async selectSubRectangle(code: string): Promise<void> {
    await this.subRectangle(code).click();
  }
}
