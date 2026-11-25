/**
 * Add favourite gear.
 * Fishers search the gear catalogue, provide any required measurements and save the gear as a favourite,
 * so it is offered on the gear selection page of future catch records.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { gears, errorMessages } from '../../../test-data/testData';

type FavouriteGearData = {
  name: string;
};

type MeasuredGearData = FavouriteGearData & {
  gearDimension: string;
};

// Gear names and measurements confirmed by existing gear specs; validation messages confirmed on the live app
const testFavouriteGears = [gears.pots.name, gears.traps.name, gears.seineNets.name];
const isSeineNets = (name: string): boolean => name === gears.seineNets.name;

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow }) => {
    await test.step('I am signed in without the test gear saved as a favourite', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add favourite gear UI tests'
      });
      await gearFlow.removeSavedGears(testFavouriteGears);
    });
  });

  // Page fixtures are per test, so clean-up runs after each test rather than in afterAll
  test.afterEach(async ({ gearFlow, catchRecordFlow }) => {
    await gearFlow.removeSavedGears(testFavouriteGears);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Saves a gear favourite when valid measurements are provided',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ navigationFlow, accountPage, addGearPage, gearSelectionPage }) => {
      await test.step('I am creating or managing a catch record', async () => {
        await navigationFlow.openAccount();
      });

      await test.step('I search for and select a gear type', async () => {
        await accountPage.clickAddGear();
        await addGearPage.searchAndSelectGear(gears.pots.name);
      });

      await test.step('I provide any required measurements', async () => {
        await addGearPage.clickSaveAndContinue();
        await addGearPage.gearDimensionInput().fill(gears.pots.gearDimension);
      });

      await test.step('I select "Save and continue"', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The gear is saved to my favourites', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(
          new RegExp(`Gear dimension by number.*: ${gears.pots.gearDimension}`)
        );
      });

      await test.step('It is available for future catch records', async () => {
        // Favourites are saved per vessel, so a record must be started to give gear selection its vessel
        await navigationFlow.startCatchRecord();
        await gearSelectionPage.goto('/gear-selection');
        await expect(gearSelectionPage.gearCheckbox(gears.pots.name)).toBeVisible();
      });
    }
  );

  test(
    'Preserves existing favourites when a different gear is added',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage }) => {
      await test.step('I already have saved gear', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('I add a different gear type', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(gears.traps.name);
      });

      await test.step('Both gears appear in my favourites list', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.traps.name);
      });
    }
  );

  test(
    'Displays errors and does not save gear when mandatory measurements are missing',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, addGearPage }) => {
      let gearBefore: string;

      await test.step('I have selected a gear that requires measurements', async () => {
        await navigationFlow.openAccount();
        gearBefore = await accountPage.getGearOnboardText();
        await accountPage.clickAddGear();
        await gearFlow.selectGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('I do not enter the mandatory values', async () => {
        for (const input of await addGearPage.measurementInputs().all()) {
          await input.clear();
        }
      });

      await test.step('I attempt to continue', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The system displays a validation message', async () => {
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.missingMeshSize);
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.missingGearDimension);
      });

      await test.step('The gear is not saved', async () => {
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Displays an error and does not save gear when a measurement is fractional',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, addGearPage }) => {
      let gearBefore: string;

      await test.step('I have selected a gear', async () => {
        await navigationFlow.openAccount();
        gearBefore = await accountPage.getGearOnboardText();
        await accountPage.clickAddGear();
        await gearFlow.selectGearWithMeasurements(gears.seineNets.searchTerm, isSeineNets);
      });

      await test.step('I enter an invalid measurement value', async () => {
        await addGearPage.measurementInputs().first().fill(gears.measurements.invalid);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The system displays an appropriate validation message', async () => {
        await expect(addGearPage.errorSummary()).toContainText(errorMessages.gears.invalidMeasurement);
      });

      await test.step('Prevents submission', async () => {
        await addGearPage.expectUrl(/\/add-gear/);
        await accountPage.goto('/account');
        await expect(accountPage.gearOnboardValue()).toHaveText(gearBefore);
      });
    }
  );

  test(
    'Displays saved favourite gear when a new catch record is started',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, gearSelectionPage }) => {
      await test.step('I previously saved a favourite gear', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(gears.pots.gearDimension);
      });

      await test.step('I start a new catch record', async () => {
        await navigationFlow.startCatchRecord();
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('The gear appears in my available gear list', async () => {
        await expect(gearSelectionPage.gearCheckbox(gears.pots.name)).toBeVisible();
      });
    }
  );
});
