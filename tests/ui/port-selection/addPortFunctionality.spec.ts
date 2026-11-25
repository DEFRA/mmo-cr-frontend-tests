/**
 * Select a previously used port, or add another port through the "Add port" link, on the departure-port and
 * return-port screens of a new catch record.
 * Traceability: CRAR-422.
 *
 * @author Hemasrivani07
 * @since 2026-11-24
 */
import { expect, test } from '../../../fixtures/commonfixture';
import { type Favourites, type TripDates, daysAgo } from '../helpers/catchRecordFlow';
import { vessels, ports, checkAnswers, errorMessages } from '../../../test-data/testData';

const testFavourites: Favourites = { ports: [ports.first, ports.second], gears: [], species: [] };
const absentFavourites: Favourites = { ports: [ports.third], gears: [], species: [] };

type BackNavigationScenario = {
  tripType: string;
  tripDates?: TripDates;
  previousScreen: string;
  previousUrl: RegExp;
};

type WelshScenario = {
  portScreen: string;
  isReturnScreen: boolean;
};

const welshScenarios: WelshScenario[] = [
  { portScreen: 'Select the port you set off from', isReturnScreen: false },
  { portScreen: 'Select the port you returned to', isReturnScreen: true }
];

const backNavigationScenarios: BackNavigationScenario[] = [
  { tripType: 'same-day', previousScreen: 'Did your trip start and finish today?', previousUrl: /\/trip-date$/ },
  {
    tripType: 'multi-day',
    // Departure two days ago, return yesterday
    tripDates: { departureDate: daysAgo(2), returnDate: daysAgo(1) },
    previousScreen: 'Which date did you return from your trip?',
    previousUrl: /\/trip-return-date$/
  }
];

test.describe('Select a previously used port or add another port', () => {
  test.describe('Add a port that is not among my previously used ports', () => {
    test.use({ testFavourites, absentFavourites });

    // Requesting createdRecords signs in, saves testFavourites and removes absentFavourites before the Background steps
    test.beforeEach(async ({ createdRecords }) => {
      await test.step(`"${ports.first}" and "${ports.second}" are ports I have previously used`, async () => {
        // Saved at sign-in by the createdRecords fixture; this test has not created any draft yet
        void createdRecords;
      });

      await test.step(`"${ports.third}" is not a port I have previously used`, async () => {
        // Removed at sign-in by the createdRecords fixture and restored after the test
      });
    });

    test(
      'Add a departure port from the "Select the port you set off from" screen',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({
        createdRecords,
        catchRecordFlow,
        departurePortPage,
        returnPortPage,
        confirmSamePortPage,
        addPortPage,
        checkAnswersPage
      }) => {
        let reference = '';

        await test.step(`I have started a new catch record for "${vessels.testVessel}"`, async () => {
          reference = await catchRecordFlow.startRecord(vessels.testVessel);
          createdRecords.push(reference);
        });

        await test.step('I confirm my trip started and finished today', async () => {
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('The "Select the port you set off from" screen is displayed', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step('The catch record reference of the new record is displayed', async () => {
          await expect(departurePortPage.pageHeading(), `Page heading to contain text ${reference}`).toContainText(
            reference
          );
        });

        await test.step(`"${ports.first}" and "${ports.second}" are displayed as port options`, async () => {
          await expect(departurePortPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
          await expect(departurePortPage.portRadio(ports.second), 'Port radio to be visible').toBeVisible();
        });

        await test.step('No port option is selected', async () => {
          await expect(departurePortPage.checkedPortRadios(), 'Checked port radios to have count').toHaveCount(0);
        });

        await test.step('The "Add port" link is displayed alongside the port options', async () => {
          await expect(departurePortPage.addPortLink(), 'Add port link to be visible').toBeVisible();
          await expect(departurePortPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
        });

        await test.step('The "Add port" link is displayed below the port options', async () => {
          // OQ-13: the link's top must be at or below the bottom of the last port radio; polled as boxes do not auto-retry
          await expect.poll(() => departurePortPage.isAddPortLinkBelowPortOptions()).toBe(true);
        });

        await test.step('The "Save and continue" button is displayed', async () => {
          await expect(
            departurePortPage.common.saveAndContinueButton(),
            'Save and continue button to be visible'
          ).toBeVisible();
        });

        await test.step('The "Back" link is displayed', async () => {
          await expect(departurePortPage.common.backLink(), 'Back link to be visible').toBeVisible();
        });

        await test.step('I select "Add port"', async () => {
          await departurePortPage.clickAddPort();
        });

        await test.step('The "Enter the port or closest port you set off from" screen is displayed', async () => {
          await addPortPage.expectUrl(/\/add-port\?for=departure/);
          await expect(addPortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step(`I search for and select "${ports.third}"`, async () => {
          await addPortPage.searchAndSelectPort(ports.third);
        });

        await test.step('I select "Save and continue"', async () => {
          await addPortPage.clickSaveAndContinue();
        });

        await test.step('I continue to the return port step', async () => {
          await expect(
            confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading()).or(addPortPage.returnPortHeading()),
            'Page heading to be visible'
          ).toBeVisible();
        });

        await test.step(`"${ports.third}" is recorded as the departure port`, async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(
            checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort),
            `Summary value to have text ${ports.third}`
          ).toHaveText(ports.third);
        });
      }
    );

    test(
      'Add a return port from the "Select the port you returned to" screen',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({
        createdRecords,
        catchRecordFlow,
        departurePortPage,
        returnPortPage,
        addPortPage,
        gearSelectionPage,
        checkAnswersPage
      }) => {
        let reference = '';

        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          reference = await catchRecordFlow.startRecord(vessels.testVessel);
          createdRecords.push(reference);
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`I select "${ports.first}" as the port I set off from`, async () => {
          await departurePortPage.selectPort(ports.first);
        });

        await test.step('I select "Save and continue"', async () => {
          await departurePortPage.clickSaveAndContinue();
        });

        await test.step('The "Select the port you returned to" screen is displayed', async () => {
          await returnPortPage.expectUrl(/\/return-port$/);
          await expect(returnPortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step('The catch record reference of the new record is displayed', async () => {
          await expect(returnPortPage.pageHeading(), `Page heading to contain text ${reference}`).toContainText(
            reference
          );
        });

        await test.step(`"${ports.first}" and "${ports.second}" are displayed as port options`, async () => {
          await expect(returnPortPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
          await expect(returnPortPage.portRadio(ports.second), 'Port radio to be visible').toBeVisible();
        });

        await test.step('No port option is selected', async () => {
          await expect(returnPortPage.checkedPortRadios(), 'Checked port radios to have count').toHaveCount(0);
        });

        await test.step('The "Add port" link is displayed alongside the port options', async () => {
          await expect(returnPortPage.addPortLink(), 'Add port link to be visible').toBeVisible();
          await expect(returnPortPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
        });

        await test.step('The "Add port" link is displayed below the port options', async () => {
          // OQ-13: the link's top must be at or below the bottom of the last port radio; polled as boxes do not auto-retry
          await expect.poll(() => returnPortPage.isAddPortLinkBelowPortOptions()).toBe(true);
        });

        await test.step('The "Save and continue" button is displayed', async () => {
          await expect(
            returnPortPage.common.saveAndContinueButton(),
            'Save and continue button to be visible'
          ).toBeVisible();
        });

        await test.step('The "Back" link is displayed', async () => {
          await expect(returnPortPage.common.backLink(), 'Back link to be visible').toBeVisible();
        });

        await test.step('I select "Add port"', async () => {
          await returnPortPage.clickAddPort();
        });

        await test.step('The "Enter the port or closest port you returned to" screen is displayed', async () => {
          await addPortPage.expectUrl(/\/add-port\?for=return/);
          await expect(addPortPage.returnPortHeading(), 'Return port heading to be visible').toBeVisible();
        });

        await test.step(`I search for and select "${ports.third}"`, async () => {
          await addPortPage.searchAndSelectPort(ports.third);
        });

        await test.step('I select "Save and continue"', async () => {
          await addPortPage.clickSaveAndContinue();
        });

        await test.step('The "What gear did you use?" screen is displayed', async () => {
          await gearSelectionPage.expectUrl(/\/gear-selection$/);
          await expect(gearSelectionPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step(`"${ports.first}" is recorded as the departure port`, async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(
            checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort),
            `Summary value to have text ${ports.first}`
          ).toHaveText(ports.first);
        });

        await test.step(`"${ports.third}" is recorded as the return port`, async () => {
          await expect(
            checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort),
            `Summary value to have text ${ports.third}`
          ).toHaveText(ports.third);
        });
      }
    );
  });

  test.describe('Choose from my previously used ports', () => {
    test.use({ testFavourites });

    // Requesting createdRecords signs in and saves testFavourites before the Background step
    test.beforeEach(async ({ createdRecords }) => {
      await test.step(`"${ports.first}" and "${ports.second}" are ports I have previously used`, async () => {
        // Saved at sign-in by the createdRecords fixture; this test has not created any draft yet
        void createdRecords;
      });
    });

    test(
      'Record the same previously used port as the departure and return port',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, returnPortPage, gearSelectionPage, checkAnswersPage }) => {
        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`I have selected "${ports.first}" as the port I set off from`, async () => {
          await catchRecordFlow.selectDeparturePort(ports.first);
        });

        await test.step(`I select "${ports.first}" as the port I returned to`, async () => {
          await returnPortPage.selectPort(ports.first);
        });

        await test.step('I select "Save and continue"', async () => {
          await returnPortPage.clickSaveAndContinue();
        });

        await test.step('The "What gear did you use?" screen is displayed', async () => {
          await gearSelectionPage.expectUrl(/\/gear-selection$/);
          await expect(gearSelectionPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step(`"${ports.first}" is recorded as the departure port`, async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(
            checkAnswersPage.summaryValue(checkAnswers.summaryKeys.departurePort),
            `Summary value to have text ${ports.first}`
          ).toHaveText(ports.first);
        });

        await test.step(`"${ports.first}" is recorded as the return port`, async () => {
          await expect(
            checkAnswersPage.summaryValue(checkAnswers.summaryKeys.returnPort),
            `Summary value to have text ${ports.first}`
          ).toHaveText(ports.first);
        });
      }
    );

    test(
      'A departure port must be selected',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage, returnPortPage }) => {
        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I select "Save and continue" without selecting a port', async () => {
          await departurePortPage.clickSaveAndContinue();
        });

        await test.step('I remain on the "Select the port you set off from" screen', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step('I am not taken to the "Select the port you returned to" screen', async () => {
          await expect(returnPortPage.pageHeading(), 'Page heading to be hidden').toBeHidden();
        });

        await test.step('The inline error "Select the port you left from" is displayed', async () => {
          await expect(
            departurePortPage.common.errorMessage(),
            `Error message to contain text ${errorMessages.ports.departureRequired}`
          ).toContainText(errorMessages.ports.departureRequired);
        });
      }
    );

    test(
      'A return port must be selected',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, returnPortPage, gearSelectionPage }) => {
        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`I have selected "${ports.first}" as the port I set off from`, async () => {
          await catchRecordFlow.selectDeparturePort(ports.first);
        });

        await test.step('I select "Save and continue" without selecting a port', async () => {
          await returnPortPage.clickSaveAndContinue();
        });

        await test.step('I remain on the "Select the port you returned to" screen', async () => {
          await returnPortPage.expectUrl(/\/return-port$/);
          await expect(returnPortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });

        await test.step('I am not taken to the "What gear did you use?" screen', async () => {
          await expect(gearSelectionPage.pageHeading(), 'Page heading to be hidden').toBeHidden();
        });

        await test.step('The inline error "Select the port you returned to" is displayed', async () => {
          await expect(
            returnPortPage.common.errorMessage(),
            `Error message to contain text ${errorMessages.ports.returnRequired}`
          ).toContainText(errorMessages.ports.returnRequired);
        });
      }
    );

    test(
      'Only one previously used port can be selected at a time',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage }) => {
        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`I select "${ports.first}" as the port I set off from`, async () => {
          await departurePortPage.selectPort(ports.first);
        });

        await test.step(`"${ports.first}" is selected`, async () => {
          await expect(departurePortPage.portRadio(ports.first), 'Port radio to be checked').toBeChecked();
        });

        await test.step(`I select "${ports.second}" as the port I set off from`, async () => {
          await departurePortPage.selectPort(ports.second);
        });

        await test.step(`"${ports.second}" is selected`, async () => {
          await expect(departurePortPage.portRadio(ports.second), 'Port radio to be checked').toBeChecked();
        });

        await test.step(`"${ports.first}" is no longer selected`, async () => {
          await expect(departurePortPage.portRadio(ports.first), 'Port radio not to be checked').not.toBeChecked();
        });
      }
    );

    for (const { tripType, tripDates, previousScreen, previousUrl } of backNavigationScenarios) {
      test(
        `Back from the departure port screen returns to the previous screen of a ${tripType} catch record`,
        { tag: ['@ui', '@regression', '@favouritePorts'] },
        async ({ createdRecords, catchRecordFlow, departurePortPage, tripDatePage, tripReturnDatePage }) => {
          const previousPage = tripDates ? tripReturnDatePage : tripDatePage;

          await test.step(`I have started a new ${tripType} catch record for "ACHILLES"`, async () => {
            createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
            if (tripDates) {
              await catchRecordFlow.enterMultiDayTrip(tripDates);
            } else {
              await catchRecordFlow.enterSameDayTrip();
            }
          });

          await test.step('I select "Back"', async () => {
            await departurePortPage.common.backLink().click();
          });

          await test.step(`The "${previousScreen}" screen is displayed`, async () => {
            await previousPage.expectUrl(previousUrl);
            await expect(previousPage.pageHeading(), 'Page heading to be visible').toBeVisible();
          });
        }
      );
    }

    test(
      'Back from the return port screen returns to the departure port screen',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage, returnPortPage }) => {
        await test.step(`I have started a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`I have selected "${ports.first}" as the port I set off from`, async () => {
          await catchRecordFlow.selectDeparturePort(ports.first);
        });

        await test.step('I select "Back"', async () => {
          await returnPortPage.common.backLink().click();
        });

        await test.step('The "Select the port you set off from" screen is displayed', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
        });
      }
    );

    test(
      'A previously used port is offered again on my next new catch record',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage }) => {
        await test.step(`I have recorded "${ports.first}" as the port I set off from on a new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
          await catchRecordFlow.selectDeparturePort(ports.first);
        });

        await test.step(`I start another new same-day catch record for "${vessels.testVessel}"`, async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step(`"${ports.first}" is displayed as a port option on the "Select the port you set off from" screen`, async () => {
          await expect(departurePortPage.pageHeading(), 'Page heading to be visible').toBeVisible();
          await expect(departurePortPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
        });

        await test.step(`"${ports.first}" is not selected`, async () => {
          await expect(departurePortPage.portRadio(ports.first), 'Port radio not to be checked').not.toBeChecked();
        });
      }
    );

    for (const { portScreen, isReturnScreen } of welshScenarios) {
      // Blocked (OQ-9): Welsh copy is not available on the catch-record journey pages (see tests/ui/e2e/welshLanguage.spec.ts)
      test.fixme(
        `The "${portScreen}" screen is displayed in Welsh`,
        { tag: ['@ui', '@regression', '@favouritePorts'] },
        async ({ createdRecords, catchRecordFlow, departurePortPage, returnPortPage }) => {
          const portPage = isReturnScreen ? returnPortPage : departurePortPage;

          await test.step(`I am on the "${portScreen}" screen of a new same-day catch record for "ACHILLES"`, async () => {
            createdRecords.push(await catchRecordFlow.startRecord(vessels.testVessel));
            await catchRecordFlow.enterSameDayTrip();
            if (isReturnScreen) await catchRecordFlow.selectDeparturePort(ports.first);
            await expect(portPage.pageHeading(), 'Page heading to be visible').toBeVisible();
          });

          await test.step('I select "Cymraeg"', async () => {
            await portPage.common.languageCymraeg().click();
          });

          await test.step(`The "${portScreen}" screen is displayed in Welsh`, async () => {
            // OQ-9: no Welsh heading is confirmed yet, so none is invented here. Before changing test.fixme to test,
            // assert the confirmed Welsh heading as a typed constant
          });

          await test.step(`"${ports.first}" and "${ports.second}" are still displayed as port options`, async () => {
            await expect(portPage.portRadio(ports.first), 'Port radio to be visible').toBeVisible();
            await expect(portPage.portRadio(ports.second), 'Port radio to be visible').toBeVisible();
          });
        }
      );
    }
  });
});
