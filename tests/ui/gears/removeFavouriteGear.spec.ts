/**
 * Remove saved favourite gear configurations without removing catalogue entries.
 * Covers confirmation, cancellation, retained favourites, future trips and replacement measurements.
 */
import { expect, test } from '../../../fixtures/commonfixture';

const pots = { name: 'Pots', gearDimension: '45' };
const traps = 'Traps (not specified)';
const testFavouriteGears = [pots.name, traps];
const replacementDimension = '90';

test.describe('Remove favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow, accountPage }) => {
    await test.step('I am signed in and have a saved favourite gear configuration', async () => {
      await navigationFlow.signIn({
        requiredCredentialsMessage:
          'CATCH_RECORDING_EMAIL and CATCH_RECORDING_PASSWORD are required for Remove favourite gear UI tests'
      });
      await gearFlow.removeSavedGears(testFavouriteGears);
      await navigationFlow.openAddGear();
      await gearFlow.savePots(pots.gearDimension);
      await expect(accountPage.gearOnboardValue()).toContainText(pots.name);
    });
  });

  test.afterEach(async ({ gearFlow }) => {
    await gearFlow.removeSavedGears(testFavouriteGears);
  });

  test(
    'Removes favourite gear when removal is confirmed',
    { tag: ['@ui', '@smoke', '@favouriteGear'] },
    async ({ accountPage, removeGearPage }) => {
      await test.step('I select my saved gear for removal', async () => {
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
        await expect(removeGearPage.gearHint(pots.name)).toContainText(
          new RegExp(`Gear dimension by number.*: ${pots.gearDimension}`)
        );
        await removeGearPage.selectGearToRemove(pots.name);
        await expect(removeGearPage.gearCheckbox(pots.name)).toBeChecked();
      });

      await test.step('I confirm removal by selecting Continue', async () => {
        await removeGearPage.clickContinue();
      });

      await test.step('The gear is no longer saved as a favourite', async () => {
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
      });
    }
  );

  test(
    'Preserves the remaining gear and measurements when one favourite is removed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, removeGearPage }) => {
      let retainedMeasurements: string;

      await test.step('I have multiple favourite gear configurations saved', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(traps);
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(traps);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearHint(traps)).toBeVisible();
        retainedMeasurements = await removeGearPage.gearHint(traps).innerText();
      });

      await test.step('I select only one favourite and confirm removal', async () => {
        await removeGearPage.selectGearToRemove(pots.name);
        await expect(removeGearPage.gearCheckbox(traps)).not.toBeChecked();
        await removeGearPage.clickContinue();
      });

      await test.step('The selected gear is removed and the remaining configuration is unchanged', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
        await expect(accountPage.gearOnboardValue()).toContainText(traps);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
        await expect(removeGearPage.gearCheckbox(pots.name)).toHaveCount(0);
        await expect(removeGearPage.gearCheckbox(traps)).toBeVisible();
        await expect(removeGearPage.gearHint(traps)).toHaveText(retainedMeasurements);
      });
    }
  );

  test(
    'Preserves the favourite configuration when leaving without confirming removal',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, removeGearPage }) => {
      let savedGear: string;

      await test.step('I have selected a favourite gear for removal', async () => {
        savedGear = await accountPage.gearOnboardValue().innerText();
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.pageHeading()).toBeVisible();
        await removeGearPage.selectGearToRemove(pots.name);
        await expect(removeGearPage.gearCheckbox(pots.name)).toBeChecked();
      });

      await test.step('I go back without confirming removal', async () => {
        await removeGearPage.common.backLink().click();
      });

      await test.step('My saved gear and its measurements remain unchanged', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).toHaveText(savedGear);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(pots.name)).toBeVisible();
        await expect(removeGearPage.gearHint(pots.name)).toContainText(
          new RegExp(`Gear dimension by number.*: ${pots.gearDimension}`)
        );
      });
    }
  );

  test(
    'Excludes removed gear from future trip favourites while keeping it searchable',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({
      accountPage,
      removeGearPage,
      recordsPage,
      selectVesselPage,
      tripDatePage,
      navigationFlow,
      gearSelectionPage,
      addGearPage
    }) => {
      await test.step('I have removed a previously saved favourite gear', async () => {
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(pots.name);
        await removeGearPage.clickContinue();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
      });

      await test.step('I start a new catch record and reach gear selection', async () => {
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
        await expect(selectVesselPage.pageHeading()).toBeVisible();
        await selectVesselPage.firstVesselRadio().check();
        await selectVesselPage.clickSaveAndContinue();
        await tripDatePage.expectUrl(/\/trip-date$/);
        await tripDatePage.yesRadio().check();
        await tripDatePage.clickSaveAndContinue();
        await navigationFlow.selectDeparturePort('Plymouth');
      });

      await test.step('The removed gear is not offered as a favourite', async () => {
        await gearSelectionPage.expectUrl(/\/gear-selection$/);
        await expect(gearSelectionPage.pageHeading()).toBeVisible();
        await expect(gearSelectionPage.gearCheckbox(pots.name)).toHaveCount(0);
      });

      await test.step('The gear remains available through the standard catalogue search', async () => {
        await gearSelectionPage.addGearLink().click();
        await expect(addGearPage.pageHeading()).toBeVisible();
        await addGearPage.searchGearOptions('po');
        await expect(addGearPage.gearOption(pots.name)).toBeVisible();
      });
    }
  );

  test(
    'Removes all selected favourite gears when removal is confirmed',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ navigationFlow, gearFlow, accountPage, removeGearPage }) => {
      await test.step('I have multiple saved favourite gears', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.saveGearFromAddPage(traps);
        await accountPage.expectUrl(/\/account$/);
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(pots.name)).toBeVisible();
        await expect(removeGearPage.gearCheckbox(traps)).toBeVisible();
      });

      await test.step('I select both favourites and confirm removal', async () => {
        await removeGearPage.selectGearToRemove(pots.name, traps);
        await expect(removeGearPage.gearCheckbox(pots.name)).toBeChecked();
        await expect(removeGearPage.gearCheckbox(traps)).toBeChecked();
        await removeGearPage.clickContinue();
      });

      await test.step('Neither selected gear remains saved after reloading', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
        await expect(accountPage.gearOnboardValue()).not.toContainText(traps);
      });
    }
  );

  test(
    'Requires new measurements when previously removed favourite gear is re-added',
    { tag: ['@ui', '@regression', '@favouriteGear'] },
    async ({ accountPage, removeGearPage, addGearPage }) => {
      await test.step('I have removed a favourite with saved measurements', async () => {
        await accountPage.clickRemoveGear();
        await removeGearPage.selectGearToRemove(pots.name);
        await removeGearPage.clickContinue();
        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).not.toContainText(pots.name);
      });

      await test.step('I select the same gear from the catalogue again', async () => {
        await accountPage.clickAddGear();
        await addGearPage.searchAndSelectGear(pots.name);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('The previous favourite measurement is not restored', async () => {
        await expect(addGearPage.measurementsHeading('pots')).toBeVisible();
        await expect(addGearPage.gearDimensionInput()).toBeEmpty();
      });

      await test.step('I save a new measurement', async () => {
        await addGearPage.gearDimensionInput().fill(replacementDimension);
        await addGearPage.clickSaveAndContinue();
      });

      await test.step('Only the new configuration is offered for removal', async () => {
        await accountPage.expectUrl(/\/account$/);
        await accountPage.reload();
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox(pots.name)).toHaveCount(1);
        await expect(removeGearPage.gearHint(pots.name)).toContainText(
          new RegExp(`Gear dimension by number.*: ${replacementDimension}`)
        );
        await expect(removeGearPage.gearHint(pots.name)).not.toContainText(
          new RegExp(`Gear dimension by number.*: ${pots.gearDimension}`)
        );
      });
    }
  );
});
