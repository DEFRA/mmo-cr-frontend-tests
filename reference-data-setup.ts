/**
 * Global setup that calls the reference data service and picks random test data for this run:
 * the vessel (`vessels.testVessel`), five distinct ports (`ports`), a catalogue-search gear (`gears.searchable`)
 * and the species search terms (`catchSpecies.searchTerms`) in test-data/testData.ts.
 * Each falls back to the static values in testData.ts when the API cannot be reached.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */
import { request } from '@playwright/test';
import { createApiContext } from './services/apiContext';
import { ReferenceDataApi, type ReferenceDatasetName } from './services/referenceData.api';
import { gears } from './test-data/testData';
import { selectedPortsCount, selectionEnv } from './test-data/referenceDataSelection';
import { searchTermFor } from './utils/search';

type Selection = { env: string; value: unknown; log: string };

// The port and gear searches list at most 10 matches
const searchResultLimit = 10;

const shuffle = <T>(values: T[]): T[] => {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
  }
  return shuffled;
};

const pickRandom = <T>(values: T[]): T | undefined => values[Math.floor(Math.random() * values.length)];

const countMatches = (lowerNames: string[], searchTerm: string): number => {
  const lowerTerm = searchTerm.toLowerCase();
  return lowerNames.filter((name) => name.includes(lowerTerm)).length;
};

// Names no other name contains (result rows are matched by text) and that their search term can list
const searchableNames = (names: string[]): string[] => {
  const lowerNames = names.map((name) => name.toLowerCase());
  return names.filter((name, index) => {
    const lowerName = lowerNames[index] as string;
    const isUniqueText = !lowerNames.some((other) => other !== lowerName && other.includes(lowerName));
    return isUniqueText && countMatches(lowerNames, searchTermFor(name)) <= searchResultLimit;
  });
};

const fetchItems = async <Dataset extends ReferenceDatasetName>(api: ReferenceDataApi, dataset: Dataset) => {
  try {
    return await api.getItems(dataset);
  } catch (error) {
    console.warn(`Could not load ${dataset} (${String(error)}); using the static ${dataset} from testData.ts`);
    return undefined;
  }
};

const selectVessel = async (api: ReferenceDataApi): Promise<Selection | undefined> => {
  const items = await fetchItems(api, 'vessels');
  if (!items) return undefined;

  const names = items.filter((vessel) => vessel.status === 'active').map((vessel) => vessel.name);
  const vessel = pickRandom(names);

  if (!vessel) {
    console.warn('No active vessels found; using the static vessel from testData.ts');
    return undefined;
  }

  return { env: selectionEnv.vessel, value: vessel, log: `vessel (${names.length} active): ${vessel}` };
};

const selectPorts = async (api: ReferenceDataApi): Promise<Selection | undefined> => {
  const items = await fetchItems(api, 'ports');
  if (!items) return undefined;

  const searchable = searchableNames(
    items.filter((port) => port.active && port.countryCode === 'GBR').map((port) => port.name)
  );

  if (searchable.length < selectedPortsCount) {
    console.warn(`Only ${searchable.length} searchable ports found; using the static ports from testData.ts`);
    return undefined;
  }

  const selected = shuffle(searchable).slice(0, selectedPortsCount);
  return {
    env: selectionEnv.ports,
    value: selected,
    log: `ports (${searchable.length} searchable): ${selected.join(', ')}`
  };
};

const selectGear = async (api: ReferenceDataApi): Promise<Selection | undefined> => {
  const items = await fetchItems(api, 'gears');
  if (!items) return undefined;

  // Named gears are kept for measurement-specific tests and may already be saved as favourites
  const namedGears = Object.values(gears).flatMap((gear) =>
    typeof gear === 'object' && 'name' in gear && gear !== gears.searchable ? [gear.name] : []
  );
  const searchable = searchableNames(items.filter((gear) => gear.active).map((gear) => gear.name)).filter(
    (name) => !namedGears.includes(name)
  );
  const gear = pickRandom(searchable);

  if (!gear) {
    console.warn('No searchable gears found; using the static searchable gear from testData.ts');
    return undefined;
  }

  return { env: selectionEnv.gear, value: gear, log: `searchable gear (${searchable.length} searchable): ${gear}` };
};

const selectSpecies = async (api: ReferenceDataApi): Promise<Selection | undefined> => {
  const items = await fetchItems(api, 'species');
  if (!items) return undefined;

  const names = items.flatMap((species) => {
    const commonName = species.commonNames.find((name) => name.countryCode === 'GBR')?.name;
    return species.active && commonName ? [`${commonName} (${species.faoCode})`] : [];
  });
  const lowerNames = names.map((name) => name.toLowerCase());

  // The tests pick a different species for the second search term, so it must match at least two species
  const first = pickRandom(names);
  const firstTerm = first ? searchTermFor(first).toLowerCase() : undefined;
  const second = shuffle(names).find((name) => {
    const term = searchTermFor(name);
    return term.toLowerCase() !== firstTerm && countMatches(lowerNames, term) >= 2;
  });

  if (!first || !second) {
    console.warn('Not enough active species found; using the static species search terms from testData.ts');
    return undefined;
  }

  return {
    env: selectionEnv.species,
    value: [first, second],
    log: `species search terms: "${searchTermFor(first)}" (${first}), "${searchTermFor(second)}" (${second})`
  };
};

export default async function selectReferenceData(): Promise<void> {
  // Always resolve the data from the API; never reuse values from .env or the shell
  for (const envName of Object.values(selectionEnv)) {
    delete process.env[envName];
  }

  const apiBaseURL = process.env.CATCH_RECORDING_API_BASE_URL;

  if (!apiBaseURL) {
    console.warn('CATCH_RECORDING_API_BASE_URL is not set; using the static reference data from testData.ts');
    return;
  }

  const apiRequest = await createApiContext(request, apiBaseURL);
  const api = new ReferenceDataApi(apiRequest);

  try {
    const selections = await Promise.all([selectVessel(api), selectPorts(api), selectGear(api), selectSpecies(api)]);

    for (const selection of selections) {
      if (!selection) continue;
      process.env[selection.env] = JSON.stringify(selection.value);
      console.log(`Using ${selection.log}`);
    }
  } finally {
    await apiRequest.dispose();
  }
}
