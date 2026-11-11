import { expect, test } from '../../fixtures/commonfixture';

test.describe('Complete user account page', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount({
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for account page UI tests'
    });
  });

  test('Verify Account Page Loads Successfully', { tag: ['@ui', '@smoke', '@account'] }, async ({ accountPage }) => {
    await test.step('Scenario: Verify Account Page Loads Successfully', async () => {
      await expect(accountPage.pageHeading()).toBeVisible();
      await expect(accountPage.personalDetailsHeading()).toBeVisible();
      await expect(accountPage.vesselDetailsHeading()).toBeVisible();
      await expect(accountPage.summaryRow('Ports used')).toBeVisible();
      await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
      await expect(accountPage.summaryRow('Species caught')).toBeVisible();
    });
  });

  test(
    'Verify Personal Details are Displayed',
    { tag: ['@ui', '@regression', '@account'] },
    async ({ accountPage }) => {
      await test.step('Scenario: Verify Personal Details are Displayed', async () => {
        await expect(accountPage.personalDetailsHeading()).toBeVisible();
        await expect(accountPage.summaryRow('Email address')).toBeVisible();
        await expect(accountPage.summaryRow('Password')).toBeVisible();
        await expect(accountPage.summaryRow('Address')).toBeVisible();
      });
    }
  );

  test('Verify Vessel Details are Displayed', { tag: ['@ui', '@regression', '@account'] }, async ({ accountPage }) => {
    await test.step('Scenario: Verify Vessel Details are Displayed', async () => {
      await expect(accountPage.vesselDetailsHeading()).toBeVisible();
      await expect(accountPage.vesselNameHeading()).toBeVisible();
    });
  });

  test('Verify "Ports Used" Section Presence', { tag: ['@ui', '@regression', '@ports'] }, async ({ accountPage }) => {
    await test.step('Scenario: Verify "Ports Used" Section Presence', async () => {
      await expect(accountPage.summaryRow('Ports used')).toBeVisible();
      await expect(accountPage.addPortLink()).toBeVisible();
      await expect(accountPage.removePortLink()).toBeVisible();
    });
  });

  test(
    'Verify "Gear Onboard" Section Presence',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage }) => {
      await test.step('Scenario: Verify "Gear Onboard" Section Presence', async () => {
        await expect(accountPage.summaryRow('Gear onboard')).toBeVisible();
        await expect(accountPage.addGearLink()).toBeVisible();
        await expect(accountPage.removeGearLink()).toBeVisible();
      });
    }
  );

  test(
    'Verify "Species Caught" Section Presence',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ accountPage }) => {
      await test.step('Scenario: Verify "Species Caught" Section Presence', async () => {
        await expect(accountPage.summaryRow('Species caught')).toBeVisible();
        await expect(accountPage.addSpeciesLink()).toBeVisible();
        await expect(accountPage.removeSpeciesLink()).toBeVisible();
      });
    }
  );

  test(
    'Verify Navigation to Add Gear Screen',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Navigation to Add Gear Screen', async () => {
        await accountPage.clickAddGear();
        await expect(addGearPage.pageHeading()).toBeVisible();
        await expect(addGearPage.gearInput()).toBeVisible();
      });
    }
  );

  test(
    'Verify Adding a Single Gear Item',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Adding a Single Gear Item', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);
        await expect(accountPage.pageHeading()).toBeVisible();
        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
      });
    }
  );

  test(
    'Verify Multiple Gear Items Can Be Added',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Multiple Gear Items Can Be Added', async () => {
        const firstGear = 'Pots';
        await favouritesFlow.ensureGearAdded(firstGear);
        await accountPage.clickAddGear();
        const secondGear = await gearFlow.findGear('tr', (name) => /traps/i.test(name));
        await gearFlow.saveGearFromAddPage(secondGear);
        await expect(accountPage.gearOnboardValue()).toContainText(firstGear);
        await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
      });
    }
  );

  test(
    'Verify Recently Added Gear Appears Without Manual Refresh',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Recently Added Gear Appears Without Manual Refresh', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);
        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
      });
    }
  );

  test(
    'Verify Cancel Action in Add Gear Flow',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Cancel Action in Add Gear Flow', async () => {
        await accountPage.clickAddGear();
        await expect(addGearPage.pageHeading()).toBeVisible();
        await addGearPage.goBack();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Duplicate Gear Handling',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ favouritesFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Duplicate Gear Handling', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);
        await accountPage.clickAddGear();
        await addGearPage.gearInput().fill(gearName);
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toContainText(`${gearName} has already been added to your gear`);
        await addGearPage.expectUrl(/\/add-gear\?return=/);
      });
    }
  );

  test(
    'Verify Navigation to Remove Gear Screen',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage, removeGearPage }) => {
      await test.step('Scenario: Verify Navigation to Remove Gear Screen', async () => {
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Removal of Gear Item',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ favouritesFlow, accountPage, removeGearPage }) => {
      await test.step('Scenario: Verify Removal of Gear Item', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);

        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(gearName);
        await removeGearPage.clickContinue();

        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(gearName);
      });
    }
  );

  test(
    'Verify Navigation to Add Port Screen',
    { tag: ['@ui', '@regression', '@ports'] },
    async ({ accountPage, addPortPage }) => {
      await test.step('Scenario: Verify Navigation to Add Port Screen', async () => {
        await accountPage.addPortLink().click();
        await addPortPage.expectUrl(/\/add-port/);
      });
    }
  );

  test('Verify Adding a Port', { tag: ['@ui', '@regression', '@ports'] }, async ({ favouritesFlow, accountPage }) => {
    await test.step('Scenario: Verify Adding a Port', async () => {
      const portName = 'Plymouth';
      await favouritesFlow.removePortFromAccount(portName);
      await favouritesFlow.addPortToAccount(portName);
      await expect(accountPage.portsUsedValue()).toContainText(portName);
    });
  });

  test(
    'Verify Multiple Ports Can Be Added',
    { tag: ['@ui', '@regression', '@ports'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Multiple Ports Can Be Added', async () => {
        const ports = ['Plymouth', 'Lowestoft'];
        for (const port of ports) {
          await favouritesFlow.removePortFromAccount(port);
          await favouritesFlow.addPortToAccount(port);
        }
        for (const port of ports) {
          await expect(accountPage.portsUsedValue()).toContainText(port);
        }
      });
    }
  );

  test(
    'Verify Cancel During Add Port Flow',
    { tag: ['@ui', '@regression', '@ports'] },
    async ({ accountPage, addPortPage }) => {
      await test.step('Scenario: Verify Cancel During Add Port Flow', async () => {
        await accountPage.addPortLink().click();
        await addPortPage.expectUrl(/\/add-port/);
        await addPortPage.goBack();
        await accountPage.expectUrl(/\/account$/);
      });
    }
  );

  test(
    'Verify Port Removal Screen Opens',
    { tag: ['@ui', '@regression', '@ports'] },
    async ({ accountPage, removePortPage }) => {
      await test.step('Scenario: Verify Port Removal Screen Opens', async () => {
        await accountPage.removePortLink().click();
        await removePortPage.expectUrl(/\/remove-port/);
      });
    }
  );

  test(
    'Verify Navigation to Add Species Screen',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ accountPage, addSpeciesPage }) => {
      await test.step('Scenario: Verify Navigation to Add Species Screen', async () => {
        await accountPage.addSpeciesLink().click();
        await addSpeciesPage.expectUrl(/\/add-species\?return=\/account$/);
        await expect(addSpeciesPage.speciesInput()).toBeVisible();
      });
    }
  );

  test(
    'Verify Adding a Species',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Adding a Species', async () => {
        const speciesName = 'Atlantic cod (COD)';
        await favouritesFlow.ensureSpeciesAdded(speciesName);
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.speciesCaughtValue()).toContainText(speciesName);
      });
    }
  );

  test(
    'Verify Multiple Species Addition',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Multiple Species Addition', async () => {
        const speciesNames = ['Atlantic cod (COD)', 'Atlantic mackerel (MAC)'];
        for (const species of speciesNames) {
          await favouritesFlow.ensureSpeciesAdded(species);
        }
        for (const species of speciesNames) {
          await expect(accountPage.speciesCaughtValue()).toContainText(species);
        }
      });
    }
  );

  test(
    'Verify Cancel During Add Species Flow',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ accountPage, addSpeciesPage }) => {
      await test.step('Scenario: Verify Cancel During Add Species Flow', async () => {
        await accountPage.addSpeciesLink().click();
        await addSpeciesPage.expectUrl(/\/add-species\?return=\/account$/);
        await expect(addSpeciesPage.speciesInput()).toBeVisible();
        await addSpeciesPage.goBack();
        await accountPage.expectUrl(/\/account$/);
      });
    }
  );

  test(
    'Verify Navigation to Remove Species Screen',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ accountPage, removeSpeciesPage }) => {
      await test.step('Scenario: Verify Navigation to Remove Species Screen', async () => {
        await accountPage.removeSpeciesLink().click();
        await removeSpeciesPage.expectUrl(/\/remove-species\?return=\/account$/);
        await expect(removeSpeciesPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Removing Species',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ favouritesFlow, accountPage, removeSpeciesPage }) => {
      await test.step('Scenario: Verify Removing Species', async () => {
        const speciesName = 'Atlantic cod (COD)';
        await favouritesFlow.ensureSpeciesAdded(speciesName);

        await accountPage.removeSpeciesLink().click();
        await removeSpeciesPage.selectSpeciesToRemove(speciesName);
        await removeSpeciesPage.clickContinue();

        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.speciesCaughtValue()).not.toContainText(speciesName);
      });
    }
  );

  test(
    'Verify Return to Account Page After Add Gear',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, accountPage }) => {
      await test.step('Scenario: Verify Return to Account Page After Add Gear', async () => {
        const gearOnboard = await accountPage.getGearOnboardText();
        await accountPage.clickAddGear();
        const gearName = await gearFlow.findGear('po', (name) => !gearOnboard.includes(name));
        await gearFlow.saveGearFromAddPage(gearName);
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Return to Account Page After Remove Gear',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ favouritesFlow, accountPage, removeGearPage }) => {
      await test.step('Scenario: Verify Return to Account Page After Remove Gear', async () => {
        await favouritesFlow.ensureGearAdded('Pots');
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove('Pots');
        await removeGearPage.clickContinue();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Return to Account Page After Add Port',
    { tag: ['@ui', '@regression', '@ports'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Return to Account Page After Add Port', async () => {
        await favouritesFlow.removePortFromAccount('Plymouth');
        await favouritesFlow.addPortToAccount('Plymouth');
        await expect(accountPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Return to Account Page After Add Species',
    { tag: ['@ui', '@regression', '@addSpecies'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Return to Account Page After Add Species', async () => {
        await favouritesFlow.removeSpeciesFromAccount('Atlantic cod (COD)');
        await favouritesFlow.addSpeciesToAccount('Atlantic cod (COD)');
        await expect(accountPage.pageHeading()).toBeVisible();
      });
    }
  );

  test(
    'Verify Added Ports Appear in Catch Record Journey',
    { tag: ['@ui', '@smoke', '@ports'] },
    async ({ favouritesFlow, accountPage, addPortPage, recordsPage, selectVesselPage, tripDatePage }) => {
      await test.step('Scenario: Verify Added Ports Appear in Catch Record Journey', async () => {
        const portName = 'Plymouth';
        await favouritesFlow.ensurePortAdded(portName);
        await expect(accountPage.portsUsedValue()).toContainText(portName);
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
        await selectVesselPage.expectUrl(/\/select-vessel$/);
        await selectVesselPage.firstVesselRadio().check();
        await selectVesselPage.clickSaveAndContinue();
        await tripDatePage.expectUrl(/\/trip-date$/);
        await tripDatePage.yesRadio().check();
        await tripDatePage.clickSaveAndContinue();
        await addPortPage.expectUrl(/\/add-port\?for=departure/);
        await addPortPage.portInput().fill(portName);
        await expect(addPortPage.portResultItem(portName)).toBeVisible();
      });
    }
  );

  test(
    'Verify Added Gear Appears in Catch Record Journey',
    { tag: ['@ui', '@smoke', '@addGear'] },
    async ({ favouritesFlow, gearSelectionPage }) => {
      await test.step('Scenario: Verify Added Gear Appears in Catch Record Journey', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);
        await gearSelectionPage.goto('/gear-selection');
        await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
      });
    }
  );

  test(
    'Verify Added Species Appears in Catch Record Journey',
    { tag: ['@ui', '@smoke', '@addSpecies'] },
    async ({ favouritesFlow, speciesSelectionPage }) => {
      await test.step('Scenario: Verify Added Species Appears in Catch Record Journey', async () => {
        const speciesName = 'Atlantic cod (COD)';
        await favouritesFlow.ensureSpeciesAdded(speciesName);
        await speciesSelectionPage.goto('/species-selection');
        await expect(speciesSelectionPage.speciesCheckbox(speciesName)).toBeVisible();
      });
    }
  );

  test(
    'Verify Changes Persist Within Same Prototype Session',
    { tag: ['@ui', '@regression', '@account'] },
    async ({ favouritesFlow, accountPage }) => {
      await test.step('Scenario: Verify Changes Persist Within Same Prototype Session', async () => {
        const gearName = 'Pots';
        await favouritesFlow.ensureGearAdded(gearName);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
      });
    }
  );

  test(
    'Verify Search Prefix Matches a Catalogue Gear Option',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Search Prefix Matches a Catalogue Gear Option', async () => {
        await accountPage.clickAddGear();
        const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
        const searchTerm = gearName.slice(0, 2);
        await expect(addGearPage.gearInput()).toHaveAttribute('aria-controls', 'gear-results');
        await addGearPage.gearInput().fill(searchTerm);
        await expect(addGearPage.gearInput()).toHaveValue(searchTerm);
        await addGearPage.searchAndSelectGear(gearName);
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.measurementsHeading()).toBeVisible();
        await expect(addGearPage.measurementInputs().first()).toBeVisible();
      });
    }
  );

  test(
    'Verify Gear Outside the Catalogue Is Rejected',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Gear Outside the Catalogue Is Rejected', async () => {
        const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
        await accountPage.clickAddGear();
        await addGearPage.gearInput().fill('Not a catalogue gear');
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Verify Gear Selection Is Required',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Gear Selection Is Required', async () => {
        const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
        await accountPage.clickAddGear();
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Verify Gear Measurements Are Required',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Gear Measurements Are Required', async () => {
        const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
        await accountPage.clickAddGear();
        await gearFlow.selectLineGear();
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Enter the number of lines');
        await expect(addGearPage.errorSummary()).toContainText(/Enter the gear dimension by number/i);
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Verify Fractional and Negative Measurements Are Rejected',
    { tag: ['@ui', '@regression', '@account'] },
    async ({ gearFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Fractional and Negative Measurements Are Rejected', async () => {
        const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
        await accountPage.clickAddGear();
        await gearFlow.selectLineGear();
        const measurement = addGearPage.measurementInputs().first();
        await measurement.fill('1.5');
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Enter a whole number');
        await measurement.fill('-1');
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Verify Zero Measurements Are Rejected',
    { tag: ['@ui', '@regression', '@account'] },
    async ({ gearFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Zero Measurements Are Rejected', async () => {
        const gearBefore = (await accountPage.gearOnboardValue().textContent()) ?? '';
        await accountPage.clickAddGear();
        await gearFlow.selectLineGear();
        await addGearPage.measurementInputs().first().fill('0');
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.errorSummary()).toContainText('Enter a number greater than 0');
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Verify Saved Gear Is Available Later in the Same Session',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, favouritesFlow, accountPage, gearSelectionPage }) => {
      await test.step('Scenario: Verify Saved Gear Is Available Later in the Same Session', async () => {
        const gearName = 'Pots';
        await favouritesFlow.removeGearFromAccount(gearName);
        await accountPage.clickAddGear();
        await gearFlow.saveGearFromAddPage(gearName);
        await gearSelectionPage.goto('/gear-selection');
        await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
      });
    }
  );

  test(
    'Verify Selected Gear Can Be Saved Using Enter',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ gearFlow, favouritesFlow, accountPage, addGearPage }) => {
      await test.step('Scenario: Verify Selected Gear Can Be Saved Using Enter', async () => {
        const gearOnboard = await accountPage.getGearOnboardText();
        await accountPage.clickAddGear();
        const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
        if (gearOnboard.includes(gearName)) {
          await accountPage.goto('/account');
          await favouritesFlow.removeGearFromAccount(gearName);
          await accountPage.clickAddGear();
        }

        await addGearPage.searchAndSelectGear(gearName);
        const saveAndContinueButton = addGearPage.common.saveAndContinueButton();
        await addGearPage.tabUntilFocused(saveAndContinueButton);
        await addGearPage.pressKey('Enter');

        await expect(addGearPage.measurementsHeading()).toBeVisible();
        for (const input of await addGearPage.measurementInputs().all()) {
          await addGearPage.tabUntilFocused(input);
          await addGearPage.pressKey('1');
          await addGearPage.pressKey('Tab');
        }
        await addGearPage.tabUntilFocused(saveAndContinueButton);
        await addGearPage.pressKey('Enter');
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
      });
    }
  );
});
