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
    await this.mapPage.installCanvasProbe();
  }

  async openMap(portName = 'Plymouth', vesselName = 'ACHILLES'): Promise<string> {
    await this.installCanvasProbe();
    await this.navigationFlow.openStatisticalAreaMap({
      portName,
      vesselName,
      signInOptions: {
        requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
      }
    });
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
    const failedSources = new Set<string>();
    await this.mapPage.page.route(
      (url) => ['/public/offline-map/subrectangles.json', '/map-data/statistical-areas'].includes(url.pathname),
      async (route) => {
        const source = new URL(route.request().url()).pathname;
        if (!failedSources.has(source)) {
          failedSources.add(source);
          await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
          return;
        }
        await route.continue();
      }
    );
  }

  private static pointInRing([longitude, latitude]: Point, ring: Point[]): boolean {
    let inside = false;
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
      const [currentLongitude, currentLatitude] = ring[index]!;
      const [previousLongitude, previousLatitude] = ring[previous]!;
      const crossesLatitude = currentLatitude > latitude !== previousLatitude > latitude;
      if (
        crossesLatitude &&
        longitude <
          ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
            (previousLatitude - currentLatitude) +
            currentLongitude
      ) {
        inside = !inside;
      }
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

  static isWhollySeaBased(subrectangle: SubrectangleReference, land: LandFeature[]): boolean {
    let hasSeaSample = false;
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = subrectangle.bounds;

    for (let longitudeStep = 1; longitudeStep < 12; longitudeStep++) {
      for (let latitudeStep = 1; latitudeStep < 12; latitudeStep++) {
        const point: Point = [
          minLongitude + ((maxLongitude - minLongitude) * longitudeStep) / 12,
          minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 12
        ];
        if (!subrectangle.polygons.some((polygon) => this.pointInPolygon(point, polygon))) continue;
        if (land.some((feature) => feature.polygons.some((polygon) => this.pointInPolygon(point, polygon))))
          return false;
        hasSeaSample = true;
      }
    }

    return hasSeaSample;
  }
}
