import { type Page } from '@playwright/test';
import { expect, test } from '../../fixtures/commonfixture';
import { type SigninPage } from '../../pages/sign-in.page';
import { type StatisticalAreaPage } from '../../pages/statisticalAreaPage';

type MapLabel = { code: string; x: number; y: number };
type Point = [number, number];
type MapPolygon = { exterior: Point[]; holes: Point[][] };
type MapBounds = { minLongitude: number; maxLongitude: number; minLatitude: number; maxLatitude: number };
type SubrectangleReference = { subCode: string; overlapsSea: boolean; bounds: MapBounds; polygons: MapPolygon[] };
type LandFeature = { polygons: MapPolygon[] };

async function signIn(signInPage: SigninPage): Promise<void> {
  const email = process.env.CATCH_RECORDING_EMAIL;
  const password = process.env.CATCH_RECORDING_PASSWORD;
  if (!email || !password) {
    throw new Error('CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests');
  }

  await signInPage.goto('/sign-in');
  await signInPage.login(email, password);
  await expect(signInPage.page).toHaveURL(/\/records$/);
}

async function chooseDeparturePort(page: Page): Promise<string> {
  const portName = 'Plymouth';
  await page.goto('/add-port?for=departure&entry=1');
  await page.getByLabel('Enter the port or closest port you set off from').fill(portName);
  const portResult = page.locator('#port-results li').filter({ hasText: portName });
  await expect(portResult).toBeVisible();
  await portResult.click();
  await page.getByRole('button', { name: 'Save and continue' }).click();

  await expect(
    page.getByRole('heading', {
      name: /Was Plymouth the port or the closest port you set off from and returned to\?/,
    }),
  ).toBeVisible();
  await page.getByLabel('Yes').check();
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/gear-selection$/);
  return portName;
}

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
  await signIn(signInPage);
  const portName = await chooseDeparturePort(page);
  await installCanvasProbe(mapPage.page);
  await mapPage.goto('/statistical-area');
  await expect(mapPage.pageHeading()).toBeVisible();
  await expect(mapPage.mapCanvas()).toBeVisible();
  await expect.poll(async () => readMapSubrectangleCount(mapPage)).toBeGreaterThanOrEqual(9);
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
        minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 12,
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

async function readMapLabels(mapPage: StatisticalAreaPage): Promise<MapLabel[]> {
  return mapPage.mapCanvas().evaluate((canvas) => {
    return JSON.parse((canvas as HTMLCanvasElement).dataset.playwrightMapLabels ?? '[]') as MapLabel[];
  });
}

async function readMapSubrectangleCount(mapPage: StatisticalAreaPage): Promise<number> {
  return mapPage
    .mapCanvas()
    .evaluate((canvas) => Number((canvas as HTMLCanvasElement).dataset.playwrightGridCount ?? '0'));
}

async function readSelectedGridCount(mapPage: StatisticalAreaPage): Promise<number> {
  return mapPage
    .mapCanvas()
    .evaluate((canvas) => Number((canvas as HTMLCanvasElement).dataset.playwrightSelectedGridCount ?? '0'));
}

async function clickMapLabel(page: Page, mapPage: StatisticalAreaPage, label: MapLabel): Promise<void> {
  const pixelRatio = await page.evaluate(() => window.devicePixelRatio || 1);
  await mapPage.mapCanvas().click({
    position: { x: (label.x - 4) / pixelRatio, y: (label.y + 4) / pixelRatio },
  });
  await expect(page).toHaveURL(/\/species-selection$/);
}

async function canvasFingerprint(mapPage: StatisticalAreaPage): Promise<string> {
  return mapPage.mapCanvas().evaluate((element) => {
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

async function dragMap(mapPage: StatisticalAreaPage, offsetX: number, offsetY: number): Promise<void> {
  await mapPage.mapCanvas().scrollIntoViewIfNeeded();
  const bounds = await mapPage.mapCanvas().boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    throw new Error('The statistical area map canvas has no visible bounds');
  }

  const startX = bounds.x + bounds.width / 2;
  const startY = bounds.y + bounds.height / 2;
  await mapPage.page.mouse.move(startX, startY);
  await mapPage.page.mouse.down();
  await mapPage.page.mouse.move(startX + offsetX, startY + offsetY, { steps: 5 });
  await mapPage.page.mouse.up();
}

test.describe('Map full story - ICES statistical sub-rectangle map', () => {
  test('AC1 - opens around the declared departure port and displays at least nine relevant sub-rectangles', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    const portName = await openMap(signInPage, page, statisticalAreaPage);
    await expect(statisticalAreaPage.page.locator('[data-statistical-area-map]')).toHaveAttribute(
      'data-departure-port',
      portName,
    );

    expect(await readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);
  });

  test('TS03 - zooming out can display more than nine rectangles when the visible area permits', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    await statisticalAreaPage.zoomOutButton().click();

    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThan(9);
  });

  test('AC2, NFR2 - map fits a larger browser viewport and retains the minimum display', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.reload();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);

    const resizedBounds = await statisticalAreaPage.mapCanvas().boundingBox();
    expect(resizedBounds?.width).toBeGreaterThan(0);
    expect(resizedBounds?.height).toBeGreaterThan(0);
  });

  test('AC3, AC4, FR4, FR5 - zoom controls update the visible map area and sub-rectangles', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialImage = await canvasFingerprint(statisticalAreaPage);
    const initialCount = await readMapSubrectangleCount(statisticalAreaPage);

    await statisticalAreaPage.zoomOutButton().click();
    await expect.poll(() => canvasFingerprint(statisticalAreaPage)).not.toBe(initialImage);
    const zoomedOutCount = await readMapSubrectangleCount(statisticalAreaPage);
    expect(zoomedOutCount).toBeGreaterThanOrEqual(initialCount);

    for (let zoom = 0; zoom < 8; zoom++) {
      await statisticalAreaPage.zoomInButton().click();
    }
    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeLessThan(zoomedOutCount);
  });

  for (const direction of [
    { title: 'left', x: -60, y: 0 },
    { title: 'right', x: 60, y: 0 },
    { title: 'up', x: 0, y: -60 },
    { title: 'down', x: 0, y: 60 },
  ]) {
    test(`AC5, AC6, FR6, FR7 - panning ${direction.title} updates the visible map`, async ({
      signInPage,
      page,
      statisticalAreaPage,
    }) => {
      await openMap(signInPage, page, statisticalAreaPage);
      await statisticalAreaPage.zoomInButton().click();
      await statisticalAreaPage.zoomInButton().click();
      const initialImage = await canvasFingerprint(statisticalAreaPage);

      await dragMap(statisticalAreaPage, direction.x, direction.y);

      await expect.poll(() => canvasFingerprint(statisticalAreaPage)).not.toBe(initialImage);
      expect(await readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThan(0);
    });
  }

  test('AC7, AC8, AC10, AC11 - selecting a visible sea sub-rectangle stores its ICES code', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const labels = await readMapLabels(statisticalAreaPage);
    const selectedLabel = labels[Math.floor(labels.length / 2)];
    expect(selectedLabel).toBeDefined();
    if (!selectedLabel) {
      throw new Error('No selectable ICES sub-rectangle labels were rendered');
    }
    expect(selectedLabel.code).toMatch(/^\d{2}[A-Z]\d{2}$/i);

    await clickMapLabel(page, statisticalAreaPage, selectedLabel);

    await statisticalAreaPage.goto('/statistical-area');
    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-selected-area', selectedLabel.code);
  });

  test('TS13 - a sub-rectangle containing both land and sea can be selected', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const [subrectangleResponse, landResponse] = await Promise.all([
      page.request.get('/public/offline-map/subrectangles.json'),
      page.request.get('/public/offline-map/land.json'),
    ]);
    expect(subrectangleResponse.ok()).toBeTruthy();
    expect(landResponse.ok()).toBeTruthy();
    const subrectangles = (await subrectangleResponse.json()) as { subrectangles: SubrectangleReference[] };
    const landData = (await landResponse.json()) as { land: LandFeature[] };
    const visibleLabels = await readMapLabels(statisticalAreaPage);
    const visibleCodes = new Set(visibleLabels.map(({ code }) => code));
    const partial = subrectangles.subrectangles.find(
      (subrectangle) =>
        subrectangle.overlapsSea &&
        visibleCodes.has(subrectangle.subCode) &&
        isPartiallySeaBased(subrectangle, landData.land),
    );
    expect(partial, 'The initial map should include a sub-rectangle overlapping both land and sea').toBeDefined();
    if (!partial) throw new Error('No partially sea-based sub-rectangle is visible');

    const label = visibleLabels.find(({ code }) => code === partial.subCode);
    expect(label).toBeDefined();
    if (!label) throw new Error('The partially sea-based sub-rectangle has no visible map label');
    await clickMapLabel(page, statisticalAreaPage, label);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-selected-area', partial.subCode);
  });

  test('TS14 - selected sub-rectangle is visibly highlighted after returning to the map', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const visibleLabels = await readMapLabels(statisticalAreaPage);
    const label = visibleLabels[Math.floor(visibleLabels.length / 2)];
    expect(label).toBeDefined();
    if (!label) throw new Error('No visible ICES sub-rectangle is available to select');

    await clickMapLabel(page, statisticalAreaPage, label);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-selected-area', label.code);
    await expect.poll(() => readSelectedGridCount(statisticalAreaPage)).toBeGreaterThan(0);
  });

  test('TS15 - selecting another sub-rectangle replaces the prior selection', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialLabels = await readMapLabels(statisticalAreaPage);
    const middleIndex = Math.floor(initialLabels.length / 2);
    const first = initialLabels[middleIndex];
    const second = initialLabels[middleIndex + 1] ?? initialLabels[middleIndex - 1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) throw new Error('At least two visible sub-rectangles are required');

    await clickMapLabel(page, statisticalAreaPage, first);
    await statisticalAreaPage.goto('/statistical-area');
    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-selected-area', first.code);

    const currentLabels = await readMapLabels(statisticalAreaPage);
    const replacement = currentLabels.find(({ code }) => code === second.code);
    expect(replacement).toBeDefined();
    if (!replacement) throw new Error('The second sub-rectangle is not visible after revisiting the map');
    await clickMapLabel(page, statisticalAreaPage, replacement);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-selected-area', second.code);
    await expect(statisticalAreaPage.selectedAreaInput()).toHaveCount(1);
    await expect.poll(() => readSelectedGridCount(statisticalAreaPage)).toBeGreaterThan(0);
  });

  test('AC9, BR8 - land-only sub-rectangles are excluded from the visible map', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const response = await page.request.get('/public/offline-map/subrectangles.json');
    expect(response.ok()).toBeTruthy();
    const referenceData = (await response.json()) as { subrectangles: SubrectangleReference[] };
    const seaCodes = new Set(
      referenceData.subrectangles.filter(({ overlapsSea }) => overlapsSea).map(({ subCode }) => subCode),
    );
    const visibleCodes = (await readMapLabels(statisticalAreaPage)).map(({ code }) => code);

    expect(await readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);
    for (const code of visibleCodes) {
      expect(seaCodes.has(code), `${code} should overlap the sea`).toBeTruthy();
    }
  });

  test('AC13 - redirects to departure-port selection when no departure port is set', async ({ signInPage, page }) => {
    await signIn(signInPage);
    await page.goto('/statistical-area');

    await expect(page).toHaveURL(/\/add-port\?for=departure&entry=1$/);
    await expect(page.getByRole('heading', { name: 'Enter the port or closest port you set off from' })).toBeVisible();
    await expect(page.locator('[data-statistical-area-map]')).toHaveCount(0);
  });

  test('AC14 - reports map-data failure and allows retry without enabling map selection', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    await signIn(signInPage);
    await chooseDeparturePort(page);

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

    const error = page.locator('[data-statistical-area-map-error]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('The map could not be loaded');
    await expect(statisticalAreaPage.selectedAreaInput()).toBeDisabled();
    await expect(statisticalAreaPage.mapCanvas()).toHaveAttribute('hidden', '');

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(error).toBeHidden();
    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);
  });

  test('TS19 - map and controls remain usable at a narrow browser width', async ({
    signInPage,
    page,
    statisticalAreaPage,
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
    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);
  });

  test('TS20 - refreshing the map page reinitializes the map without losing the trip context', async ({
    signInPage,
    page,
    statisticalAreaPage,
  }) => {
    const portName = await openMap(signInPage, page, statisticalAreaPage);
    await page.reload();

    await expect(statisticalAreaPage.pageHeading()).toBeVisible();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(page.locator('[data-statistical-area-map]')).toHaveAttribute('data-departure-port', portName);
    await expect.poll(async () => readMapSubrectangleCount(statisticalAreaPage)).toBeGreaterThanOrEqual(9);
  });

  test('NFR1 - zoom controls are labelled and keyboard operable', async ({ signInPage, page, statisticalAreaPage }) => {
    await openMap(signInPage, page, statisticalAreaPage);
    const initialImage = await canvasFingerprint(statisticalAreaPage);

    await expect(statisticalAreaPage.zoomInButton()).toHaveAccessibleName('Zoom in');
    await expect(statisticalAreaPage.zoomOutButton()).toHaveAccessibleName('Zoom out');
    await statisticalAreaPage.zoomInButton().focus();
    await page.keyboard.press('Enter');

    await expect.poll(() => canvasFingerprint(statisticalAreaPage)).not.toBe(initialImage);
  });
});
