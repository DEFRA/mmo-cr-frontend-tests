/**
 * Add favourite gear.
 * Fishers search the gear catalogue, enter required measurements, and save gear as a favourite for future catch records.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { gears, errorMessages } from '../../../test-data/testData';

type InvalidMeasurement = { description: string; value: string };

// Gear names, measurements and validation messages confirmed by existing gear specs and the live app
const isSeineNets = (name: string): boolean => name === gears.seineNets.name;
const testFavouriteGears = [gears.seineNets.name, gears.pots.name];

const invalidMeasurements: InvalidMeasurement[] = [
  { description: 'fractional', value: '1.5' },
  { description: 'negative', value: '-1' },
  { description: 'zero', value: '0' }
];

const duplicateGearError = `${gears.pots.name}${errorMessages.gears.duplicateSuffix}`;

function occurrences(text: string, value: string): number {
  return text.split(value).length - 1;
}

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow }) => {
    await test.step('I am signed in without the test gear saved as a favourite', async () => {
      await navigationFlow.signIn();
      await gearFlow.removeSavedGears(testFavouriteGears);
    });
  });

  // Page fixtures are per test, so clean-up runs after each test rather than in afterAll
  test.afterEach(async ({ gearFlow, catchRecordFlow }) => {
    await gearFlow.removeSavedGears(testFavouriteGears);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Displays matching gear and required measurement fields when a catalogue entry is selected',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('I am on the add gear page', async () => {
        await navigationFlow.openAddGear();
      });

      await test.step('I search for and select a gear type', async () => {
        await gearFlow.selectGear(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('The selected gear is shown in the search field', async () => {
        await expect(addGearPage.gearInput()).toHaveValue(gears.seineNets.name);
      });

      await test.step('I select "Save and continue"', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The required measurement fields are displayed', async () => {
        await expect(addGearPage.measurementsHeading()).toBeVisible();
        await expect(addGearPage.measurementInputs().first()).toBeVisible();
      });
    }
  );

  test(
    'Displays approved gear search results and rejects entries outside the catalogue',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, addGearPage }) => {
      let firstResult: string | undefined;

      await test.step('I am on the add gear page', async () => {
        await navigationFlow.openAddGear();
      });

      await test.step('I search the gear catalogue', async () => {
        [firstResult] = await addGearPage.searchGearOptions(gears.searchable.searchTerm);
      });

      await test.step('Matching approved gear is suggested', async () => {
        expect(firstResult).toBeTruthy();
        await expect(addGearPage.gearOption(firstResult!)).toBeVisible();
      });

      await test.step('I try to save gear outside the approved catalogue', async () => {
        await addGearPage.gearInput().fill(gears.unapproved);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I must select a gear type from the list', async () => {
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.unapproved);
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Displays an error when no gear type is selected',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, addGearPage }) => {
      await test.step('I am on the add gear page', async () => {
        await navigationFlow.openAddGear();
      });

      await test.step('I select "Save and continue" without selecting a gear type', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I am asked to select the gear I want to add', async () => {
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.noneSelected);
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Makes favourite gear available for catch recording when saved with measurements',
    { tag: ['@ui', '@smoke', '@addGear'] },
    async ({ navigationFlow, gearFlow, accountPage, gearSelectionPage }) => {
      await test.step('I am on the add gear page', async () => {
        await navigationFlow.openAddGear();
      });

      await test.step('I save gear with its required measurements', async () => {
        await gearFlow.saveGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('The gear is saved to my favourites', async () => {
        await expect(accountPage.gearOnboardValue()).toContainText(gears.seineNets.name);
      });

      await test.step('I start a new catch record and open gear selection', async () => {
        // Favourites are saved per vessel, so a record must be started to give gear selection its vessel
        await navigationFlow.startCatchRecord();
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('The saved gear is offered for the catch record', async () => {
        await expect(gearSelectionPage.gearCheckbox(gears.seineNets.name)).toBeVisible();
      });
    }
  );

  test(
    'Displays the saved pots measurement in account favourites',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, accountPage }) => {
      await test.step('I am on the add gear page', async () => {
        await navigationFlow.openAddGear();
      });

      await test.step('I save pots with a gear dimension', async () => {
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('Pots and its measurement are shown in my favourites', async () => {
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(
          new RegExp(`Gear dimension by number.*: ${gears.pots.gearDimension}`)
        );
      });
    }
  );

  test(
    'Excludes gear from search results when it is already a favourite',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('I have saved pots as a favourite', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('I search for pots again', async () => {
        await navigationFlow.openAddGear();
        await addGearPage.gearInput().pressSequentially(gears.pots.typedSearchTerm);
      });

      await test.step('Pots is not offered in the search results', async () => {
        await expect(addGearPage.gearOption(gears.pots.name)).toHaveCount(0);
      });
    }
  );

  test(
    'Displays an error and preserves the saved configuration when duplicate gear is submitted',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage, removeGearPage }) => {
      await test.step('I have saved pots as a favourite', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('I submit pots again', async () => {
        await navigationFlow.openAddGear();
        await addGearPage.gearInput().fill(gears.pots.name);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('I am told pots has already been added', async () => {
        await addGearPage.expectUrl(/\/add-gear/);
        await expect(addGearPage.errorSummary()).toContainText(duplicateGearError);
        await expect(addGearPage.errorMessage()).toContainText(duplicateGearError);
      });

      await test.step('Pots is saved once with its original measurement', async () => {
        await accountPage.goto('/account');
        expect(occurrences(await accountPage.getGearOnboardText(), gears.pots.name)).toBe(1);
        await expect(accountPage.gearOnboardValue()).toContainText(`: ${gears.pots.gearDimension}`);
      });

      await test.step('Pots is listed only once for removal', async () => {
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(gears.pots.name)).toHaveCount(1);
      });
    }
  );

  test(
    'Preserves both favourites when different gear types are saved',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, accountPage }) => {
      await test.step('I have saved gear with measurements as a favourite', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('I save a different gear type', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('Both gears are shown in my favourites', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.seineNets.name);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
      });
    }
  );

  test(
    'Prevents saving gear when required measurements are missing',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('I have selected gear that requires measurements', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.selectGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('I select "Save and continue" without entering the measurements', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The missing measurements are reported and the gear is not saved', async () => {
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.missingGearDimension);
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.missingMeshSize);
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  for (const invalidMeasurement of invalidMeasurements) {
    test(
      `Displays an error when a gear measurement is ${invalidMeasurement.description}`,
      { tag: ['@ui', '@regression', '@addGear'] },
      async ({ navigationFlow, gearFlow, addGearPage }) => {
        await test.step('I have selected gear that requires measurements', async () => {
          await navigationFlow.openAddGear();
          await gearFlow.selectGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
        });

        await test.step(`I enter a ${invalidMeasurement.description} measurement and continue`, async () => {
          await addGearPage.measurementInputs().first().fill(invalidMeasurement.value);
          await addGearPage.clickSaveAndContinue();
        });

        await test.step('A validation error is displayed and the gear is not saved', async () => {
          await expect(addGearPage.errorSummary()).toBeVisible();
          await addGearPage.expectUrl(/\/add-gear/);
        });
      }
    );
  }

  test(
    'Saves the selected gear when Enter is pressed in the input fields',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage }) => {
      await test.step('I have selected a gear type', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.selectGear(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('I press Enter in the gear field', async () => {
        await addGearPage.gearInput().press('Enter');
      });

      await test.step('The measurement fields are displayed', async () => {
        await expect(addGearPage.measurementsHeading()).toBeVisible();
        await expect(addGearPage.measurementInputs().first()).toBeVisible();
      });

      await test.step('I enter the measurements and press Enter', async () => {
        for (const input of await addGearPage.measurementInputs().all()) {
          await input.fill(gears.measurements.valid);
        }
        await addGearPage.measurementInputs().last().press('Enter');
      });

      await test.step('The gear is saved to my favourites', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.seineNets.name);
      });
    }
  );
});
