/**
 * Remove saved favourite gear configurations without removing catalogue entries.
 * Covers confirmation, cancellation, retained favourites, future trips and replacement measurements.
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { gears } from '../../../test-data/testData';

const testFavouriteGears = [gears.pots.name, gears.traps.name];
const gearDimensionText = (dimension: string): RegExp => new RegExp(`Gear dimension by number.*: ${dimension}`);

test.describe('Remove favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow, accountPage }) => {
    await test.step('I am signed in and have a saved favourite gear configuration', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Remove favourite gear UI tests'
      });
      await gearFlow.removeSavedGears(testFavouriteGears);
      await navigationFlow.openAddGear();
      await gearFlow.savePots(gears.pots.gearDimension);
      await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
    });
  });

  // Page fixtures are per test, so clean-up runs after each test rather than in afterAll
  test.afterEach(async ({ gearFlow, catchRecordFlow }) => {
    await gearFlow.removeSavedGears(testFavouriteGears);
    await catchRecordFlow.deleteCreatedDrafts();
  });

  test(
    'Removes favourite gear when removal is confirmed',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ accountPage, removeGearPage }) => {
      await test.step('I select my saved gear for removal', async () => {
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(gears.pots.name);
      });

      await test.step('I confirm removal by selecting Continue', async () => {
        await removeGearPage.clickContinue();
      });

      await test.step('The gear is no longer saved as a favourite', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
      });
    }
  );

  test(
    'Preserves the remaining gear and measurements when one favourite is removed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, removeGearPage }) => {
      let retainedHint: string;

      await test.step('I have multiple favourite gear configurations saved', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(gears.traps.name);
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.traps.name);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearHint(gears.traps.name)).toBeVisible();
        retainedHint = await removeGearPage.gearHint(gears.traps.name).innerText();
      });

      await test.step('I select only one favourite and confirm removal', async () => {
        await removeGearPage.selectGearToRemove(gears.pots.name);
        await expect(removeGearPage.gearCheckbox(gears.traps.name)).not.toBeChecked();
        await removeGearPage.clickContinue();
      });

      await test.step('The selected gear is removed and the remaining configuration is unchanged', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(gears.traps.name);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
        await expect(removeGearPage.gearCheckbox(gears.pots.name)).toHaveCount(0);
        await expect(removeGearPage.gearCheckbox(gears.traps.name)).toBeVisible();
        await expect(removeGearPage.gearHint(gears.traps.name)).toHaveText(retainedHint);
      });
    }
  );

  test(
    'Preserves the favourite configuration when leaving without confirming removal',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, removeGearPage }) => {
      let savedGear: string;

      await test.step('I have selected a favourite gear for removal', async () => {
        savedGear = await accountPage.getGearOnboardText();
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(gears.pots.name);
      });

      await test.step('I go back without confirming removal', async () => {
        await removeGearPage.common.backLink().click();
      });

      await test.step('My saved gear and its measurements remain unchanged', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).toHaveText(savedGear);
        await expect(accountPage.gearOnboardValue()).toContainText(gearDimensionText(gears.pots.gearDimension));
      });
    }
  );

  test(
    'Excludes removed gear from future trip favourites while keeping it searchable',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, removeGearPage, navigationFlow, gearSelectionPage, addGearPage }) => {
      await test.step('I have removed a previously saved favourite gear', async () => {
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(gears.pots.name);
        await removeGearPage.clickContinue();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
      });

      await test.step('I start a new catch record and reach gear selection', async () => {
        // Favourites are saved per vessel, so a record must be started to give gear selection its vessel
        await navigationFlow.startCatchRecord();
        await gearSelectionPage.goto('/gear-selection');
      });

      await test.step('The removed gear is not offered as a favourite', async () => {
        await expect(gearSelectionPage.pageHeading()).toBeVisible();
        await expect(gearSelectionPage.gearCheckbox(gears.pots.name)).toHaveCount(0);
      });

      await test.step('The gear remains available through the standard catalogue search', async () => {
        await gearSelectionPage.addGearLink().click();
        await expect(addGearPage.gearInput()).toBeEditable();
        await addGearPage.searchGearOptions(gears.pots.searchTerm);
        await expect(addGearPage.gearOption(gears.pots.name)).toBeVisible();
      });
    }
  );

  test(
    'Removes all selected favourite gears when removal is confirmed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, removeGearPage }) => {
      await test.step('I have multiple saved favourite gears', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(gears.traps.name);
        await accountPage.expectUrl(/\/account$/);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(gears.pots.name)).toBeVisible();
        await expect(removeGearPage.gearCheckbox(gears.traps.name)).toBeVisible();
      });

      await test.step('I select both favourites and confirm removal', async () => {
        await removeGearPage.selectGearToRemove(gears.pots.name, gears.traps.name);
        await expect(removeGearPage.gearCheckbox(gears.pots.name)).toBeChecked();
        await expect(removeGearPage.gearCheckbox(gears.traps.name)).toBeChecked();
        await removeGearPage.clickContinue();
      });

      await test.step('Neither selected gear remains saved after reloading', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.traps.name);
      });
    }
  );

  test(
    'Requires new measurements when previously removed favourite gear is re-added',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, removeGearPage, addGearPage }) => {
      await test.step('I have removed a favourite with saved measurements', async () => {
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(gears.pots.name);
        await removeGearPage.clickContinue();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(gears.pots.name);
      });

      await test.step('I select the same gear from the catalogue again', async () => {
        await accountPage.clickAddGear();
        await addGearPage.searchAndSelectGear(gears.pots.name);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The previous favourite measurement is not restored', async () => {
        await expect(addGearPage.measurementsHeading('pots')).toBeVisible();
        await expect(addGearPage.gearDimensionInput()).toBeEmpty();
      });

      await test.step('I save a new measurement', async () => {
        await addGearPage.gearDimensionInput().fill(gears.measurements.replacementDimension);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('Only the new configuration is saved', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).toContainText(
          gearDimensionText(gears.measurements.replacementDimension)
        );
        await expect(accountPage.gearOnboardValue()).not.toContainText(gearDimensionText(gears.pots.gearDimension));
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(gears.pots.name)).toHaveCount(1);
      });
    }
  );
});
