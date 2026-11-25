/**
 * Create and amend favourites.
 * Fishers save, view and remove favourite species, gear and ports, with validation for duplicate and unapproved entries.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { ports, gears, catchSpecies, errorMessages } from '../../../test-data/testData';
import { searchTermFor } from '../../../utils/search';
import { type AccountPage } from '../../../pages/accountPage';
import { type AddGearPage } from '../../../pages/addGearPage';
import { type AddPortPage } from '../../../pages/addPortPage';
import { type AddSpeciesPage } from '../../../pages/addSpeciesPage';
import { type RemoveGearPage } from '../../../pages/removeGearPage';
import { type RemovePortPage } from '../../../pages/removePortPage';
import { type RemoveSpeciesPage } from '../../../pages/removeSpeciesPage';
import { type FavouritesFlow } from '../helpers/favouritesFlow';

const duplicateSpeciesError = `${catchSpecies.cod.name}${errorMessages.species.duplicateSuffix}`;
const duplicateGearError = `${gears.pots.name}${errorMessages.gears.duplicateSuffix}`;

type RemovalFixtures = {
  favouritesFlow: FavouritesFlow;
  accountPage: AccountPage;
  removeSpeciesPage: RemoveSpeciesPage;
  removeGearPage: RemoveGearPage;
  removePortPage: RemovePortPage;
};

const removableFavourites = [
  {
    kind: 'species',
    tag: '@favouriteSpecies',
    name: catchSpecies.cod.name,
    haveStep: 'I have a favourite species',
    ensureAdded: ({ favouritesFlow }: RemovalFixtures) => favouritesFlow.ensureSpeciesAdded(catchSpecies.cod.name),
    chooseToRemove: async ({ accountPage, removeSpeciesPage }: RemovalFixtures) => {
      await accountPage.removeSpeciesLink().click();
      await removeSpeciesPage.selectSpeciesToRemove(catchSpecies.cod.name);
    },
    confirmRemoval: ({ removeSpeciesPage }: RemovalFixtures) => removeSpeciesPage.clickContinue(),
    savedValue: (accountPage: AccountPage) => accountPage.speciesCaughtValue()
  },
  {
    kind: 'gear',
    tag: '@favouriteGear',
    name: gears.pots.name,
    haveStep: 'I have favourite gear',
    ensureAdded: ({ favouritesFlow }: RemovalFixtures) => favouritesFlow.ensureGearAdded(gears.pots.name),
    chooseToRemove: async ({ accountPage, removeGearPage }: RemovalFixtures) => {
      await accountPage.clickRemoveGear();
      await removeGearPage.selectGearToRemove(gears.pots.name);
    },
    confirmRemoval: ({ removeGearPage }: RemovalFixtures) => removeGearPage.clickContinue(),
    savedValue: (accountPage: AccountPage) => accountPage.gearOnboardValue()
  },
  {
    kind: 'port',
    tag: '@favouritePorts',
    name: ports.first,
    haveStep: 'I have a favourite port',
    ensureAdded: ({ favouritesFlow }: RemovalFixtures) => favouritesFlow.ensurePortAdded(ports.first),
    chooseToRemove: async ({ accountPage, removePortPage }: RemovalFixtures) => {
      await accountPage.removePortLink().click();
      await removePortPage.portCheckbox(ports.first).check();
    },
    confirmRemoval: ({ removePortPage }: RemovalFixtures) => removePortPage.continueButton().click(),
    savedValue: (accountPage: AccountPage) => accountPage.portsUsedValue()
  }
];

type AddFavouritePages = {
  accountPage: AccountPage;
  addGearPage: AddGearPage;
  addSpeciesPage: AddSpeciesPage;
  addPortPage: AddPortPage;
};

const unapprovedFavourites = [
  {
    kind: 'gear',
    tag: '@favouriteGear',
    trySaveStep: 'I try to save gear outside the approved catalogue',
    rejectedStep: 'I must select valid gear from the list',
    error: errorMessages.gears.unapproved,
    url: /\/add-gear/,
    openAdd: ({ accountPage }: AddFavouritePages) => accountPage.clickAddGear(),
    enterUnapproved: ({ addGearPage }: AddFavouritePages) => addGearPage.gearInput().fill(gears.unapproved),
    addPage: ({ addGearPage }: AddFavouritePages) => addGearPage
  },
  {
    kind: 'species',
    tag: '@favouriteSpecies',
    trySaveStep: 'I try to save a species outside the approved catalogue',
    rejectedStep: 'I cannot save the unapproved species',
    error: errorMessages.species.unapproved,
    url: /\/add-species/,
    openAdd: ({ accountPage }: AddFavouritePages) => accountPage.addSpeciesLink().click(),
    enterUnapproved: async ({ addSpeciesPage }: AddFavouritePages) => {
      await addSpeciesPage.speciesInput().fill(`${catchSpecies.unapprovedPrefix} ${Date.now()}`);
      await expect(addSpeciesPage.noResultsMessage(), 'No results message to be visible').toBeVisible();
      await addSpeciesPage.speciesInput().press('Tab');
    },
    addPage: ({ addSpeciesPage }: AddFavouritePages) => addSpeciesPage
  },
  {
    kind: 'port',
    tag: '@favouritePorts',
    trySaveStep: 'I try to save a port outside the approved catalogue',
    rejectedStep: 'I must select a valid port from the list',
    error: errorMessages.ports.unapproved,
    url: /\/add-port/,
    openAdd: ({ accountPage }: AddFavouritePages) => accountPage.addPortLink().click(),
    enterUnapproved: ({ addPortPage }: AddFavouritePages) =>
      addPortPage.portInput().fill(`${ports.unapprovedPrefix} ${Date.now()}`),
    addPage: ({ addPortPage }: AddFavouritePages) => addPortPage
  }
];

test.describe('Create and amend favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('I am signed in and on the account page', async () => {
      await navigationFlow.signInAndOpenAccount({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for favourites UI tests'
      });
    });
  });

  // Page fixtures are per test, so clean-up runs after each test rather than in afterAll
  test.afterEach(async ({ navigationFlow, favouritesFlow, catchRecordFlow }) => {
    await navigationFlow.openAccount();
    await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
    await favouritesFlow.removeGearFromAccount(gears.pots.name);
    await favouritesFlow.removePortFromAccount(ports.first);
    await favouritesFlow.removePortFromAccount(ports.second);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Displays saved favourites grouped by species, ports and gear',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ accountPage }) => {
      await test.step('My account displays species, ports and gear in separate groups', async () => {
        await expect(accountPage.summaryRow('Species caught'), 'Summary row to be visible').toBeVisible();
        await expect(accountPage.summaryRow('Ports used'), 'Summary row to be visible').toBeVisible();
        await expect(accountPage.summaryRow('Gear onboard'), 'Summary row to be visible').toBeVisible();
      });
    }
  );

  test(
    'Saves a species favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouriteSpecies'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The species is not already a favourite', async () => {
        await favouritesFlow.removeSpeciesFromAccount(catchSpecies.cod.name);
      });

      await test.step('I search for and save an approved species', async () => {
        await favouritesFlow.addSpeciesToAccount(catchSpecies.cod.name);
      });

      await test.step('The species is saved in my favourites', async () => {
        await expect(
          accountPage.speciesCaughtValue(),
          `Species caught value to contain text ${catchSpecies.cod.name}`
        ).toContainText(catchSpecies.cod.name);
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing species favourite is added again',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ favouritesFlow, speciesFlow, accountPage, addSpeciesPage }) => {
      await test.step('I already have a favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(catchSpecies.cod.name);
      });

      await test.step('I attempt to add the same species again', async () => {
        await accountPage.addSpeciesLink().click();
        await speciesFlow.submitSpecies(catchSpecies.cod.name);
      });

      await test.step('I am informed that the species is already a favourite', async () => {
        await expect(
          addSpeciesPage.errorSummary(),
          `Error summary to contain text ${duplicateSpeciesError}`
        ).toContainText(duplicateSpeciesError);
        await addSpeciesPage.expectUrl(/\/add-species/);
      });

      await test.step('Exactly one copy remains saved after reloading the account', async () => {
        await accountPage.goto('/account');
        await expect
          .poll(
            async () => (await accountPage.getSpeciesCaught()).filter((name) => name === catchSpecies.cod.name).length
          )
          .toBe(1);
      });
    }
  );

  test(
    'Saves a gear favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The gear is not already a favourite', async () => {
        await favouritesFlow.removeGearFromAccount(gears.pots.name);
      });

      await test.step('I search for and save approved gear with its required measurements', async () => {
        await favouritesFlow.addGearToAccount(gears.pots.name);
      });

      await test.step('The gear is saved in my favourites', async () => {
        await expect(
          accountPage.gearOnboardValue(),
          `Gear onboard value to contain text ${gears.pots.name}`
        ).toContainText(gears.pots.name);
      });
    }
  );

  test(
    'Saves a port favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The port is not already a favourite', async () => {
        await favouritesFlow.removePortFromAccount(ports.first);
      });

      await test.step('I search for and save an approved port', async () => {
        await favouritesFlow.addPortToAccount(ports.first);
      });

      await test.step('The port is saved in my favourites', async () => {
        await expect(accountPage.portsUsedValue(), `Ports used value to contain text ${ports.first}`).toContainText(
          ports.first
        );
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing gear favourite is added again',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ favouritesFlow, accountPage, addGearPage, removeGearPage }) => {
      await test.step('I already have favourite gear', async () => {
        await favouritesFlow.ensureGearAdded(gears.pots.name);
      });

      await test.step('I attempt to add the same gear again', async () => {
        await accountPage.clickAddGear();
        await addGearPage.gearInput().fill(gears.pots.name);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I am informed that the gear is already a favourite', async () => {
        await expect(addGearPage.errorSummary(), `Error summary to contain text ${duplicateGearError}`).toContainText(
          duplicateGearError
        );
        await addGearPage.expectUrl(/\/add-gear/);
      });

      await test.step('Exactly one copy remains saved', async () => {
        await accountPage.goto('/account');
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(gears.pots.name), 'Gear checkbox to have count').toHaveCount(1);
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing port favourite is added again',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage, addPortPage }) => {
      await test.step('I already have a favourite port', async () => {
        await favouritesFlow.ensurePortAdded(ports.first);
      });

      await test.step('I attempt to add the same port again', async () => {
        await accountPage.addPortLink().click();
        await addPortPage.searchAndSelectPort(ports.first);
        await addPortPage.clickSaveAndContinue();
      });

      await test.step('I am informed that the port is already a favourite', async () => {
        await expect(addPortPage.errorSummary(), 'Error summary to contain text').toContainText(/already/i);
        await addPortPage.expectUrl(/\/add-port/);
      });

      await test.step('Exactly one copy remains saved after reloading the account', async () => {
        await accountPage.goto('/account');
        await expect
          .poll(async () => (await accountPage.getPortsUsed()).filter((name) => name === ports.first).length)
          .toBe(1);
      });
    }
  );

  for (const favourite of removableFavourites) {
    test(
      `Removes a ${favourite.kind} favourite when removal is confirmed`,
      { tag: ['@ui', '@regression', favourite.tag] },
      async ({ favouritesFlow, accountPage, removeSpeciesPage, removeGearPage, removePortPage }) => {
        const fixtures = { favouritesFlow, accountPage, removeSpeciesPage, removeGearPage, removePortPage };

        await test.step(favourite.haveStep, async () => {
          await favourite.ensureAdded(fixtures);
        });

        await test.step(`I choose the ${favourite.kind} to remove`, async () => {
          await favourite.chooseToRemove(fixtures);
        });

        await test.step('I explicitly confirm removal by continuing', async () => {
          await favourite.confirmRemoval(fixtures);
        });

        await test.step(`The ${favourite.kind} is no longer saved as a favourite`, async () => {
          await accountPage.expectUrl(/\/account$/);
          await accountPage.reload();
          await expect(
            favourite.savedValue(accountPage),
            `Saved value not to contain text ${favourite.name}`
          ).not.toContainText(favourite.name);
        });
      }
    );
  }

  test(
    'Saves the replacement port when an existing favourite is removed and another is added',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('I have a favourite port', async () => {
        await favouritesFlow.ensurePortAdded(ports.first);
      });

      await test.step('I replace it with a different favourite port', async () => {
        await favouritesFlow.removePortFromAccount(ports.first);
        await favouritesFlow.ensurePortAdded(ports.second);
      });

      await test.step('Only the replacement port is saved', async () => {
        await expect(
          accountPage.portsUsedValue(),
          `Ports used value not to contain text ${ports.first}`
        ).not.toContainText(ports.first);
        await expect(accountPage.portsUsedValue(), `Ports used value to contain text ${ports.second}`).toContainText(
          ports.second
        );
      });
    }
  );

  test(
    'Displays favourite gear before the wider catalogue is searched',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ favouritesFlow, navigationFlow, gearSelectionPage, addGearPage }) => {
      await test.step('I have previously saved favourite gear', async () => {
        await favouritesFlow.ensureGearAdded(gears.pots.name);
      });

      await test.step('I open gear selection during catch recording', async () => {
        // Favourites are saved per vessel, so a record must be started to give gear selection its vessel
        await navigationFlow.startCatchRecord();
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('My favourite is displayed before I search the wider catalogue', async () => {
        await expect(gearSelectionPage.gearCheckbox(gears.pots.name), 'Gear checkbox to be visible').toBeVisible();
      });

      await test.step('I can still search the wider gear catalogue', async () => {
        await gearSelectionPage.addGearLink().click();
        await expect(addGearPage.gearInput(), 'Gear input to be empty').toBeEmpty();
        await addGearPage.searchGearOptions(gears.searchable.searchTerm);
        await expect(addGearPage.gearOption(gears.searchable.name), 'Gear option to be visible').toBeVisible();
      });
    }
  );

  test(
    'Displays favourite species before the wider catalogue is searched',
    { tag: ['@ui', '@smoke', '@favouriteSpecies'] },
    async ({ favouritesFlow, speciesSelectionPage, navigationFlow, addSpeciesPage }) => {
      await test.step('I have previously saved a favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(catchSpecies.cod.name);
      });

      await test.step('I open species selection during catch recording', async () => {
        await navigationFlow.openSpeciesSelectionForNewRecord();
      });

      await test.step('My favourite is displayed before I search the wider catalogue', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          'Species checkbox to be visible'
        ).toBeVisible();
      });

      await test.step('I can still search the wider species catalogue', async () => {
        await navigationFlow.openAddSpecies();
        await expect(addSpeciesPage.speciesInput(), 'Species input to be empty').toBeEmpty();
        await addSpeciesPage.speciesInput().fill(catchSpecies.searchTerms.second);
        await expect(addSpeciesPage.searchResults().first(), 'Search results to be visible').toBeVisible();
      });
    }
  );

  test(
    'Prevents progression when a favourite species has no mandatory catch weight',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ favouritesFlow, navigationFlow, speciesSelectionPage }) => {
      await test.step('I have a saved favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(catchSpecies.cod.name);
      });

      await test.step('I open species selection during catch recording', async () => {
        await navigationFlow.openSpeciesSelectionForNewRecord();
      });

      await test.step('My favourite is available without searching the catalogue', async () => {
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          'Species checkbox to be visible'
        ).toBeVisible();
      });

      await test.step('I select the favourite and continue without entering its catch weight', async () => {
        for (const checkbox of await speciesSelectionPage.speciesCheckboxes().all()) {
          await checkbox.uncheck();
        }
        await speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name).check();
        await speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code).clear();
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('Mandatory catch-weight validation prevents progression', async () => {
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
        await expect(
          speciesSelectionPage.speciesCheckbox(catchSpecies.cod.name),
          'Species checkbox to be checked'
        ).toBeChecked();
        await expect(
          speciesSelectionPage.weightAboveMinimumInput(catchSpecies.cod.code),
          'Weight above minimum input to be empty'
        ).toBeEmpty();
        await expect(speciesSelectionPage.errorSummary(), 'Error summary to be visible').toBeVisible();
        await expect(
          speciesSelectionPage.weightAboveMinimumError(catchSpecies.cod.code),
          'Weight above minimum error to be visible'
        ).toBeVisible();
      });
    }
  );

  for (const portType of ['departure', 'return'] as const) {
    test(
      `Suggests favourite ports before searching during ${portType}-port entry`,
      { tag: ['@ui', '@smoke', '@favouritePorts'] },
      async ({ favouritesFlow, navigationFlow, addPortPage, departurePortPage, returnPortPage }) => {
        const portPage = portType === 'departure' ? departurePortPage : returnPortPage;

        await test.step('I have a saved favourite port', async () => {
          await favouritesFlow.ensurePortAdded(ports.first);
        });

        await test.step(`I start a new catch record and reach ${portType}-port selection`, async () => {
          await navigationFlow.startCatchRecord();
          await departurePortPage.expectUrl(/\/departure-port$/);

          if (portType === 'return') {
            await departurePortPage.selectPort(ports.first);
            await departurePortPage.clickSaveAndContinue();
            await returnPortPage.expectUrl(/\/return-port$/);
          }
        });

        await test.step('My favourite port is displayed before I enter a search', async () => {
          await expect(portPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
        });

        await test.step('I can search the wider port catalogue', async () => {
          await addPortPage.goto(`/add-port?for=${portType}&entry=1`);
          await expect(addPortPage.portInput(), 'Port input to be empty').toBeEmpty();
          await addPortPage.searchPorts(ports.searchTerms.second);
          await expect(
            addPortPage.portResultItem(ports.second).getByRole('option'),
            'Port result item to be visible'
          ).toBeVisible();
        });
      }
    );
  }

  test(
    'Suggests matching approved ports when part of a port name is entered',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ accountPage, addPortPage }) => {
      await test.step('I am adding a port favourite', async () => {
        await accountPage.addPortLink().click();
      });

      await test.step('I enter part of a port name', async () => {
        await addPortPage.searchPorts(searchTermFor(ports.first));
      });

      await test.step('Matching approved ports are suggested', async () => {
        await expect(
          addPortPage.portResultItem(ports.first).getByRole('option'),
          'Port result item to be visible'
        ).toBeVisible();
      });
    }
  );

  for (const favourite of unapprovedFavourites) {
    test(
      `Rejects ${favourite.kind} favourites when free text is outside the approved catalogue`,
      { tag: ['@ui', '@regression', favourite.tag] },
      async ({ accountPage, addGearPage, addSpeciesPage, addPortPage }) => {
        const pages = { accountPage, addGearPage, addSpeciesPage, addPortPage };

        await test.step(`I am adding a ${favourite.kind} favourite`, async () => {
          await favourite.openAdd(pages);
        });

        await test.step(favourite.trySaveStep, async () => {
          await favourite.enterUnapproved(pages);
          await favourite.addPage(pages).clickSaveAndContinue();
        });

        await test.step(favourite.rejectedStep, async () => {
          await expect(
            favourite.addPage(pages).errorSummary(),
            `Add page to contain text ${favourite.error}`
          ).toContainText(favourite.error);
          await favourite.addPage(pages).expectUrl(favourite.url);
        });
      }
    );
  }

  test(
    'Preserves saved favourites when the account page is reloaded',
    { tag: ['@ui', '@regression', '@favourites'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('I have saved species, gear and port favourites', async () => {
        await favouritesFlow.ensureSpeciesAdded(catchSpecies.cod.name);
        await favouritesFlow.ensureGearAdded(gears.pots.name);
        await favouritesFlow.ensurePortAdded(ports.first);
      });

      await test.step('I reload my account', async () => {
        await accountPage.reload();
      });

      await test.step('All three favourites remain saved', async () => {
        await expect(
          accountPage.speciesCaughtValue(),
          `Species caught value to contain text ${catchSpecies.cod.name}`
        ).toContainText(catchSpecies.cod.name);
        await expect(
          accountPage.gearOnboardValue(),
          `Gear onboard value to contain text ${gears.pots.name}`
        ).toContainText(gears.pots.name);
        await expect(accountPage.portsUsedValue(), `Ports used value to contain text ${ports.first}`).toContainText(
          ports.first
        );
      });
    }
  );
});
