import { type Page } from '@playwright/test';
import { expect, test } from '../../fixtures/commonfixture';
import { type SigninPage } from '../../pages/sign-in.page';
import { type MapLabel, type StatisticalAreaPage } from '../../pages/statisticalAreaPage';
import { AddPortPage } from '../../pages/addPortPage';
import { ConfirmSamePortPage } from '../../pages/confirmSamePortPage';
import { NavigationFlow } from './helpers/navigationFlow';

type Point = [number, number];
type MapPolygon = { exterior: Point[]; holes: Point[][] };
type MapBounds = { minLongitude: number; maxLongitude: number; minLatitude: number; maxLatitude: number };
type SubrectangleReference = { subCode: string; overlapsSea: boolean; bounds: MapBounds; polygons: MapPolygon[] };
type LandFeature = { polygons: MapPolygon[] };

async function installCanvasProbe(page: StatisticalAreaPage['page']): Promise<void> {
  await page.addInitScript(() => {
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

async function openMap(signInPage: SigninPage, page: Page, mapPage: StatisticalAreaPage): Promise<string> {
  await NavigationFlow.signIn(signInPage, {
    requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
  });
  const portName = 'Plymouth';
  await NavigationFlow.selectDeparturePort(new AddPortPage(page), new ConfirmSamePortPage(page), portName);
  await installCanvasProbe(mapPage.page);
  await mapPage.goto('/statistical-area');
  await expect(mapPage.pageHeading()).toBeVisible();
  await expect(mapPage.mapCanvas()).toBeVisible();
  await expect.poll(async () => mapPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  return portName;
}

function pointInRing([longitude, latitude]: Point, ring: Point[]): boolean {
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

function pointInPolygon(point: Point, polygon: MapPolygon): boolean {
  return pointInRing(point, polygon.exterior) && !polygon.holes.some((hole) => pointInRing(point, hole));
}

function isPartiallySeaBased(subrectangle: SubrectangleReference, land: LandFeature[]): boolean {
  let hasLandSample = false;
  let hasSeaSample = false;
  const { minLongitude, maxLongitude, minLatitude, maxLatitude } = subrectangle.bounds;

  for (let longitudeStep = 1; longitudeStep < 12; longitudeStep++) {
    for (let latitudeStep = 1; latitudeStep < 12; latitudeStep++) {
      const point: Point = [
        minLongitude + ((maxLongitude - minLongitude) * longitudeStep) / 12,
        minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 12
      ];
      if (!subrectangle.polygons.some((polygon) => pointInPolygon(point, polygon))) continue;

      if (land.some((feature) => feature.polygons.some((polygon) => pointInPolygon(point, polygon)))) {
        hasLandSample = true;
      } else {
        hasSeaSample = true;
      }
      if (hasLandSample && hasSeaSample) return true;
    }
  }
  return false;
}

test.describe('Map full story - ICES statistical sub-rectangle map', () => {
  test('opens around the declared departure port and displays at least nine relevant sub-rectangles', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    const portName = await openMap(signInPage, page, statisticalAreaPage);
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', portName);

    expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('zooming out can display more than nine rectangles when the visible area permits', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    await statisticalAreaPage.zoomOutButton().click();

    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(9);
  });

  test('NFR2 - map fits a larger browser viewport and retains the minimum display', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.reload();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);

    const resizedBounds = await statisticalAreaPage.mapCanvas().boundingBox();
    expect(resizedBounds?.width).toBeGreaterThan(0);
    expect(resizedBounds?.height).toBeGreaterThan(0);
  });

  test('zoom controls update the visible map area and sub-rectangles', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialImage = await statisticalAreaPage.canvasFingerprint();
    const initialCount = await statisticalAreaPage.readMapSubrectangleCount();

    await statisticalAreaPage.zoomOutButton().click();
    await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
    const zoomedOutCount = await statisticalAreaPage.readMapSubrectangleCount();
    expect(zoomedOutCount).toBeGreaterThanOrEqual(initialCount);

    for (let zoom = 0; zoom < 8; zoom++) {
      await statisticalAreaPage.zoomInButton().click();
    }
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeLessThan(zoomedOutCount);
  });

  for (const direction of [
    { title: 'left', x: -60, y: 0 },
    { title: 'right', x: 60, y: 0 },
    { title: 'up', x: 0, y: -60 },
    { title: 'down', x: 0, y: 60 }
  ]) {
    test(`panning ${direction.title} updates the visible map`, async ({ signInPage, page, statisticalAreaPage }) => {
      await openMap(signInPage, page, statisticalAreaPage);
      await statisticalAreaPage.zoomInButton().click();
      await statisticalAreaPage.zoomInButton().click();
      const initialImage = await statisticalAreaPage.canvasFingerprint();

      await statisticalAreaPage.dragMap(direction.x, direction.y);

      await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
      expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(0);
    });
  }

  test('selecting a visible sea sub-rectangle stores its ICES code', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const labels = await statisticalAreaPage.readMapLabels();
    const selectedLabel = labels[Math.floor(labels.length / 2)];
    expect(selectedLabel).toBeDefined();
    if (!selectedLabel) {
      throw new Error('No selectable ICES sub-rectangle labels were rendered');
    }
    expect(selectedLabel.code).toMatch(/^\d{2}[A-Z]\d{2}$/i);

    await statisticalAreaPage.clickMapLabel(selectedLabel);
    await expect(page).toHaveURL(/\/species-selection$/);

    await statisticalAreaPage.goto('/statistical-area');
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', selectedLabel.code);
  });

  test('a sub-rectangle containing both land and sea can be selected', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const [subrectangleResponse, landResponse] = await Promise.all([
      page.request.get('/public/offline-map/subrectangles.json'),
      page.request.get('/public/offline-map/land.json')
    ]);
    expect(subrectangleResponse.ok()).toBeTruthy();
    expect(landResponse.ok()).toBeTruthy();
    const subrectangles = (await subrectangleResponse.json()) as { subrectangles: SubrectangleReference[] };
    const landData = (await landResponse.json()) as { land: LandFeature[] };
    const visibleLabels = await statisticalAreaPage.readMapLabels();
    const visibleCodes = new Set(visibleLabels.map(({ code }) => code));
    const partial = subrectangles.subrectangles.find(
      (subrectangle) =>
        subrectangle.overlapsSea &&
        visibleCodes.has(subrectangle.subCode) &&
        isPartiallySeaBased(subrectangle, landData.land)
    );
    expect(partial, 'The initial map should include a sub-rectangle overlapping both land and sea').toBeDefined();
    if (!partial) throw new Error('No partially sea-based sub-rectangle is visible');

    const label = visibleLabels.find(({ code }) => code === partial.subCode);
    expect(label).toBeDefined();
    if (!label) throw new Error('The partially sea-based sub-rectangle has no visible map label');
    await statisticalAreaPage.clickMapLabel(label);
    await expect(page).toHaveURL(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', partial.subCode);
  });

  test('selected sub-rectangle is visibly highlighted after returning to the map', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const visibleLabels = await statisticalAreaPage.readMapLabels();
    const label = visibleLabels[Math.floor(visibleLabels.length / 2)];
    expect(label).toBeDefined();
    if (!label) throw new Error('No visible ICES sub-rectangle is available to select');

    await statisticalAreaPage.clickMapLabel(label);
    await expect(page).toHaveURL(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', label.code);
    await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
  });

  test('selecting another sub-rectangle replaces the prior selection', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialLabels = await statisticalAreaPage.readMapLabels();
    const middleIndex = Math.floor(initialLabels.length / 2);
    const first = initialLabels[middleIndex];
    const second = initialLabels[middleIndex + 1] ?? initialLabels[middleIndex - 1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) throw new Error('At least two visible sub-rectangles are required');

    await statisticalAreaPage.clickMapLabel(first);
    await expect(page).toHaveURL(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', first.code);

    const currentLabels = await statisticalAreaPage.readMapLabels();
    const replacement = currentLabels.find(({ code }) => code === second.code);
    expect(replacement).toBeDefined();
    if (!replacement) throw new Error('The second sub-rectangle is not visible after revisiting the map');
    await statisticalAreaPage.clickMapLabel(replacement);
    await expect(page).toHaveURL(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', second.code);
    await expect(statisticalAreaPage.selectedAreaInput()).toHaveCount(1);
    await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
  });

  test('BR8 - land-only sub-rectangles are excluded from the visible map', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const response = await page.request.get('/public/offline-map/subrectangles.json');
    expect(response.ok()).toBeTruthy();
    const referenceData = (await response.json()) as { subrectangles: SubrectangleReference[] };
    const seaCodes = new Set(
      referenceData.subrectangles.filter(({ overlapsSea }) => overlapsSea).map(({ subCode }) => subCode)
    );
    const visibleCodes = (await statisticalAreaPage.readMapLabels()).map(({ code }) => code);

    expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
    for (const code of visibleCodes) {
      expect(seaCodes.has(code), `${code} should overlap the sea`).toBeTruthy();
    }
  });

  test('redirects to departure-port selection when no departure port is set', async ({
    signInPage,
    page,
    statisticalAreaPage,
    addPortPage
  }) => {
    await NavigationFlow.signIn(signInPage, {
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
    });
    await page.goto('/statistical-area');

    await expect(page).toHaveURL(/\/add-port\?for=departure&entry=1$/);
    await expect(addPortPage.pageHeading()).toBeVisible();
    await expect(statisticalAreaPage.mapRegion()).toHaveCount(0);
  });

  test('reports map-data failure and allows retry without enabling map selection', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await NavigationFlow.signIn(signInPage, {
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
    });
    await NavigationFlow.selectDeparturePort(new AddPortPage(page), new ConfirmSamePortPage(page), 'Plymouth');

    let firstRequest = true;
    await page.route('**/public/offline-map/subrectangles.json', async (route) => {
      if (firstRequest) {
        firstRequest = false;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await installCanvasProbe(page);
    await page.goto('/statistical-area');

    const error = statisticalAreaPage.mapError();
    await expect(error).toBeVisible();
    await expect(error).toContainText('The map could not be loaded');
    await expect(statisticalAreaPage.selectedAreaInput()).toBeDisabled();
    await expect(statisticalAreaPage.mapCanvas()).toHaveAttribute('hidden', '');

    await statisticalAreaPage.retryButton().click();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(error).toBeHidden();
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('map and controls remain usable at a narrow browser width', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    await page.setViewportSize({ width: 700, height: 900 });
    await page.reload();

    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(statisticalAreaPage.zoomInButton()).toBeVisible();
    await expect(statisticalAreaPage.zoomOutButton()).toBeVisible();
    const bounds = await statisticalAreaPage.mapCanvas().boundingBox();
    expect(bounds?.width).toBeGreaterThan(0);
    expect(bounds?.height).toBeGreaterThan(0);
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('refreshing the map page reinitializes the map without losing the trip context', async ({
    signInPage,
    page,
    statisticalAreaPage
  }) => {
    const portName = await openMap(signInPage, page, statisticalAreaPage);
    await page.reload();

    await expect(statisticalAreaPage.pageHeading()).toBeVisible();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', portName);
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('NFR1 - zoom controls are labelled and keyboard operable', async ({ signInPage, page, statisticalAreaPage }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialImage = await statisticalAreaPage.canvasFingerprint();

    await expect(statisticalAreaPage.zoomInButton()).toHaveAccessibleName('Zoom in');
    await expect(statisticalAreaPage.zoomOutButton()).toHaveAccessibleName('Zoom out');
    await statisticalAreaPage.zoomInButton().focus();
    await page.keyboard.press('Enter');

    await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
  });
});
