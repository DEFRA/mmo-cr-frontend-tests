import { expect } from '@playwright/test';
import { type MapLabel, type StatisticalAreaPage } from '../../../pages/statisticalAreaPage';
import { type NavigationFlow } from './navigationFlow';

type Point = [number, number];
type MapPolygon = { exterior: Point[]; holes: Point[][] };
type MapBounds = { minLongitude: number; maxLongitude: number; minLatitude: number; maxLatitude: number };
export type SubrectangleReference = {
  subCode: string;
  overlapsSea: boolean;
  bounds: MapBounds;
  polygons: MapPolygon[];
};
export type LandFeature = { polygons: MapPolygon[] };

export class MapFlow {
  constructor(
    private readonly mapPage: StatisticalAreaPage,
    private readonly navigationFlow: NavigationFlow
  ) {}

  async installCanvasProbe(): Promise<void> {
    await this.mapPage.page.addInitScript(() => {
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
          if (String(this.strokeStyle).toLowerCase() === '#e8a63a') {
            const selectedCount = Number(this.canvas.dataset.playwrightSelectedGridCount ?? '0') + 1;
            this.canvas.dataset.playwrightSelectedGridCount = String(selectedCount);
          }
        }
        return Reflect.apply(stroke, this, []);
      };

      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        const labels = JSON.parse(this.canvas.dataset.playwrightMapLabels ?? '[]') as MapLabel[];
        labels.push({ code: String(text), x, y });
        this.canvas.dataset.playwrightMapLabels = JSON.stringify(labels);
        return maxWidth === undefined ? fillText.call(this, text, x, y) : fillText.call(this, text, x, y, maxWidth);
      };
    });
  }

  async openMap(): Promise<string> {
    await this.navigationFlow.signIn({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
    });
    const portName = 'Plymouth';
    await this.navigationFlow.selectDeparturePort(portName);
    await this.installCanvasProbe();
    await this.mapPage.goto('/statistical-area');
    await expect(this.mapPage.pageHeading()).toBeVisible();
    await expect(this.mapPage.mapCanvas()).toBeVisible();
    await expect.poll(() => this.mapPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
    return portName;
  }

  async fetchSubrectangles(): Promise<SubrectangleReference[]> {
    return (await this.fetchMapData<{ subrectangles: SubrectangleReference[] }>('subrectangles.json')).subrectangles;
  }

  async fetchLandFeatures(): Promise<LandFeature[]> {
    return (await this.fetchMapData<{ land: LandFeature[] }>('land.json')).land;
  }

  private async fetchMapData<T>(file: string): Promise<T> {
    const response = await this.mapPage.page.request.get(`/public/offline-map/${file}`);
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as T;
  }

  async failFirstSubrectanglesRequest(): Promise<void> {
    let firstRequest = true;
    await this.mapPage.page.route('**/public/offline-map/subrectangles.json', async (route) => {
      if (firstRequest) {
        firstRequest = false;
        await route.abort();
        return;
      }
      await route.continue();
    });
  }

  private static pointInRing([longitude, latitude]: Point, ring: Point[]): boolean {
    let inside = false;
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
      const [currentLongitude, currentLatitude] = ring[index]!;
      const [previousLongitude, previousLatitude] = ring[previous]!;
      const crossesLatitude = currentLatitude > latitude !== previousLatitude > latitude;
      const intersectionLongitude =
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) / (previousLatitude - currentLatitude) +
        currentLongitude;
      if (crossesLatitude && longitude < intersectionLongitude) inside = !inside;
    }
    return inside;
  }

  private static pointInPolygon(point: Point, polygon: MapPolygon): boolean {
    return this.pointInRing(point, polygon.exterior) && !polygon.holes.some((hole) => this.pointInRing(point, hole));
  }

  static isPartiallySeaBased(subrectangle: SubrectangleReference, land: LandFeature[]): boolean {
    let hasLandSample = false;
    let hasSeaSample = false;
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = subrectangle.bounds;

    for (let longitudeStep = 1; longitudeStep < 12; longitudeStep++) {
      for (let latitudeStep = 1; latitudeStep < 12; latitudeStep++) {
        const point: Point = [
          minLongitude + ((maxLongitude - minLongitude) * longitudeStep) / 12,
          minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 12
        ];
        if (!subrectangle.polygons.some((polygon) => this.pointInPolygon(point, polygon))) continue;

        if (land.some((feature) => feature.polygons.some((polygon) => this.pointInPolygon(point, polygon)))) {
          hasLandSample = true;
        } else {
          hasSeaSample = true;
        }
        if (hasLandSample && hasSeaSample) return true;
      }
    }
    return false;
  }
}
