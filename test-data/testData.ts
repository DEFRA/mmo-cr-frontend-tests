/**
 * Shared test data for the Record Your Catch UI specs and helpers.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */

import { searchTermFor } from '../utils/search';
import { readSelection, selectionEnv } from './referenceDataSelection';

export const vessels = {
  testVessel: readSelection<string>(selectionEnv.vessel) ?? 'ACHILLES'
};

// Used when the reference data API is unavailable; each name is listed by its 2-character search term
const fallbackPorts = ['Plymouth', 'Falmouth', 'Fleetwood', 'Felixstowe', 'Pwllheli'];
const [firstPort, secondPort, thirdPort, fourthPort, fifthPort] = (readSelection<string[]>(selectionEnv.ports) ??
  fallbackPorts) as [string, string, string, string, string];

// Distinct random active ports from the reference data API
export const ports = {
  unapprovedPrefix: 'Not a port',
  first: firstPort,
  second: secondPort,
  third: thirdPort,
  fourth: fourthPort,
  fifth: fifthPort,
  searchTerms: {
    second: searchTermFor(secondPort)
  }
};

// Random gear for catalogue search tests only; tests that depend on a gear's measurements use the named gears below
const searchableGear = readSelection<string>(selectionEnv.gear) ?? 'Traps (not specified)';

// Display names ("<common name> (<FAO code>)") of random species whose search terms drive the species search tests
const selectedSpecies = readSelection<[string, string]>(selectionEnv.species);

export const gears = {
  searchable: {
    name: searchableGear,
    searchTerm: searchTermFor(searchableGear)
  },
  pots: {
    name: 'Pots',
    gearDimension: '45',
    searchTerm: 'pot',
    typedSearchTerm: 'Pot'
  },
  traps: {
    name: 'Traps (not specified)'
  },
  seineNets: {
    name: 'Seine nets (not specified)',
    searchTerm: 'se'
  },
  setLonglines: {
    name: 'Set longlines'
  },
  trollingLines: {
    name: 'Trolling lines'
  },
  unapproved: 'Not a catalogue gear',
  measurements: {
    valid: '1',
    invalid: '1.5',
    replacementDimension: '90'
  }
};

export const catchSpecies = {
  cod: {
    name: 'Atlantic cod (COD)',
    code: 'COD',
    weight: '100'
  },
  codWithTrollingLines: {
    name: 'Atlantic cod (COD)',
    code: 'COD',
    weight: '50'
  },
  mackerel: {
    name: 'Atlantic mackerel (MAC)',
    code: 'MAC',
    weight: '50'
  },
  shads: {
    name: 'Allis and twaite shads (SHD)',
    code: 'SHD',
    weight: '25'
  },
  unapprovedPrefix: 'Not an approved species',
  searchTerms: {
    first: selectedSpecies ? searchTermFor(selectedSpecies[0]) : 'at',
    second: selectedSpecies ? searchTermFor(selectedSpecies[1]) : 'ha'
  },
  weights: {
    aboveMinimum: '5',
    keptOnboard: '10',
    required: '100',
    initial: {
      aboveMinimum: '100',
      belowMinimum: '10',
      discarded: '5'
    },
    edited: {
      aboveMinimum: '120',
      belowMinimum: '15',
      discarded: '6'
    }
  }
};

export const areas = {
  validCode: '46D86',
  invalidCode: 'ZZZZZ',
  otherOption: 'Other',
  mapControls: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out'
  }
};

export const checkAnswers = {
  summaryKeys: {
    vessel: 'Vessel',
    departureDate: 'Departure date',
    returnDate: 'Return date',
    departurePort: 'Departure port',
    returnPort: 'Return port',
    statisticalSubArea: 'Statistical sub area',
    areaMajorityCaught: 'Area majority caught',
    gearType: 'Gear type',
    speciesCaught: 'Species caught',
    weightRetained: 'Weight above minimum size retained',
    notLanded: 'Not landed',
    notLandedSpecies: 'Species',
    weightKeptOnboard: 'Weight above minimum size kept onboard or in keep pots (kg)'
  },
  changeLinks: {
    departureDate: 'Change departure date',
    returnDate: 'Change return date',
    departurePort: 'Change departure port',
    returnPort: 'Change return port'
  },
  answers: {
    yes: 'Yes',
    no: 'No'
  }
};

export const recordStatuses = {
  draft: 'Draft',
  submitted: 'Submitted',
  amended: 'Amended'
};

export const amendReason = 'Correcting the return date as requested by the office';

export const errorMessages = {
  ports: {
    unapproved: 'Select a port from the list',
    departureRequired: 'Select the port you left from',
    returnRequired: 'Select the port you returned to'
  },
  tripDates: {
    sameDayRequired: 'Select yes if your trip started and finished today',
    futureDeparture: 'Date you left for your trip must be today or in the past',
    returnBeforeDeparture: 'Date you returned from your trip must be the same as or after the date you left'
  },
  gears: {
    unapproved: 'Select a gear type from the list',
    noneSelected: 'Select the gear you want to add',
    missingGearDimension: 'Enter the gear dimension by length or width of the gear',
    missingMeshSize: 'Enter the mesh size',
    invalidMeasurement: 'Enter a whole number',
    duplicateSuffix: ' has already been added to your gear'
  },
  species: {
    noneSelected: 'Select at least one species',
    unapproved: 'Enter the species you want to add',
    duplicateSuffix: ' has already been added.'
  },
  areas: {
    invalidFormat: 'Enter a statistical subrectangle in the correct format, for example 38E84'
  },
  signIn: {
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Please enter your password.',
    invalidCredentials: 'Invalid email address or password. Please try again.'
  },
  map: {
    loadFailed: 'The map could not be loaded'
  }
};

export const signInData = {
  unregisteredCredentials: {
    email: 'not-registered@example.com',
    password: 'IncorrectPassword1!'
  },
  invalidEmailFormat: 'invalid-email-format',
  signInHeading: 'Sign in',
  recordsPageTitle: 'Your catch records | Record your catch',
  createAccountGuidance: {
    vesselOwnerHeading: 'Vessel owner',
    vesselOwnerText: 'You will receive an email invitation to register when your vessel is added to the system.',
    skipperOrAgentHeading: 'Skipper or agent',
    skipperOrAgentText: 'Ask your vessel owner to add you. They can do this from their account.'
  }
};
