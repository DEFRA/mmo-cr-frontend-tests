import { expect, test } from '../../fixtures/commonfixture';

import { MapFlow, type LandFeature, type SubrectangleReference } from './helpers/mapFlow';

test.describe('Map full story - ICES statistical sub-rectangle map', () => {
  test('opens around the declared departure port and displays at least nine relevant sub-rectangles', async ({
    mapFlow,
    statisticalAreaPage
  }) => {
    const portName = await mapFlow.openMap();
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', portName);

    expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('zooming out can display more than nine rectangles when the visible area permits', async ({
    mapFlow,
    statisticalAreaPage
  }) => {
    await mapFlow.openMap();
    await statisticalAreaPage.zoomOutButton().click();

    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(9);
  });

  test('NFR2 - map fits a larger browser viewport and retains the minimum display', async ({
    mapFlow,
    page,
    statisticalAreaPage
  }) => {
    await mapFlow.openMap();
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.reload();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);

    const resizedBounds = await statisticalAreaPage.mapCanvas().boundingBox();
    expect(resizedBounds?.width).toBeGreaterThan(0);
    expect(resizedBounds?.height).toBeGreaterThan(0);
  });

  test('zoom controls update the visible map area and sub-rectangles', async ({ mapFlow, statisticalAreaPage }) => {
    await mapFlow.openMap();
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
    test(`panning ${direction.title} updates the visible map`, async ({ mapFlow, statisticalAreaPage }) => {
      await mapFlow.openMap();
      await statisticalAreaPage.zoomInButton().click();
      await statisticalAreaPage.zoomInButton().click();
      const initialImage = await statisticalAreaPage.canvasFingerprint();

      await statisticalAreaPage.dragMap(direction.x, direction.y);

      await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
      expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(0);
    });
  }

  test('selecting a visible sea sub-rectangle stores its ICES code', async ({ mapFlow, statisticalAreaPage }) => {
    await mapFlow.openMap();
    const labels = await statisticalAreaPage.readMapLabels();
    const selectedLabel = labels[Math.floor(labels.length / 2)];
    expect(selectedLabel).toBeDefined();
    if (!selectedLabel) {
      throw new Error('No selectable ICES sub-rectangle labels were rendered');
    }
    expect(selectedLabel.code).toMatch(/^\d{2}[A-Z]\d{2}$/i);

    await statisticalAreaPage.clickMapLabel(selectedLabel);
    await statisticalAreaPage.expectUrl(/\/species-selection$/);

    await statisticalAreaPage.goto('/statistical-area');
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', selectedLabel.code);
  });

  test('a sub-rectangle containing both land and sea can be selected', async ({
    mapFlow,
    page,
    statisticalAreaPage
  }) => {
    await mapFlow.openMap();
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
        MapFlow.isPartiallySeaBased(subrectangle, landData.land)
    );
    expect(partial, 'The initial map should include a sub-rectangle overlapping both land and sea').toBeDefined();
    if (!partial) throw new Error('No partially sea-based sub-rectangle is visible');

    const label = visibleLabels.find(({ code }) => code === partial.subCode);
    expect(label).toBeDefined();
    if (!label) throw new Error('The partially sea-based sub-rectangle has no visible map label');
    await statisticalAreaPage.clickMapLabel(label);
    await statisticalAreaPage.expectUrl(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', partial.subCode);
  });

  test('selected sub-rectangle is visibly highlighted after returning to the map', async ({
    mapFlow,
    statisticalAreaPage
  }) => {
    await mapFlow.openMap();
    const visibleLabels = await statisticalAreaPage.readMapLabels();
    const label = visibleLabels[Math.floor(visibleLabels.length / 2)];
    expect(label).toBeDefined();
    if (!label) throw new Error('No visible ICES sub-rectangle is available to select');

    await statisticalAreaPage.clickMapLabel(label);
    await statisticalAreaPage.expectUrl(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', label.code);
    await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
  });

  test('selecting another sub-rectangle replaces the prior selection', async ({ mapFlow, statisticalAreaPage }) => {
    await mapFlow.openMap();
    const initialLabels = await statisticalAreaPage.readMapLabels();
    const middleIndex = Math.floor(initialLabels.length / 2);
    const first = initialLabels[middleIndex];
    const second = initialLabels[middleIndex + 1] ?? initialLabels[middleIndex - 1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) throw new Error('At least two visible sub-rectangles are required');

    await statisticalAreaPage.clickMapLabel(first);
    await statisticalAreaPage.expectUrl(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', first.code);

    const currentLabels = await statisticalAreaPage.readMapLabels();
    const replacement = currentLabels.find(({ code }) => code === second.code);
    expect(replacement).toBeDefined();
    if (!replacement) throw new Error('The second sub-rectangle is not visible after revisiting the map');
    await statisticalAreaPage.clickMapLabel(replacement);
    await statisticalAreaPage.expectUrl(/\/species-selection$/);
    await statisticalAreaPage.goto('/statistical-area');

    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', second.code);
    await expect(statisticalAreaPage.selectedAreaInput()).toHaveCount(1);
    await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
  });

  test('BR8 - land-only sub-rectangles are excluded from the visible map', async ({
    mapFlow,
    page,
    statisticalAreaPage
  }) => {
    await mapFlow.openMap();
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
    navigationFlow,
    page,
    statisticalAreaPage,
    addPortPage
  }) => {
    await navigationFlow.signIn({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
    });
    await page.goto('/statistical-area');

    await addPortPage.expectUrl(/\/add-port\?for=departure&entry=1$/);
    await expect(addPortPage.pageHeading()).toBeVisible();
    await expect(statisticalAreaPage.mapRegion()).toHaveCount(0);
  });

  test('reports map-data failure and allows retry without enabling map selection', async ({
    navigationFlow,
    page,
    statisticalAreaPage,
    mapFlow
  }) => {
    await navigationFlow.signIn({
      requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
    });
    await navigationFlow.selectDeparturePort('Plymouth');

    let firstRequest = true;
    await page.route('**/public/offline-map/subrectangles.json', async (route) => {
      if (firstRequest) {
        firstRequest = false;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await mapFlow.installCanvasProbe();
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

  test('map and controls remain usable at a narrow browser width', async ({ mapFlow, page, statisticalAreaPage }) => {
    await mapFlow.openMap();
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
    mapFlow,
    page,
    statisticalAreaPage
  }) => {
    const portName = await mapFlow.openMap();
    await page.reload();

    await expect(statisticalAreaPage.pageHeading()).toBeVisible();
    await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
    await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', portName);
    await expect.poll(async () => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(9);
  });

  test('NFR1 - zoom controls are labelled and keyboard operable', async ({ mapFlow, page, statisticalAreaPage }) => {
    await mapFlow.openMap();
    const initialImage = await statisticalAreaPage.canvasFingerprint();

    await expect(statisticalAreaPage.zoomInButton()).toHaveAccessibleName('Zoom in');
    await expect(statisticalAreaPage.zoomOutButton()).toHaveAccessibleName('Zoom out');
    await statisticalAreaPage.zoomInButton().focus();
    await page.keyboard.press('Enter');

    await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
  });
});
