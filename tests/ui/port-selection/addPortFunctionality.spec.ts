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

const vesselName = 'ACHILLES';
const plymouth = 'Plymouth';
const lowestoft = 'Lowestoft';
const hastings = 'Hastings';
const departurePortKey = 'Departure port';
const returnPortKey = 'Return port';
const departurePortRequiredError = 'Select the port you left from';
const returnPortRequiredError = 'Select the port you returned to';
const testFavourites: Favourites = { ports: [plymouth, lowestoft], gears: [], species: [] };
const absentFavourites: Favourites = { ports: [hastings], gears: [], species: [] };

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
      await test.step('"Plymouth" and "Lowestoft" are ports I have previously used', async () => {
        // Saved at sign-in by the createdRecords fixture; this test has not created any draft yet
        void createdRecords;
      });

      await test.step('"Hastings" is not a port I have previously used', async () => {
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

        await test.step('I have started a new catch record for "ACHILLES"', async () => {
          reference = await catchRecordFlow.startRecord(vesselName);
          createdRecords.push(reference);
        });

        await test.step('I confirm my trip started and finished today', async () => {
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('The "Select the port you set off from" screen is displayed', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading()).toBeVisible();
        });

        await test.step('The catch record reference of the new record is displayed', async () => {
          await expect(departurePortPage.pageHeading()).toContainText(reference);
        });

        await test.step('"Plymouth" and "Lowestoft" are displayed as port options', async () => {
          await expect(departurePortPage.portRadio(plymouth)).toBeVisible();
          await expect(departurePortPage.portRadio(lowestoft)).toBeVisible();
        });

        await test.step('No port option is selected', async () => {
          await expect(departurePortPage.checkedPortRadios()).toHaveCount(0);
        });

        await test.step('The "Add port" link is displayed alongside the port options', async () => {
          await expect(departurePortPage.addPortLink()).toBeVisible();
          await expect(departurePortPage.portRadio(plymouth)).toBeVisible();
        });

        await test.step('The "Add port" link is displayed below the port options', async () => {
          // OQ-13: the link's top must be at or below the bottom of the last port radio; polled as boxes do not auto-retry
          await expect.poll(() => departurePortPage.isAddPortLinkBelowPortOptions()).toBe(true);
        });

        await test.step('The "Save and continue" button is displayed', async () => {
          await expect(departurePortPage.common.saveAndContinueButton()).toBeVisible();
        });

        await test.step('The "Back" link is displayed', async () => {
          await expect(departurePortPage.common.backLink()).toBeVisible();
        });

        await test.step('I select "Add port"', async () => {
          await departurePortPage.clickAddPort();
        });

        await test.step('The "Enter the port or closest port you set off from" screen is displayed', async () => {
          await addPortPage.expectUrl(/\/add-port\?for=departure/);
          await expect(addPortPage.pageHeading()).toBeVisible();
        });

        await test.step('I search for and select "Hastings"', async () => {
          await addPortPage.searchAndSelectPort(hastings);
        });

        await test.step('I select "Save and continue"', async () => {
          await addPortPage.clickSaveAndContinue();
        });

        await test.step('I continue to the return port step', async () => {
          await expect(
            confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading()).or(addPortPage.returnPortHeading())
          ).toBeVisible();
        });

        await test.step('"Hastings" is recorded as the departure port', async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(hastings);
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

        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          reference = await catchRecordFlow.startRecord(vesselName);
          createdRecords.push(reference);
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I select "Plymouth" as the port I set off from', async () => {
          await departurePortPage.selectPort(plymouth);
        });

        await test.step('I select "Save and continue"', async () => {
          await departurePortPage.clickSaveAndContinue();
        });

        await test.step('The "Select the port you returned to" screen is displayed', async () => {
          await returnPortPage.expectUrl(/\/return-port$/);
          await expect(returnPortPage.pageHeading()).toBeVisible();
        });

        await test.step('The catch record reference of the new record is displayed', async () => {
          await expect(returnPortPage.pageHeading()).toContainText(reference);
        });

        await test.step('"Plymouth" and "Lowestoft" are displayed as port options', async () => {
          await expect(returnPortPage.portRadio(plymouth)).toBeVisible();
          await expect(returnPortPage.portRadio(lowestoft)).toBeVisible();
        });

        await test.step('No port option is selected', async () => {
          await expect(returnPortPage.checkedPortRadios()).toHaveCount(0);
        });

        await test.step('The "Add port" link is displayed alongside the port options', async () => {
          await expect(returnPortPage.addPortLink()).toBeVisible();
          await expect(returnPortPage.portRadio(plymouth)).toBeVisible();
        });

        await test.step('The "Add port" link is displayed below the port options', async () => {
          // OQ-13: the link's top must be at or below the bottom of the last port radio; polled as boxes do not auto-retry
          await expect.poll(() => returnPortPage.isAddPortLinkBelowPortOptions()).toBe(true);
        });

        await test.step('The "Save and continue" button is displayed', async () => {
          await expect(returnPortPage.common.saveAndContinueButton()).toBeVisible();
        });

        await test.step('The "Back" link is displayed', async () => {
          await expect(returnPortPage.common.backLink()).toBeVisible();
        });

        await test.step('I select "Add port"', async () => {
          await returnPortPage.clickAddPort();
        });

        await test.step('The "Enter the port or closest port you returned to" screen is displayed', async () => {
          await addPortPage.expectUrl(/\/add-port\?for=return/);
          await expect(addPortPage.returnPortHeading()).toBeVisible();
        });

        await test.step('I search for and select "Hastings"', async () => {
          await addPortPage.searchAndSelectPort(hastings);
        });

        await test.step('I select "Save and continue"', async () => {
          await addPortPage.clickSaveAndContinue();
        });

        await test.step('The "What gear did you use?" screen is displayed', async () => {
          await gearSelectionPage.expectUrl(/\/gear-selection$/);
          await expect(gearSelectionPage.pageHeading()).toBeVisible();
        });

        await test.step('"Plymouth" is recorded as the departure port', async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(plymouth);
        });

        await test.step('"Hastings" is recorded as the return port', async () => {
          await expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(hastings);
        });
      }
    );
  });

  test.describe('Choose from my previously used ports', () => {
    test.use({ testFavourites });

    // Requesting createdRecords signs in and saves testFavourites before the Background step
    test.beforeEach(async ({ createdRecords }) => {
      await test.step('"Plymouth" and "Lowestoft" are ports I have previously used', async () => {
        // Saved at sign-in by the createdRecords fixture; this test has not created any draft yet
        void createdRecords;
      });
    });

    test(
      'Record the same previously used port as the departure and return port',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, returnPortPage, gearSelectionPage, checkAnswersPage }) => {
        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I have selected "Plymouth" as the port I set off from', async () => {
          await catchRecordFlow.selectDeparturePort(plymouth);
        });

        await test.step('I select "Plymouth" as the port I returned to', async () => {
          await returnPortPage.selectPort(plymouth);
        });

        await test.step('I select "Save and continue"', async () => {
          await returnPortPage.clickSaveAndContinue();
        });

        await test.step('The "What gear did you use?" screen is displayed', async () => {
          await gearSelectionPage.expectUrl(/\/gear-selection$/);
          await expect(gearSelectionPage.pageHeading()).toBeVisible();
        });

        await test.step('"Plymouth" is recorded as the departure port', async () => {
          await checkAnswersPage.goto('/check-answers');
          await expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(plymouth);
        });

        await test.step('"Plymouth" is recorded as the return port', async () => {
          await expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(plymouth);
        });
      }
    );

    test(
      'A departure port must be selected',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage, returnPortPage }) => {
        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I select "Save and continue" without selecting a port', async () => {
          await departurePortPage.clickSaveAndContinue();
        });

        await test.step('I remain on the "Select the port you set off from" screen', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading()).toBeVisible();
        });

        await test.step('I am not taken to the "Select the port you returned to" screen', async () => {
          await expect(returnPortPage.pageHeading()).toBeHidden();
        });

        await test.step('The inline error "Select the port you left from" is displayed', async () => {
          await expect(departurePortPage.common.errorMessage()).toContainText(departurePortRequiredError);
        });
      }
    );

    test(
      'A return port must be selected',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, returnPortPage, gearSelectionPage }) => {
        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I have selected "Plymouth" as the port I set off from', async () => {
          await catchRecordFlow.selectDeparturePort(plymouth);
        });

        await test.step('I select "Save and continue" without selecting a port', async () => {
          await returnPortPage.clickSaveAndContinue();
        });

        await test.step('I remain on the "Select the port you returned to" screen', async () => {
          await returnPortPage.expectUrl(/\/return-port$/);
          await expect(returnPortPage.pageHeading()).toBeVisible();
        });

        await test.step('I am not taken to the "What gear did you use?" screen', async () => {
          await expect(gearSelectionPage.pageHeading()).toBeHidden();
        });

        await test.step('The inline error "Select the port you returned to" is displayed', async () => {
          await expect(returnPortPage.common.errorMessage()).toContainText(returnPortRequiredError);
        });
      }
    );

    test(
      'Only one previously used port can be selected at a time',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage }) => {
        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I select "Plymouth" as the port I set off from', async () => {
          await departurePortPage.selectPort(plymouth);
        });

        await test.step('"Plymouth" is selected', async () => {
          await expect(departurePortPage.portRadio(plymouth)).toBeChecked();
        });

        await test.step('I select "Lowestoft" as the port I set off from', async () => {
          await departurePortPage.selectPort(lowestoft);
        });

        await test.step('"Lowestoft" is selected', async () => {
          await expect(departurePortPage.portRadio(lowestoft)).toBeChecked();
        });

        await test.step('"Plymouth" is no longer selected', async () => {
          await expect(departurePortPage.portRadio(plymouth)).not.toBeChecked();
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
            createdRecords.push(await catchRecordFlow.startRecord(vesselName));
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
            await expect(previousPage.pageHeading()).toBeVisible();
          });
        }
      );
    }

    test(
      'Back from the return port screen returns to the departure port screen',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage, returnPortPage }) => {
        await test.step('I have started a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('I have selected "Plymouth" as the port I set off from', async () => {
          await catchRecordFlow.selectDeparturePort(plymouth);
        });

        await test.step('I select "Back"', async () => {
          await returnPortPage.common.backLink().click();
        });

        await test.step('The "Select the port you set off from" screen is displayed', async () => {
          await departurePortPage.expectUrl(/\/departure-port$/);
          await expect(departurePortPage.pageHeading()).toBeVisible();
        });
      }
    );

    test(
      'A previously used port is offered again on my next new catch record',
      { tag: ['@ui', '@regression', '@favouritePorts'] },
      async ({ createdRecords, catchRecordFlow, departurePortPage }) => {
        await test.step('I have recorded "Plymouth" as the port I set off from on a new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
          await catchRecordFlow.selectDeparturePort(plymouth);
        });

        await test.step('I start another new same-day catch record for "ACHILLES"', async () => {
          createdRecords.push(await catchRecordFlow.startRecord(vesselName));
          await catchRecordFlow.enterSameDayTrip();
        });

        await test.step('"Plymouth" is displayed as a port option on the "Select the port you set off from" screen', async () => {
          await expect(departurePortPage.pageHeading()).toBeVisible();
          await expect(departurePortPage.portRadio(plymouth)).toBeVisible();
        });

        await test.step('"Plymouth" is not selected', async () => {
          await expect(departurePortPage.portRadio(plymouth)).not.toBeChecked();
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
            createdRecords.push(await catchRecordFlow.startRecord(vesselName));
            await catchRecordFlow.enterSameDayTrip();
            if (isReturnScreen) await catchRecordFlow.selectDeparturePort(plymouth);
            await expect(portPage.pageHeading()).toBeVisible();
          });

          await test.step('I select "Cymraeg"', async () => {
            await portPage.common.languageCymraeg().click();
          });

          await test.step(`The "${portScreen}" screen is displayed in Welsh`, async () => {
            // OQ-9: no Welsh heading is confirmed yet, so none is invented here. Before changing test.fixme to test,
            // assert the confirmed Welsh heading as a typed constant
          });

          await test.step('"Plymouth" and "Lowestoft" are still displayed as port options', async () => {
            await expect(portPage.portRadio(plymouth)).toBeVisible();
            await expect(portPage.portRadio(lowestoft)).toBeVisible();
          });
        }
      );
    }
  });
});
