import { expect, test } from '../../../fixtures/commonfixture';

const favouriteSpecies = 'Atlantic cod (COD)';
const favouriteGear = 'Pots';
const favouritePort = 'Plymouth';

test.describe('Create and amend favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount({
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for favourites UI tests'
    });
  });

  test(
    'Displays saved favourites grouped by species, ports and gear',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ accountPage }) => {
      await test.step('My account displays species, ports and gear in separate groups', async () => {
        await expect(accountPage.summaryRow('Species caught')).toBeVisible();
        await expect(accountPage.summaryRow('Ports used')).toBeVisible();
        await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
      });
    }
  );

  test(
    'Saves a species favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouriteSpecies'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The species is not already a favourite', async () => {
        await favouritesFlow.removeSpeciesFromAccount(favouriteSpecies);
      });

      await test.step('I search for and save an approved species', async () => {
        await favouritesFlow.addSpeciesToAccount(favouriteSpecies);
      });

      await test.step('The species is saved in my favourites', async () => {
        await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing species favourite is added again',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ favouritesFlow, accountPage, addSpeciesPage }) => {
      await test.step('I already have a favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(favouriteSpecies);
      });

      await test.step('I attempt to add the same species again', async () => {
        await accountPage.addSpeciesLink().click();
        await addSpeciesPage.speciesInput().fill(favouriteSpecies);
        const duplicateOption = addSpeciesPage.suggestionOption(favouriteSpecies);
        await expect(duplicateOption.or(addSpeciesPage.noResultsMessage())).toBeVisible();
        if (await duplicateOption.isVisible()) {
          await duplicateOption.click();
        } else {
          await addSpeciesPage.speciesInput().press('Tab');
        }
        await addSpeciesPage.clickSaveAndContinue();
      });

      await test.step('I am informed that the species is already a favourite', async () => {
        await expect(addSpeciesPage.errorSummary()).toContainText(/already/i);
        await addSpeciesPage.expectUrl(/\/add-species/);
      });

      await test.step('Exactly one copy remains saved after reloading the account', async () => {
        await accountPage.goto('/account');
        await expect
          .poll(async () => (await accountPage.getSpeciesCaught()).filter((name) => name === favouriteSpecies).length)
          .toBe(1);
      });
    }
  );

  test(
    'Saves a gear favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The gear is not already a favourite', async () => {
        await favouritesFlow.removeGearFromAccount(favouriteGear);
      });

      await test.step('I search for and save approved gear with its required measurements', async () => {
        await favouritesFlow.addGearToAccount(favouriteGear);
      });

      await test.step('The gear is saved in my favourites', async () => {
        await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
      });
    }
  );

  test(
    'Saves a port favourite when an approved catalogue entry is selected',
    { tag: ['@ui', '@smoke', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('The port is not already a favourite', async () => {
        await favouritesFlow.removePortFromAccount(favouritePort);
      });

      await test.step('I search for and save an approved port', async () => {
        await favouritesFlow.addPortToAccount(favouritePort);
      });

      await test.step('The port is saved in my favourites', async () => {
        await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing gear favourite is added again',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ favouritesFlow, accountPage, addGearPage, removeGearPage }) => {
      await test.step('I already have favourite gear', async () => {
        await favouritesFlow.ensureGearAdded(favouriteGear);
      });

      await test.step('I attempt to add the same gear again', async () => {
        await accountPage.clickAddGear();
        await addGearPage.gearInput().fill(favouriteGear);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I am informed that the gear is already a favourite', async () => {
        await expect(addGearPage.errorSummary()).toContainText(`${favouriteGear} has already been added to your gear`);
        await addGearPage.expectUrl(/\/add-gear/);
      });

      await test.step('Exactly one copy remains saved', async () => {
        await accountPage.goto('/account');
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(favouriteGear)).toHaveCount(1);
      });
    }
  );

  test(
    'Displays an error and prevents duplicates when an existing port favourite is added again',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage, addPortPage }) => {
      await test.step('I already have a favourite port', async () => {
        await favouritesFlow.ensurePortAdded(favouritePort);
      });

      await test.step('I attempt to add the same port again', async () => {
        await accountPage.addPortLink().click();
        await addPortPage.searchAndSelectPort(favouritePort);
        await addPortPage.clickSaveAndContinue();
      });

      await test.step('I am informed that the port is already a favourite', async () => {
        await expect(addPortPage.errorSummary()).toBeVisible();
        await expect(addPortPage.errorSummary()).toContainText(/already/i);
        await addPortPage.expectUrl(/\/add-port/);
      });

      await test.step('Exactly one copy remains saved after reloading the account', async () => {
        await accountPage.goto('/account');
        await expect
          .poll(async () => (await accountPage.getPortsUsed()).filter((name) => name === favouritePort).length)
          .toBe(1);
      });
    }
  );

  test(
    'Removes a species favourite when removal is confirmed',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ favouritesFlow, accountPage, removeSpeciesPage }) => {
      await test.step('I have a favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(favouriteSpecies);
      });

      await test.step('I choose the species to remove', async () => {
        await accountPage.removeSpeciesLink().click();
        await expect(removeSpeciesPage.pageHeading()).toBeVisible();
        await removeSpeciesPage.selectSpeciesToRemove(favouriteSpecies);
        await expect(removeSpeciesPage.speciesCheckbox(favouriteSpecies)).toBeChecked();
      });

      await test.step('I explicitly confirm removal by continuing', async () => {
        await removeSpeciesPage.clickContinue();
      });

      await test.step('The species is no longer saved as a favourite', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.speciesCaughtValue()).not.toContainText(favouriteSpecies);
      });
    }
  );

  test(
    'Removes a gear favourite when removal is confirmed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ favouritesFlow, accountPage, removeGearPage }) => {
      await test.step('I have favourite gear', async () => {
        await favouritesFlow.ensureGearAdded(favouriteGear);
      });

      await test.step('I choose the gear to remove', async () => {
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
        await removeGearPage.selectGearToRemove(favouriteGear);
        await expect(removeGearPage.gearCheckbox(favouriteGear)).toBeChecked();
      });

      await test.step('I explicitly confirm removal by continuing', async () => {
        await removeGearPage.clickContinue();
      });

      await test.step('The gear is no longer saved as a favourite', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(favouriteGear);
      });
    }
  );

  test(
    'Removes a port favourite when removal is confirmed',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage, removePortPage }) => {
      await test.step('I have a favourite port', async () => {
        await favouritesFlow.ensurePortAdded(favouritePort);
      });

      await test.step('I choose the port to remove', async () => {
        await accountPage.removePortLink().click();
        await expect(removePortPage.pageHeading()).toBeVisible();
        await removePortPage.portCheckbox(favouritePort).check();
        await expect(removePortPage.portCheckbox(favouritePort)).toBeChecked();
      });

      await test.step('I explicitly confirm removal by continuing', async () => {
        await removePortPage.continueButton().click();
      });

      await test.step('The port is no longer saved as a favourite', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
      });
    }
  );

  test(
    'Saves the replacement port when an existing favourite is removed and another is added',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ favouritesFlow, accountPage }) => {
      const replacementPort = 'Lowestoft';

      await test.step('I have a favourite port', async () => {
        await favouritesFlow.ensurePortAdded(favouritePort);
      });

      await test.step('I replace it with a different favourite port', async () => {
        await favouritesFlow.removePortFromAccount(favouritePort);
        await favouritesFlow.ensurePortAdded(replacementPort);
      });

      await test.step('Only the replacement port is saved', async () => {
        await expect(accountPage.portsUsedValue()).not.toContainText(favouritePort);
        await expect(accountPage.portsUsedValue()).toContainText(replacementPort);
      });
    }
  );

  test(
    'Displays favourite gear before the wider catalogue is searched',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ favouritesFlow, gearSelectionPage, addGearPage }) => {
      await test.step('I have previously saved favourite gear', async () => {
        await favouritesFlow.ensureGearAdded(favouriteGear);
      });

      await test.step('I open gear selection during catch recording', async () => {
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('My favourite is displayed before I search the wider catalogue', async () => {
        await expect(gearSelectionPage.gearCheckbox(favouriteGear)).toBeVisible();
      });

      await test.step('I can still search the wider gear catalogue', async () => {
        await gearSelectionPage.addGearLink().click();
        await expect(addGearPage.gearInput()).toBeEmpty();
        await addGearPage.searchGearOptions('tr');
        await expect(addGearPage.gearOption('Traps (not specified)')).toBeVisible();
      });
    }
  );

  test(
    'Displays favourite species before the wider catalogue is searched',
    { tag: ['@ui', '@smoke', '@favouriteSpecies'] },
    async ({ favouritesFlow, speciesSelectionPage, navigationFlow, addSpeciesPage }) => {
      await test.step('I have previously saved a favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(favouriteSpecies);
      });

      await test.step('I open species selection during catch recording', async () => {
        await speciesSelectionPage.goto('/species-selection');
      });

      await test.step('My favourite is displayed before I search the wider catalogue', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeVisible();
      });

      await test.step('I can still search the wider species catalogue', async () => {
        await navigationFlow.openAddSpecies();
        await expect(addSpeciesPage.speciesInput()).toBeEmpty();
        await addSpeciesPage.speciesInput().fill('ha');
        await expect(addSpeciesPage.searchResults().first()).toBeVisible();
      });
    }
  );

  test(
    'Prevents progression when a favourite species has no mandatory catch weight',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ favouritesFlow, navigationFlow, speciesSelectionPage }) => {
      await test.step('I have a saved favourite species', async () => {
        await favouritesFlow.ensureSpeciesAdded(favouriteSpecies);
      });

      await test.step('I open species selection during catch recording', async () => {
        await navigationFlow.openSpeciesSelection();
      });

      await test.step('My favourite is available without searching the catalogue', async () => {
        await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeVisible();
      });

      await test.step('I select the favourite and continue without entering its catch weight', async () => {
        for (const checkbox of await speciesSelectionPage.speciesCheckboxes().all()) {
          await checkbox.uncheck();
        }
        await speciesSelectionPage.speciesCheckbox(favouriteSpecies).check();
        await speciesSelectionPage.weightAboveMinimumInput('COD').clear();
        await speciesSelectionPage.clickSaveAndContinue();
      });

      await test.step('Mandatory catch-weight validation prevents progression', async () => {
        await speciesSelectionPage.expectUrl(/\/species-selection$/);
        await expect(speciesSelectionPage.speciesCheckbox(favouriteSpecies)).toBeChecked();
        await expect(speciesSelectionPage.weightAboveMinimumInput('COD')).toBeEmpty();
        await expect(speciesSelectionPage.errorSummary()).toBeVisible();
        await expect(speciesSelectionPage.weightAboveMinimumError('COD')).toBeVisible();
      });
    }
  );

  for (const portType of ['departure', 'return'] as const) {
    test(
      `Suggests favourite ports before searching during ${portType}-port entry`,
      { tag: ['@ui', '@smoke', '@favouritePorts'] },
      async ({ favouritesFlow, addPortPage, recordsPage, selectVesselPage, tripDatePage, confirmSamePortPage }) => {
        await test.step('I have a saved favourite port', async () => {
          await favouritesFlow.ensurePortAdded(favouritePort);
        });

        await test.step(`I start a new catch record and reach ${portType}-port selection`, async () => {
          await recordsPage.goto('/records');
          await recordsPage.createNewRecordButton().click();
          await expect(selectVesselPage.pageHeading()).toBeVisible();
          await selectVesselPage.firstVesselRadio().check();
          await selectVesselPage.clickSaveAndContinue();
          await tripDatePage.expectUrl(/\/trip-date$/);
          await tripDatePage.yesRadio().check();
          await tripDatePage.clickSaveAndContinue();
          await addPortPage.expectUrl(/\/add-port\?for=departure/);

          if (portType === 'return') {
            await addPortPage.searchAndSelectPort(favouritePort);
            await addPortPage.clickSaveAndContinue();
            await expect(confirmSamePortPage.pageHeading()).toBeVisible();
            await confirmSamePortPage.selectSamePort(false);
            await confirmSamePortPage.clickAddAnotherPort();
            await addPortPage.expectUrl(/\/add-port(?:\?|$)/);
            await expect(confirmSamePortPage.pageHeading()).toBeHidden();
          }
        });

        await test.step('My favourite port is displayed before I enter a search', async () => {
          await expect(addPortPage.portInput()).toBeEmpty();
          await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
        });

        await test.step('I can search the wider port catalogue', async () => {
          await addPortPage.searchPorts('Lo');
          await expect(addPortPage.portResultItem('Lowestoft').getByRole('option')).toBeVisible();
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
        await addPortPage.searchPorts(favouritePort.slice(0, 2));
      });

      await test.step('Matching approved ports are suggested', async () => {
        await expect(addPortPage.portResultItem(favouritePort).getByRole('option')).toBeVisible();
      });
    }
  );

  test(
    'Rejects gear favourites when free text is outside the approved catalogue',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, addGearPage }) => {
      await test.step('I am adding a gear favourite', async () => {
        await accountPage.clickAddGear();
      });

      await test.step('I try to save gear outside the approved catalogue', async () => {
        await addGearPage.gearInput().fill('Not a catalogue gear');
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I must select valid gear from the list', async () => {
        await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Rejects species favourites when free text is outside the approved catalogue',
    { tag: ['@ui', '@regression', '@favouriteSpecies'] },
    async ({ accountPage, addSpeciesPage }) => {
      await test.step('I am adding a species favourite', async () => {
        await accountPage.addSpeciesLink().click();
      });

      await test.step('I try to save a species outside the approved catalogue', async () => {
        await addSpeciesPage.speciesInput().fill(`Not an approved species ${Date.now()}`);
        await expect(addSpeciesPage.noResultsMessage()).toBeVisible();
        await addSpeciesPage.speciesInput().press('Tab');
        await addSpeciesPage.clickSaveAndContinue();
      });

      await test.step('I cannot save the unapproved species', async () => {
        await expect(addSpeciesPage.errorSummary()).toContainText('Enter the species you want to add');
        await addSpeciesPage.expectUrl(/\/add-species/);
      });
    }
  );

  test(
    'Rejects port favourites when free text is outside the approved catalogue',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ accountPage, addPortPage }) => {
      await test.step('I am adding a port favourite', async () => {
        await accountPage.addPortLink().click();
      });

      await test.step('I try to save a port outside the approved catalogue', async () => {
        await addPortPage.portInput().fill(`Not a port ${Date.now()}`);
        await addPortPage.clickSaveAndContinue();
      });

      await test.step('I must select a valid port from the list', async () => {
        await expect(addPortPage.errorSummary()).toContainText('Select a port from the list');
        await addPortPage.expectUrl(/\/add-port/);
      });
    }
  );

  test(
    'Preserves saved favourites when the account page is reloaded',
    { tag: ['@ui', '@regression', '@favourites'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('I have saved species, gear and port favourites', async () => {
        await favouritesFlow.ensureSpeciesAdded(favouriteSpecies);
        await favouritesFlow.ensureGearAdded(favouriteGear);
        await favouritesFlow.ensurePortAdded(favouritePort);
      });

      await test.step('I reload my account', async () => {
        await accountPage.reload();
      });

      await test.step('All three favourites remain saved', async () => {
        await expect(accountPage.speciesCaughtValue()).toContainText(favouriteSpecies);
        await expect(accountPage.gearOnboardValue()).toContainText(favouriteGear);
        await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
      });
    }
  );
});
