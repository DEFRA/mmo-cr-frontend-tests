/**
 * A fisher recording a catch on the web service sees the ICES Statistical sub-rectangle map open around the
 * declared departure port with at least the 9 nearest sub-rectangles, can zoom and pan the map, and can select
 * the sea-based sub-rectangle where the majority of the catch was caught.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type MapLabel } from '../../../pages/statisticalAreaPage';
import { type LandFeature, MapFlow, type SubrectangleReference } from '../helpers/mapFlow';

type ViewportSize = { width: number; height: number };
type PanScenario = { scenario: string; direction: string; dragStep: string; offsetX: number; offsetY: number };

const DEPARTURE_PORT = 'Plymouth';
const MAP_SIGN_IN_OPTIONS = {
  requiredCredentialsMessage: 'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for map UI tests'
};
const MAP_PATH = '/statistical-area';
const CHECK_ANSWERS_PATH = '/check-answers';
const SPECIES_SELECTION_URL = /\/species-selection$/;
const DEPARTURE_PORT_URL = /\/add-port\?for=departure&entry=1$/;
const MINIMUM_SUBRECTANGLES = 9;
const ZOOM_IN_CLICKS = 8;
const PAN_ZOOM_IN_CLICKS = 2;
const LARGER_SCREEN: ViewportSize = { width: 1600, height: 1000 };
const NARROW_SCREEN: ViewportSize = { width: 700, height: 900 };
const MAP_ERROR_TEXT = 'The map could not be loaded';
const ZOOM_IN_NAME = 'Zoom in';
const ZOOM_OUT_NAME = 'Zoom out';
const STATISTICAL_SUB_AREA_KEY = 'Statistical sub area';

const panScenarios: PanScenario[] = [
  {
    scenario: 'Pan Left and Right',
    direction: 'left',
    dragStep: 'The user drags the map left or right',
    offsetX: -60,
    offsetY: 0
  },
  {
    scenario: 'Pan Left and Right',
    direction: 'right',
    dragStep: 'The user drags the map left or right',
    offsetX: 60,
    offsetY: 0
  },
  {
    scenario: 'Pan Up and Down',
    direction: 'up',
    dragStep: 'The user drags the map up or down',
    offsetX: 0,
    offsetY: -60
  },
  {
    scenario: 'Pan Up and Down',
    direction: 'down',
    dragStep: 'The user drags the map up or down',
    offsetX: 0,
    offsetY: 60
  }
];

function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

test.describe('ICES statistical sub-rectangle map', () => {
  test(
    'Displays at least nine sub-rectangles around the declared departure port when the map opens',
    { tag: ['@ui', '@smoke', '@statisticalAreaMap'] },
    async ({ navigationFlow, mapFlow, statisticalAreaPage }) => {
      await test.step('The user has declared a departure port for the trip', async () => {
        await navigationFlow.signIn(MAP_SIGN_IN_OPTIONS);
        await navigationFlow.selectDeparturePort(DEPARTURE_PORT);
        await mapFlow.installCanvasProbe();
      });

      await test.step('The user opens the ICES Statistical sub-rectangle web map', async () => {
        await statisticalAreaPage.goto(MAP_PATH);
      });

      await test.step('The map is positioned around the declared departure port', async () => {
        await expect(statisticalAreaPage.pageHeading()).toBeVisible();
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', DEPARTURE_PORT);
      });

      await test.step('At least the 9 nearest relevant sub-rectangles are displayed', async () => {
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });
    }
  );

  test(
    'Displays more than nine sub-rectangles when zoomed out on a larger screen',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      await test.step('The map is opened on a larger supported screen', async () => {
        await mapFlow.openMap();
        await statisticalAreaPage.resizeViewportAndReload(LARGER_SCREEN.width, LARGER_SCREEN.height);
      });

      await test.step('The visible map area can accommodate more than 9 sub-rectangles', async () => {
        await statisticalAreaPage.zoomOutButton().click();
      });

      await test.step('The system may display the additional relevant sub-rectangles', async () => {
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        const resizedBounds = await statisticalAreaPage.mapCanvas().boundingBox();
        expect(resizedBounds?.width).toBeGreaterThan(0);
        expect(resizedBounds?.height).toBeGreaterThan(0);
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });

      await test.step('The display is not restricted to exactly 9', async () => {
        await expect.poll(() => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(MINIMUM_SUBRECTANGLES);
      });
    }
  );

  test(
    'Displays a larger map area when zooming out',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let initialImage = '';
      let initialCount = 0;

      await test.step('The map is displaying the initial departure-port area', async () => {
        await mapFlow.openMap();
        initialImage = await statisticalAreaPage.canvasFingerprint();
        initialCount = await statisticalAreaPage.readMapSubrectangleCount();
      });

      await test.step('The user zooms out', async () => {
        await statisticalAreaPage.zoomOutButton().click();
      });

      await test.step('A larger geographical area is displayed', async () => {
        await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
      });

      await test.step('Additional coastline is shown', async () => {
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        expect(await statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
      });

      await test.step('Additional relevant sub-rectangles within the visible area are displayed', async () => {
        await expect.poll(() => statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(initialCount);
      });
    }
  );

  test(
    'Displays fewer sub-rectangles when zooming in',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let visibleImage = '';
      let visibleCount = 0;

      await test.step('Multiple sub-rectangles are visible', async () => {
        await mapFlow.openMap();
        const initialImage = await statisticalAreaPage.canvasFingerprint();
        await statisticalAreaPage.zoomOutButton().click();
        await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
        visibleImage = await statisticalAreaPage.canvasFingerprint();
        visibleCount = await statisticalAreaPage.readMapSubrectangleCount();
      });

      await test.step('The user zooms in', async () => {
        for (let zoom = 0; zoom < ZOOM_IN_CLICKS; zoom++) {
          await statisticalAreaPage.zoomInButton().click();
        }
      });

      await test.step('A smaller geographical area is displayed', async () => {
        await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(visibleImage);
      });

      await test.step('The number of visible sub-rectangles may decrease according to the visible area', async () => {
        await expect.poll(() => statisticalAreaPage.readMapSubrectangleCount()).toBeLessThan(visibleCount);
      });
    }
  );

  for (const pan of panScenarios) {
    test(
      `Updates the visible map when panned ${pan.direction}`,
      { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
      async ({ mapFlow, statisticalAreaPage }) => {
        let initialImage = '';

        await test.step('The web map is displayed', async () => {
          await mapFlow.openMap();
          for (let zoom = 0; zoom < PAN_ZOOM_IN_CLICKS; zoom++) {
            await statisticalAreaPage.zoomInButton().click();
          }
          initialImage = await statisticalAreaPage.canvasFingerprint();
        });

        await test.step(pan.dragStep, async () => {
          await statisticalAreaPage.dragMap(pan.offsetX, pan.offsetY);
        });

        await test.step('The map moves in the selected direction', async () => {
          await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
        });

        await test.step('The coastline and sub-rectangles visible within the new map area are displayed', async () => {
          await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
          expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThan(0);
        });
      }
    );
  }

  test(
    'Displays and saves a selectable sub-rectangle when it partially overlaps the sea',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let subrectangles: SubrectangleReference[] = [];
      let land: LandFeature[] = [];
      let visibleLabels: MapLabel[] = [];
      let partial: SubrectangleReference | undefined;

      await test.step('An ICES Statistical sub-rectangle is partially over the sea', async () => {
        await mapFlow.openMap();
        [subrectangles, land] = await Promise.all([mapFlow.fetchSubrectangles(), mapFlow.fetchLandFeatures()]);
      });

      await test.step('It falls within the visible map area', async () => {
        visibleLabels = await statisticalAreaPage.readMapLabels();
        const visibleCodes = new Set(visibleLabels.map(({ code }) => code));
        partial = subrectangles.find(
          (subrectangle) =>
            subrectangle.overlapsSea &&
            visibleCodes.has(subrectangle.subCode) &&
            MapFlow.isPartiallySeaBased(subrectangle, land)
        );
      });

      await test.step('The sub-rectangle is displayed', async () => {
        expect(partial, 'The initial map should include a sub-rectangle overlapping both land and sea').toBeDefined();
        const { subCode } = requireDefined(partial, 'No partially sea-based sub-rectangle is visible');
        expect(visibleLabels.find(({ code }) => code === subCode)).toBeDefined();
      });

      await test.step('The user can select it', async () => {
        const { subCode } = requireDefined(partial, 'No partially sea-based sub-rectangle is visible');
        const label = requireDefined(
          visibleLabels.find(({ code }) => code === subCode),
          'The partially sea-based sub-rectangle has no visible map label'
        );
        await statisticalAreaPage.clickMapLabel(label);
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
        await statisticalAreaPage.goto(MAP_PATH);
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', subCode);
      });
    }
  );

  test(
    'Displays and saves a selectable sub-rectangle when it is wholly over the sea',
    { tag: ['@ui', '@smoke', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let subrectangles: SubrectangleReference[] = [];
      let land: LandFeature[] = [];
      let visibleLabels: MapLabel[] = [];
      let whollySea: SubrectangleReference | undefined;

      await test.step('An ICES Statistical sub-rectangle is wholly over the sea', async () => {
        await mapFlow.openMap();
        [subrectangles, land] = await Promise.all([mapFlow.fetchSubrectangles(), mapFlow.fetchLandFeatures()]);
      });

      await test.step('It falls within the visible map area', async () => {
        visibleLabels = await statisticalAreaPage.readMapLabels();
        const visibleCodes = new Set(visibleLabels.map(({ code }) => code));
        whollySea = subrectangles.find(
          (subrectangle) =>
            subrectangle.overlapsSea &&
            visibleCodes.has(subrectangle.subCode) &&
            MapFlow.isWhollySeaBased(subrectangle, land)
        );
      });

      await test.step('The sub-rectangle is displayed', async () => {
        expect(whollySea, 'The map should display a wholly sea-based sub-rectangle').toBeDefined();
        const { subCode } = requireDefined(whollySea, 'No wholly sea-based sub-rectangle is visible');
        expect(visibleLabels.find(({ code }) => code === subCode)).toBeDefined();
      });

      await test.step('The user can select it', async () => {
        const { subCode } = requireDefined(whollySea, 'No wholly sea-based sub-rectangle is visible');
        const label = requireDefined(
          visibleLabels.find(({ code }) => code === subCode),
          'The wholly sea-based sub-rectangle has no visible map label'
        );
        await statisticalAreaPage.clickMapLabel(label);
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
        await statisticalAreaPage.goto(MAP_PATH);
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', subCode);
      });
    }
  );

  test(
    'Excludes sub-rectangles from selection when they are entirely on land',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let seaCodes = new Set<string>();
      let landOnlyCodes = new Set<string>();
      let visibleCodes: string[] = [];

      await test.step('An ICES Statistical sub-rectangle is located entirely on land', async () => {
        await mapFlow.openMap();
        const subrectangles = await mapFlow.fetchSubrectangles();
        seaCodes = new Set(subrectangles.filter(({ overlapsSea }) => overlapsSea).map(({ subCode }) => subCode));
        landOnlyCodes = new Set(subrectangles.filter(({ overlapsSea }) => !overlapsSea).map(({ subCode }) => subCode));
      });

      await test.step('The relevant geographical area is displayed', async () => {
        visibleCodes = (await statisticalAreaPage.readMapLabels()).map(({ code }) => code);
      });

      await test.step('The land-only sub-rectangle is not shown', async () => {
        expect(await statisticalAreaPage.readMapSubrectangleCount()).toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
        for (const code of visibleCodes) {
          expect(seaCodes.has(code), `${code} should overlap the sea`).toBeTruthy();
        }
      });

      await test.step('It cannot be selected', async () => {
        for (const code of visibleCodes) {
          expect(landOnlyCodes.has(code), `${code} is land-only and should not be selectable`).toBeFalsy();
        }
      });
    }
  );

  test(
    'Highlights and retains a sub-rectangle when it is selected',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage }) => {
      let label: MapLabel | undefined;

      await test.step('A selectable ICES Statistical sub-rectangle is displayed', async () => {
        await mapFlow.openMap();
        const visibleLabels = await statisticalAreaPage.readMapLabels();
        label = requireDefined(
          visibleLabels[Math.floor(visibleLabels.length / 2)],
          'No visible ICES sub-rectangle is available to select'
        );
      });

      await test.step('The user selects it', async () => {
        await statisticalAreaPage.clickMapLabel(requireDefined(label, 'No sub-rectangle was chosen'));
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
      });

      await test.step('The selected sub-rectangle is clearly highlighted', async () => {
        await statisticalAreaPage.goto(MAP_PATH);
        await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
      });

      await test.step('Its identifier is captured for the fishing activity', async () => {
        const { code } = requireDefined(label, 'No sub-rectangle was chosen');
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', code);
      });
    }
  );

  test(
    'Stores the selected sub-rectangle against the catch record when continuing',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ mapFlow, statisticalAreaPage, checkAnswersPage }) => {
      let label: MapLabel | undefined;

      await test.step('The user has selected a valid ICES Statistical sub-rectangle', async () => {
        await mapFlow.openMap();
        const visibleLabels = await statisticalAreaPage.readMapLabels();
        label = requireDefined(
          visibleLabels[Math.floor(visibleLabels.length / 2)],
          'No visible ICES sub-rectangle is available to select'
        );
      });

      await test.step('The user saves or continues', async () => {
        await statisticalAreaPage.clickMapLabel(requireDefined(label, 'No sub-rectangle was chosen'));
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
      });

      await test.step('The selected sub-rectangle is stored against the correct fishing activity or catch record', async () => {
        const { code } = requireDefined(label, 'No sub-rectangle was chosen');
        await statisticalAreaPage.goto(MAP_PATH);
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', code);

        await checkAnswersPage.goto(CHECK_ANSWERS_PATH);
        expect(await checkAnswersPage.getSummaryValueText(STATISTICAL_SUB_AREA_KEY)).toContain(code);
      });
    }
  );

  test(
    'Redirects to port entry when the map opens without a declared departure port',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ navigationFlow, statisticalAreaPage, addPortPage }) => {
      await test.step('No departure port has been declared for the trip', async () => {
        await navigationFlow.signIn(MAP_SIGN_IN_OPTIONS);
      });

      await test.step('The user attempts to open the ICES Statistical sub-rectangle map', async () => {
        await statisticalAreaPage.goto(MAP_PATH);
      });

      await test.step('The system does not calculate or display the nearest 9 sub-rectangles', async () => {
        await expect(statisticalAreaPage.mapRegion()).toHaveCount(0);
      });

      await test.step('The user is directed to provide or select a departure port before continuing', async () => {
        await addPortPage.expectUrl(DEPARTURE_PORT_URL);
        await expect(addPortPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Displays an error and allows retrying when map data cannot be loaded',
    { tag: ['@ui', '@regression', '@statisticalAreaMap'] },
    async ({ navigationFlow, statisticalAreaPage, mapFlow }) => {
      await test.step('The user opens the web map', async () => {
        await navigationFlow.signIn(MAP_SIGN_IN_OPTIONS);
        await navigationFlow.selectDeparturePort(DEPARTURE_PORT);
      });

      await test.step('The required map or reference data cannot be loaded', async () => {
        await mapFlow.failFirstSubrectanglesRequest();
        await mapFlow.installCanvasProbe();
        await statisticalAreaPage.goto(MAP_PATH);
      });

      await test.step('The system displays a clear error message', async () => {
        await expect(statisticalAreaPage.mapError()).toBeVisible();
        await expect(statisticalAreaPage.mapError()).toContainText(MAP_ERROR_TEXT);
      });

      await test.step('The user is not allowed to submit an unverified map selection', async () => {
        await expect(statisticalAreaPage.selectedAreaInput()).toBeDisabled();
        await expect(statisticalAreaPage.mapCanvas()).toHaveAttribute('hidden', '');
      });

      await test.step('The user is given an option to retry', async () => {
        await statisticalAreaPage.retryButton().click();
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        await expect(statisticalAreaPage.mapError()).toBeHidden();
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });
    }
  );

  test(
    'Replaces the prior selection when another sub-rectangle is selected',
    {
      tag: ['@ui', '@regression', '@statisticalAreaMap']
    },
    async ({ mapFlow, statisticalAreaPage }) => {
      let first: MapLabel | undefined;
      let second: MapLabel | undefined;

      await test.step('The user has selected a sub-rectangle on the map', async () => {
        await mapFlow.openMap();
        const initialLabels = await statisticalAreaPage.readMapLabels();
        const middleIndex = Math.floor(initialLabels.length / 2);
        first = requireDefined(initialLabels[middleIndex], 'At least two visible sub-rectangles are required');
        second = requireDefined(
          initialLabels[middleIndex + 1] ?? initialLabels[middleIndex - 1],
          'At least two visible sub-rectangles are required'
        );
        await statisticalAreaPage.clickMapLabel(first);
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
      });

      await test.step('The user returns to the map', async () => {
        await statisticalAreaPage.goto(MAP_PATH);
      });

      await test.step('The prior selection is shown on the map', async () => {
        const { code } = requireDefined(first, 'No first sub-rectangle was chosen');
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', code);
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });

      await test.step('The user selects a different sub-rectangle', async () => {
        const { code } = requireDefined(second, 'No second sub-rectangle was chosen');
        const currentLabels = await statisticalAreaPage.readMapLabels();
        const replacement = requireDefined(
          currentLabels.find((label) => label.code === code),
          'The second sub-rectangle is not visible after revisiting the map'
        );
        await statisticalAreaPage.clickMapLabel(replacement);
        await statisticalAreaPage.expectUrl(SPECIES_SELECTION_URL);
      });

      await test.step('Only the new sub-rectangle is stored as the selection', async () => {
        const { code } = requireDefined(second, 'No second sub-rectangle was chosen');
        await statisticalAreaPage.goto(MAP_PATH);
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-selected-area', code);
        await expect(statisticalAreaPage.selectedAreaInput()).toHaveCount(1);
      });

      await test.step('The new selection is highlighted on the map', async () => {
        await expect.poll(() => statisticalAreaPage.readSelectedGridCount()).toBeGreaterThan(0);
      });
    }
  );

  test(
    'Keeps the map and controls visible when the browser is resized to a narrow width',
    {
      tag: ['@ui', '@regression', '@statisticalAreaMap']
    },
    async ({ mapFlow, statisticalAreaPage }) => {
      await test.step('The web map is displayed', async () => {
        await mapFlow.openMap();
      });

      await test.step('The user resizes the browser to a narrow width', async () => {
        await statisticalAreaPage.resizeViewportAndReload(NARROW_SCREEN.width, NARROW_SCREEN.height);
      });

      await test.step('The map is displayed within the narrow viewport', async () => {
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        const bounds = await statisticalAreaPage.mapCanvas().boundingBox();
        expect(bounds?.width).toBeGreaterThan(0);
        expect(bounds?.height).toBeGreaterThan(0);
      });

      await test.step('The zoom controls remain visible', async () => {
        await expect(statisticalAreaPage.zoomInButton()).toBeVisible();
        await expect(statisticalAreaPage.zoomOutButton()).toBeVisible();
      });

      await test.step('At least 9 sub-rectangles are displayed', async () => {
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });
    }
  );

  test(
    'Reinitialises the map without losing the departure port when the page is refreshed',
    {
      tag: ['@ui', '@regression', '@statisticalAreaMap']
    },
    async ({ mapFlow, statisticalAreaPage }) => {
      let portName = '';

      await test.step('The web map is displayed for the declared departure port', async () => {
        portName = await mapFlow.openMap();
      });

      await test.step('The user refreshes the map page', async () => {
        await statisticalAreaPage.reload();
      });

      await test.step('The map is reinitialised', async () => {
        await expect(statisticalAreaPage.pageHeading()).toBeVisible();
        await expect(statisticalAreaPage.mapCanvas()).toBeVisible();
        await expect
          .poll(() => statisticalAreaPage.readMapSubrectangleCount())
          .toBeGreaterThanOrEqual(MINIMUM_SUBRECTANGLES);
      });

      await test.step('The declared departure port is retained', async () => {
        await expect(statisticalAreaPage.mapRegion()).toHaveAttribute('data-departure-port', portName);
      });
    }
  );

  test(
    'Displays labelled zoom controls and updates the map when zoom is activated by keyboard',
    {
      tag: ['@ui', '@regression', '@statisticalAreaMap']
    },
    async ({ mapFlow, statisticalAreaPage }) => {
      let initialImage = '';

      await test.step('The web map is displayed', async () => {
        await mapFlow.openMap();
        initialImage = await statisticalAreaPage.canvasFingerprint();
      });

      await test.step('The zoom controls are labelled "Zoom in" and "Zoom out"', async () => {
        await expect(statisticalAreaPage.zoomInButton()).toHaveAccessibleName(ZOOM_IN_NAME);
        await expect(statisticalAreaPage.zoomOutButton()).toHaveAccessibleName(ZOOM_OUT_NAME);
      });

      await test.step('The user activates "Zoom in" using the keyboard', async () => {
        await statisticalAreaPage.zoomInButton().focus();
        await statisticalAreaPage.pressKey('Enter');
      });

      await test.step('The visible map area is updated', async () => {
        await expect.poll(() => statisticalAreaPage.canvasFingerprint()).not.toBe(initialImage);
      });
    }
  );
});
