import { expect, test } from '../../../fixtures/commonfixture';

function occurrences(text: string, value: string): number {
  return text.split(value).length - 1;
}

test.describe('Add favourite gear', () => {
  test.beforeEach(async ({ navigationFlow, gearFlow }) => {
    await navigationFlow.signIn();
    await gearFlow.removeSavedGears(['Long line', 'Set net', 'Pots']);
  });

  test(
    'Displays matching gear and required measurement fields when a catalogue entry is selected',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('Shows a matching gear option and the required fields after selection', async () => {
        await navigationFlow.openAddGear();
        const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
        await addGearPage.searchAndSelectGear(gearName);
        await expect(addGearPage.gearInput()).toHaveValue(gearName);
        await addGearPage.clickSaveAndContinue();
        await expect(addGearPage.measurementsHeading()).toBeVisible();
        await expect(addGearPage.measurementInputs().first()).toBeVisible();
      });
    }
  );

  test(
    'Displays approved gear search results and rejects entries outside the catalogue',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, addGearPage }) => {
      await test.step('Searches approved gear and rejects a value outside the catalogue', async () => {
        await navigationFlow.openAddGear();
        await expect(addGearPage.pageHeading()).toBeVisible();
        const [firstGear] = await addGearPage.searchGearOptions('po');
        expect(firstGear).toBeTruthy();
        await expect(
          addGearPage.gearResultsList().getByRole('option', { name: firstGear!, exact: true })
        ).toBeVisible();

        await addGearPage.gearInput().fill('Not a catalogue gear');
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toContainText('Select a gear type from the list');
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Displays an error when no gear type is selected',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, addGearPage }) => {
      await test.step('Requires a gear type before continuing', async () => {
        await navigationFlow.openAddGear();
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toContainText('Select the gear you want to add');
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Makes favourite gear available for catch recording when saved with measurements',
    { tag: ['@ui', '@smoke', '@addGear'] },
    async ({ navigationFlow, gearFlow, accountPage, gearSelectionPage }) => {
      await test.step('Saves gear with measurements and makes it available for the next catch record', async () => {
        await navigationFlow.openAddGear();
        const gearName = await gearFlow.saveLineGear();

        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
        await gearSelectionPage.goto('/gear-selection');
        await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
      });
    }
  );

  test(
    'Displays the saved pots measurement in account favourites',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, accountPage }) => {
      await test.step('Shows saved pots measurement under the favourite gear on the account page', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots('45');

        await expect(accountPage.gearOnboardValue()).toContainText('Pots');
        await expect(accountPage.gearOnboardValue()).toContainText(/Gear dimension by number.*: 45/);
      });
    }
  );

  test(
    'Excludes gear from search results when it is already a favourite',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('Does not offer a gear that is already a favourite in the search list', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots('45');

        await navigationFlow.openAddGear();
        await addGearPage.gearInput().pressSequentially('Pot');
        await expect(addGearPage.gearOption('Pots')).toHaveCount(0);
      });
    }
  );

  test(
    'Displays an error and preserves the saved configuration when duplicate gear is submitted',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage }) => {
      await test.step('Blocks adding a gear that is already a favourite', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots('45');

        await navigationFlow.openAddGear();
        await addGearPage.gearInput().fill('Pots');
        await addGearPage.clickSaveAndContinue();

        await addGearPage.expectUrl(/\/add-gear/);
        await expect(addGearPage.errorSummary()).toContainText('Pots has already been added to your gear');
        await expect(addGearPage.errorMessage()).toContainText('Pots has already been added to your gear');

        await accountPage.goto('/account');
        expect(occurrences(await accountPage.getGearOnboardText(), 'Pots')).toBe(1);
        await expect(accountPage.gearOnboardValue()).toContainText(/: 45/);
      });
    }
  );

  test(
    'Lists gear only once for removal after a duplicate addition is attempted',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage, removeGearPage }) => {
      await test.step('Lists a duplicate-attempted gear only once on the remove gear page', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.savePots('45');
        await navigationFlow.openAddGear();
        await addGearPage.gearInput().fill('Pots');
        await addGearPage.clickSaveAndContinue();

        await accountPage.goto('/account');
        await accountPage.clickRemoveGear();
        await expect(removeGearPage.gearCheckbox('Pots')).toHaveCount(1);
      });
    }
  );

  test(
    'Preserves both favourites when different gear types are saved',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage }) => {
      await test.step('Keeps multiple different favourite gears', async () => {
        await navigationFlow.openAddGear();
        const lineGear = await gearFlow.saveLineGear();

        await navigationFlow.openAddGear();
        const secondGear = await gearFlow.findGear('po', (name) => name !== lineGear);
        await addGearPage.searchAndSelectGear(secondGear);
        await addGearPage.clickSaveAndContinue();
        const measurementsHeading = addGearPage.measurementsHeading();
        if (await measurementsHeading.isVisible()) {
          for (const input of await addGearPage.measurementInputs().all()) {
            await input.fill('1');
          }
          await addGearPage.clickSaveAndContinue();
        }

        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(lineGear);
        await expect(accountPage.gearOnboardValue()).toContainText(secondGear);
      });
    }
  );

  test(
    'Prevents saving gear when required measurements are missing',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('Does not save gear when required measurements are missing', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.selectLineGear();
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toBeVisible();
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Displays errors when gear measurements are fractional or negative',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('Rejects fractional and negative measurements', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.selectLineGear();
        const input = addGearPage.measurementInputs().first();
        await input.fill('1.5');
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toBeVisible();
        await addGearPage.expectUrl(/\/add-gear/);
        await input.fill('-1');
        await addGearPage.clickSaveAndContinue();

        await expect(addGearPage.errorSummary()).toBeVisible();
        await addGearPage.expectUrl(/\/add-gear/);
      });
    }
  );

  test(
    'Displays an error when a gear measurement is zero',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage }) => {
      await test.step('Rejects zero measurements', async () => {
        await navigationFlow.openAddGear();
        await gearFlow.selectLineGear();
        await addGearPage.measurementInputs().first().fill('0');
        await addGearPage.clickSaveAndContinue();

        await addGearPage.expectUrl(/\/add-gear/);
        await expect(addGearPage.errorSummary()).toBeVisible();
      });
    }
  );

  test(
    'Displays saved gear when a new catch record is started in the same session',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, recordsPage, accountPage, gearSelectionPage, selectVesselPage }) => {
      await test.step('Offers saved gear when starting a new catch record in the same session', async () => {
        await navigationFlow.openAddGear();
        const gearName = await gearFlow.saveLineGear();

        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
        await recordsPage.goto('/records');
        await recordsPage.createNewRecordButton().click();
        await expect(selectVesselPage.pageHeading()).toBeVisible();
        await selectVesselPage.firstVesselRadio().check();
        await selectVesselPage.clickSaveAndContinue();
        await selectVesselPage.expectUrl(/\/trip-date$/);
        await gearSelectionPage.goto('/gear-selection');

        await expect(gearSelectionPage.gearCheckbox(gearName)).toBeVisible();
      });
    }
  );

  test(
    'Saves the selected gear when Enter is pressed in the input fields',
    { tag: ['@ui', '@regression', '@addGear'] },
    async ({ navigationFlow, gearFlow, addGearPage, accountPage }) => {
      await test.step('Can save selected gear by pressing Enter from the input fields', async () => {
        await navigationFlow.openAddGear();
        const gearName = await gearFlow.findGear('lo', (name) => /line/i.test(name));
        await addGearPage.searchAndSelectGear(gearName);

        await addGearPage.gearInput().press('Enter');

        await expect(addGearPage.measurementsHeading()).toBeVisible();
        await expect(addGearPage.measurementInputs().first()).toBeVisible();
        for (const input of await addGearPage.measurementInputs().all()) {
          await input.fill('1');
        }
        await addGearPage.measurementInputs().last().press('Enter');

        await accountPage.expectUrl(/\/account$/);
        await expect(accountPage.gearOnboardValue()).toContainText(gearName);
      });
    }
  );
});
