/**
 * Add favourite gear.
 * Fishers search the gear catalogue, provide any required measurements and save the gear as a favourite,
 * so it is offered on the gear selection page of future catch records.
 *
 * @author Randhir Patel
 * @since 2026-11-16
 */
import { expect, test } from '../../../fixtures/commonfixture';

type FavouriteGearData = {
  name: string;
};

type MeasuredGearData = FavouriteGearData & {
  gearDimension: string;
};

// Gear names, measurements and validation messages confirmed by existing gear specs
const pots: MeasuredGearData = { name: 'Pots', gearDimension: '45' };
const traps: FavouriteGearData = { name: 'Traps (not specified)' };
const testFavouriteGears = [pots.name, traps.name];

const invalidMeasurement = '1.5';
const missingNumberOfLinesError = 'Enter the number of lines';
const missingGearDimensionError = /Enter the gear dimension by number/i;
const invalidMeasurementError = 'Enter a whole number';

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow }) => {
    await navigationFlow.signIn({
      requiredCredentialsMessage:
        'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Add favourite gear UI tests'
    });
    await gearFlow.removeSavedGears(testFavouriteGears);
  });

  test.afterEach(async ({ gearFlow }) => {
    await gearFlow.removeSavedGears(testFavouriteGears);
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
        await addGearPage.searchAndSelectGear(pots.name);
      });

      await test.step('I provide any required measurements', async () => {
        await addGearPage.clickSaveAndContinue();
        await addGearPage.gearDimensionInput().fill(pots.gearDimension);
      });

      await test.step('I select "Save and continue"', async () => {
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The gear is saved to my favourites', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(
          new RegExp(`Gear dimension by number.*: ${pots.gearDimension}`)
        );
      });

      await test.step('It is available for future catch records', async () => {
        await gearSelectionPage.goto('/gear-selection');
        await expect(gearSelectionPage.gearCheckbox(pots.name)).toBeVisible();
      });
    }
  );

  test(
    'Preserves existing favourites when a different gear is added',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage }) => {
      await test.step('I already have saved gear', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(pots.gearDimension);
      });

      await test.step('I add a different gear type', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(traps.name);
      });

      await test.step('Both gears appear in my favourites list', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(traps.name);
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
        await gearFlow.selectLineGear();
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
        await expect(addGearPage.errorSummary()).toContainText(missingNumberOfLinesError);
        await expect(addGearPage.errorSummary()).toContainText(missingGearDimensionError);
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
        await gearFlow.selectLineGear();
      });

      await test.step('I enter an invalid measurement value', async () => {
        await addGearPage.measurementInputs().first().fill(invalidMeasurement);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The system displays an appropriate validation message', async () => {
        await expect(addGearPage.errorSummary()).toContainText(invalidMeasurementError);
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
    async ({ navigationFlow, gearFlow, recordsPage, selectVesselPage, gearSelectionPage }) => {
      await test.step('I previously saved a favourite gear', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots(pots.gearDimension);
      });

      await test.step('I start a new catch record', async () => {
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
        await selectVesselPage.selectVessel('ACHILLES');
        await selectVesselPage.clickSaveAndContinue();
        await selectVesselPage.expectUrl(/\/trip-date$/);
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('The gear appears in my available gear list', async () => {
        await expect(gearSelectionPage.pageHeading()).toBeVisible();
        await expect(gearSelectionPage.gearCheckbox(pots.name)).toBeVisible();
      });
    }
  );
});
