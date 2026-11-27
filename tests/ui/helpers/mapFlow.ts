/**
 * Reusable journeys for selecting a statistical area on the map.
 *
 * @author Randhir Patel
 * @since 2026-10-28
 */
import { expect } from '@playwright/test';
import { type StatisticalAreaPage } from '../../../pages/statisticalAreaPage';
import { type NavigationFlow } from './navigationFlow';
import { ports, vessels } from '../../../test-data/testData';

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

  async openMap(portName = ports.first, vesselName = vessels.testVessel): Promise<string> {
    await this.installCanvasProbe();
    await this.navigationFlow.openStatisticalAreaMap({
      portName,
      vesselName,
      signInOptions: {
        requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
      }
    });
    await expect(this.mapPage.pageHeading(), 'Page heading to be visible').toBeVisible();
    await expect(this.mapPage.mapCanvas(), 'Map canvas to be visible').toBeVisible();
    await expect.poll(() => this.mapPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
    return portName;
  }

  async reloadMap(): Promise<void> {
    await this.mapPage.goto('/statistical-area');
  }

  async fetchSubrectangles(): Promise<SubrectangleReference[]> {
    return (await this.fetchMapData<{ subrectangles: SubrectangleReference[] }>('subrectangles.json')).subrectangles;
  }

  async fetchLandFeatures(): Promise<LandFeature[]> {
    return (await this.fetchMapData<{ land: LandFeature[] }>('land.json')).land;
  }

  private async fetchMapData<T>(file: string): Promise<T> {
    const response = await this.mapPage.page.request.get(`/public/offline-map/${file}`);
    expect(response.ok(), 'Ok to be truthy').toBeTruthy();
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

  private static classifySubrectangle(
    subrectangle: SubrectangleReference,
    land: LandFeature[],
    stopWhen: (hasLand: boolean, hasSea: boolean) => boolean
  ): { hasLand: boolean; hasSea: boolean } {
    let hasLand = false;
    let hasSea = false;
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = subrectangle.bounds;

    for (let longitudeStep = 1; longitudeStep < 12; longitudeStep++) {
      for (let latitudeStep = 1; latitudeStep < 12; latitudeStep++) {
        const point: Point = [
          minLongitude + ((maxLongitude - minLongitude) * longitudeStep) / 12,
          minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 12
        ];
        if (!subrectangle.polygons.some((polygon) => this.pointInPolygon(point, polygon))) continue;

        if (land.some((feature) => feature.polygons.some((polygon) => this.pointInPolygon(point, polygon)))) {
          hasLand = true;
        } else {
          hasSea = true;
        }
        if (stopWhen(hasLand, hasSea)) return { hasLand, hasSea };
      }
    }
    return { hasLand, hasSea };
  }

  static isPartiallySeaBased(subrectangle: SubrectangleReference, land: LandFeature[]): boolean {
    const { hasLand, hasSea } = this.classifySubrectangle(subrectangle, land, (hasLand, hasSea) => hasLand && hasSea);
    return hasLand && hasSea;
  }

  static isWhollySeaBased(subrectangle: SubrectangleReference, land: LandFeature[]): boolean {
    const { hasLand, hasSea } = this.classifySubrectangle(subrectangle, land, (hasLand) => hasLand);
    return !hasLand && hasSea;
  }
}
