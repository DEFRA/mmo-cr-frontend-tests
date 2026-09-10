import { expect, test } from '../../fixtures/commonfixture';

/**
 * Automated coverage for CRAR-113 (ICES Statistical sub-rectangle map).
 * Scenarios mirror req/CRAR-113.feature, which should be reviewed/agreed first.
 *
 * The map is not yet built in the application, so every test is marked
 * `test.fixme`. Once the feature ships:
 *  1. Confirm/update the data-testid hooks used in pages/mapPage.ts.
 *  2. Replace the TODO navigation below with the real "create a new catch
 *     record" journey (vessel, dates, ports, gear) once that flow has its own
 *     page object.
 *  3. Remove the `test.fixme(...)` line from each test below.
 */

const MAP_NOT_READY = 'CRAR-113: map feature not yet implemented / selectors not confirmed with dev team';

test.describe('ICES Statistical sub-rectangle map', () => {
  test.beforeEach(async ({ signInPage }) => {
    // TODO: replace with the real navigation path once the "create a new
    // catch record" journey up to the statistical sub area step is automated.
    await signInPage.goto('/sign-in');
  });

  test('AC1: map opens centred on the departure port with at least 9 sub-rectangles', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    await expect(mapPage.mapCanvas()).toBeVisible();
    expect(await mapPage.countVisibleSubRectangles()).toBeGreaterThanOrEqual(9);
  });

  test('AC2: a larger screen may display more than 9 sub-rectangles', async ({ page, mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(mapPage.mapCanvas()).toBeVisible();
    expect(await mapPage.countVisibleSubRectangles()).toBeGreaterThan(9);
  });

  test('AC3: zooming out reveals additional coastline and sub-rectangles', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    const before = await mapPage.countVisibleSubRectangles();
    await mapPage.zoomOut();
    const after = await mapPage.countVisibleSubRectangles();

    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('AC4: zooming in may reduce the number of visible sub-rectangles', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    const before = await mapPage.countVisibleSubRectangles();
    await mapPage.zoomIn();
    const after = await mapPage.countVisibleSubRectangles();

    expect(after).toBeLessThanOrEqual(before);
  });

  (['left', 'right', 'up', 'down'] as const).forEach((direction) => {
    test(`AC5/AC6: panning the map ${direction} updates the visible area`, async ({ mapPage }) => {
      test.fixme(true, MAP_NOT_READY);

      const before = await mapPage.visibleSubRectangles().allTextContents();
      await mapPage.pan(direction);
      const after = await mapPage.visibleSubRectangles().allTextContents();

      expect(after).not.toEqual(before);
    });
  });

  test('AC7/AC8: a sea-based sub-rectangle can be selected and is highlighted', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    const code = '29E6-4'; // TODO: replace with a confirmed sea-based sub-rectangle for the test port
    await mapPage.selectSubRectangle(code);

    await expect(mapPage.selectedSubRectangleBadge()).toHaveText(code);
  });

  test('AC9: a land-only sub-rectangle is not displayed or selectable', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    const landOnlyCode = '29E6-9'; // TODO: replace with a confirmed land-only sub-rectangle
    await expect(mapPage.subRectangle(landOnlyCode)).toHaveCount(0);
  });

  test('AC11: the selected sub-rectangle is stored against the catch record', async ({ page, mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    const code = '29E6-4';
    await mapPage.selectSubRectangle(code);
    await page.getByRole('button', { name: 'Save and continue' }).click();

    await expect(page.getByText(code)).toBeVisible();
  });

  test('AC13: the map cannot be opened without a declared departure port', async ({ mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    await expect(mapPage.missingPortMessage()).toBeVisible();
    await expect(mapPage.mapCanvas()).toHaveCount(0);
  });

  test('AC14: a clear error is shown when map data cannot load, with a retry option', async ({ page, mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    await page.route('**/ices-reference-data**', (route) => route.abort());

    await expect(mapPage.errorBanner()).toBeVisible();
    await expect(mapPage.retryButton()).toBeVisible();
  });

  test('NFR1: map controls are operable using only the keyboard', async ({ page, mapPage }) => {
    test.fixme(true, MAP_NOT_READY);

    await mapPage.zoomInButton().focus();
    await page.keyboard.press('Enter');

    await expect(mapPage.zoomInButton()).toBeFocused();
  });

  test('NFR5: the selected sub-rectangle code follows the ICES rectangle + sub-rectangle format', async ({
    mapPage,
  }) => {
    test.fixme(true, MAP_NOT_READY);

    await mapPage.selectSubRectangle('29E6-4');

    await expect(mapPage.selectedSubRectangleBadge()).toHaveText(/^\d{2}[A-Z]\d-\d$/);
  });
});
