// Generated from: tests/ui/features/complete-user-account-page.feature
import { test } from "../../../../../fixtures/accountPageBddFixture.ts";

test.describe('View and manage a fisher\'s account', () => {

  test.beforeEach('Background', async ({ Given, navigationFlow }, testInfo) => { if (testInfo.error) return;
    await Given('I am signed in and on the account page', null, { navigationFlow }); 
  });
  
  test.describe('The account page displays the fisher\'s details and saved favourites', () => {

    test('The account page shows its main sections', async ({ Then, And, accountPage }) => { 
      await Then('I see the account page heading', null, { accountPage }); 
      await And('I see the personal details, vessel details, ports, gear, and species sections', null, { accountPage }); 
    });

    test('Personal details are displayed', async ({ Then, accountPage }) => { 
      await Then('the personal details section shows email, password, and address', null, { accountPage }); 
    });

    test('Vessel details are displayed', async ({ Then, accountPage }) => { 
      await Then('the vessel details section shows the vessel name', null, { accountPage }); 
    });

    test.describe('A favourite section provides add and remove actions', () => {

      test('Example #1', async ({ Then, accountPage }) => { 
        await Then('the "Ports used" section has Add and Remove links', null, { accountPage }); 
      });

      test('Example #2', async ({ Then, accountPage }) => { 
        await Then('the "Gear onboard" section has Add and Remove links', null, { accountPage }); 
      });

      test('Example #3', async ({ Then, accountPage }) => { 
        await Then('the "Species caught" section has Add and Remove links', null, { accountPage }); 
      });

    });

  });

  test.describe('A fisher can manage gear favourites', () => {

    test('The add gear page can be opened', async ({ When, Then, accountPage, addGearPage }) => { 
      await When('I open the add gear page', null, { accountPage }); 
      await Then('I see the add gear page and its gear search field', null, { addGearPage }); 
    });

    test('A gear favourite can be added', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I ensure gear "Pots" is saved', null, { favouritesFlow }); 
      await Then('the account page lists gear "Pots"', null, { accountPage }); 
    });

    test('Multiple gear favourites can be added', async ({ Given, When, Then, And, accountPage, favouritesFlow, gearFlow }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I add a second gear whose name contains "traps"', null, { accountPage, gearFlow }); 
      await Then('the account page lists gear "Pots"', null, { accountPage }); 
      await And('the account page lists a gear whose name contains "traps"', null, { accountPage }); 
    });

    test('Newly added gear appears without a manual refresh', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I ensure gear "Pots" is saved', null, { favouritesFlow }); 
      await Then('the account page lists gear "Pots"', null, { accountPage }); 
    });

    test('Adding gear can be cancelled', async ({ When, Then, accountPage, addGearPage }) => { 
      await When('I open the add gear page and go back', null, { accountPage, addGearPage }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

    test('A duplicate gear favourite is rejected', async ({ Given, When, Then, accountPage, addGearPage, favouritesFlow }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I try to add gear "Pots" again', null, { accountPage, addGearPage }); 
      await Then('I see that gear "Pots" has already been added', null, { addGearPage }); 
    });

    test('The remove gear page can be opened', async ({ When, Then, accountPage, removeGearPage }) => { 
      await When('I open the remove gear page', null, { accountPage }); 
      await Then('I see the remove gear page', null, { removeGearPage }); 
    });

    test('A gear favourite can be removed', async ({ Given, When, Then, accountPage, favouritesFlow, removeGearPage }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I remove gear "Pots"', null, { accountPage, favouritesFlow, removeGearPage }); 
      await Then('the account page does not list gear "Pots"', null, { accountPage }); 
    });

    test('Adding gear returns the fisher to the account page', async ({ When, Then, accountPage, gearFlow }) => { 
      await When('I add an available gear from the catalogue using prefix "po"', null, { accountPage, gearFlow }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

    test('Removing gear returns the fisher to the account page', async ({ Given, When, Then, accountPage, favouritesFlow, removeGearPage }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I remove gear "Pots"', null, { accountPage, favouritesFlow, removeGearPage }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

  });

  test.describe('A fisher can manage port favourites', () => {

    test('The add port page can be opened', async ({ When, Then, accountPage, addPortPage }) => { 
      await When('I open the add port page', null, { accountPage }); 
      await Then('I am on the add port page', null, { addPortPage }); 
    });

    test('A port favourite can be added', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I replace any saved "Plymouth" port with "Plymouth"', null, { favouritesFlow }); 
      await Then('the account page lists port "Plymouth"', null, { accountPage }); 
    });

    test('Multiple port favourites can be added', async ({ When, Then, And, accountPage, favouritesFlow }) => { 
      await When('I replace any saved "Plymouth" port with "Plymouth"', null, { favouritesFlow }); 
      await And('I replace any saved "Lowestoft" port with "Lowestoft"', null, { favouritesFlow }); 
      await Then('the account page lists port "Plymouth"', null, { accountPage }); 
      await And('the account page lists port "Lowestoft"', null, { accountPage }); 
    });

    test('Adding a port can be cancelled', async ({ When, Then, accountPage, addPortPage }) => { 
      await When('I open the add port page and go back', null, { accountPage, addPortPage }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

    test('The remove port page can be opened', async ({ When, Then, accountPage, removePortPage }) => { 
      await When('I open the remove port page', null, { accountPage }); 
      await Then('I am on the remove port page', null, { removePortPage }); 
    });

    test('Adding a port returns the fisher to the account page', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I replace any saved "Plymouth" port with "Plymouth"', null, { favouritesFlow }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

  });

  test.describe('A fisher can manage species favourites', () => {

    test('The add species page can be opened', async ({ When, Then, accountPage, addSpeciesPage }) => { 
      await When('I open the add species page', null, { accountPage }); 
      await Then('I see the add species page and its species search field', null, { addSpeciesPage }); 
    });

    test('A species favourite can be added', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I ensure species "Atlantic cod (COD)" is saved', null, { favouritesFlow }); 
      await Then('the account page lists species "Atlantic cod (COD)"', null, { accountPage }); 
    });

    test('Multiple species favourites can be added', async ({ When, Then, And, accountPage, favouritesFlow }) => { 
      await When('I ensure species "Atlantic cod (COD)" is saved', null, { favouritesFlow }); 
      await And('I ensure species "Atlantic mackerel (MAC)" is saved', null, { favouritesFlow }); 
      await Then('the account page lists species "Atlantic cod (COD)"', null, { accountPage }); 
      await And('the account page lists species "Atlantic mackerel (MAC)"', null, { accountPage }); 
    });

    test('Adding a species can be cancelled', async ({ When, Then, accountPage, addSpeciesPage }) => { 
      await When('I open the add species page and go back', null, { accountPage, addSpeciesPage }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

    test('The remove species page can be opened', async ({ When, Then, accountPage, removeSpeciesPage }) => { 
      await When('I open the remove species page', null, { accountPage }); 
      await Then('I see the remove species page', null, { removeSpeciesPage }); 
    });

    test('A species favourite can be removed', async ({ Given, When, Then, accountPage, favouritesFlow, removeSpeciesPage }) => { 
      await Given('species "Atlantic cod (COD)" is saved', null, { favouritesFlow }); 
      await When('I remove species "Atlantic cod (COD)"', null, { accountPage, favouritesFlow, removeSpeciesPage }); 
      await Then('the account page does not list species "Atlantic cod (COD)"', null, { accountPage }); 
    });

    test('Adding a species returns the fisher to the account page', async ({ When, Then, accountPage, favouritesFlow }) => { 
      await When('I replace any saved "Atlantic cod (COD)" species with "Atlantic cod (COD)"', null, { favouritesFlow }); 
      await Then('I am on the account page', null, { accountPage }); 
    });

  });

  test.describe('Saved favourites are available during catch recording', () => {

    test('A saved port is suggested during catch-record creation', async ({ Given, When, Then, addPortPage, favouritesFlow, recordsPage, selectVesselPage, tripDatePage }) => { 
      await Given('port "Plymouth" is saved', null, { favouritesFlow }); 
      await When('I start a catch record and search for port "Plymouth"', null, { addPortPage, recordsPage, selectVesselPage, tripDatePage }); 
      await Then('the departure-port suggestions include "Plymouth"', null, { addPortPage }); 
    });

    test('Saved gear is available during catch-record creation', async ({ Given, When, Then, favouritesFlow, gearSelectionPage }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I open gear selection', null, { gearSelectionPage }); 
      await Then('gear "Pots" is available to select', null, { gearSelectionPage }); 
    });

    test('Saved species is available during catch-record creation', async ({ Given, When, Then, favouritesFlow, speciesSelectionPage }) => { 
      await Given('species "Atlantic cod (COD)" is saved', null, { favouritesFlow }); 
      await When('I open species selection', null, { speciesSelectionPage }); 
      await Then('species "Atlantic cod (COD)" is available to select', null, { speciesSelectionPage }); 
    });

    test('Favourites persist when the account page is reopened', async ({ Given, When, Then, accountPage, favouritesFlow }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I reopen the account page', null, { accountPage }); 
      await Then('the account page lists gear "Pots"', null, { accountPage }); 
    });

    test('Saved gear is available later in the same session', async ({ Given, When, Then, accountPage, favouritesFlow, gearFlow, gearSelectionPage }) => { 
      await Given('gear "Pots" is saved', null, { favouritesFlow }); 
      await When('I save gear "Pots" from the add-gear journey and open gear selection', null, { accountPage, favouritesFlow, gearFlow, gearSelectionPage }); 
      await Then('gear "Pots" is available to select', null, { gearSelectionPage }); 
    });

  });

  test.describe('Gear catalogue selection and measurements are validated', () => {

    test('A matching gear can be selected from catalogue search', async ({ When, Then, accountPage, addGearPage, gearFlow }) => { 
      await When('I select a line gear from search prefix "lo" and continue', null, { accountPage, addGearPage, gearFlow }); 
      await Then('the gear measurements form is displayed', null, { addGearPage }); 
    });

    test('Free-text gear outside the catalogue is rejected', async ({ When, Then, And, accountPage, accountPageScenarioState, addGearPage }) => { 
      await When('I submit gear text that is not in the catalogue', null, { accountPage, accountPageScenarioState, addGearPage }); 
      await Then('the catalogue validation error is shown', null, { addGearPage }); 
      await And('the saved gear list is unchanged', null, { accountPage, accountPageScenarioState }); 
    });

    test('Selecting a gear is required', async ({ When, Then, And, accountPage, accountPageScenarioState, addGearPage }) => { 
      await When('I continue without selecting a gear', null, { accountPage, accountPageScenarioState, addGearPage }); 
      await Then('the required-gear validation error is shown', null, { addGearPage }); 
      await And('the saved gear list is unchanged', null, { accountPage, accountPageScenarioState }); 
    });

    test('Required gear measurements must be entered', async ({ When, Then, And, accountPage, accountPageScenarioState, addGearPage, gearFlow }) => { 
      await When('I select a line gear and continue without entering measurements', null, { accountPage, accountPageScenarioState, addGearPage, gearFlow }); 
      await Then('the required measurement errors are shown', null, { addGearPage }); 
      await And('the saved gear list is unchanged', null, { accountPage, accountPageScenarioState }); 
    });

    test('Fractional and negative gear measurements are rejected', async ({ When, Then, And, accountPage, accountPageScenarioState, addGearPage, gearFlow }) => { 
      await When('I enter fractional and negative gear measurements', null, { accountPage, accountPageScenarioState, addGearPage, gearFlow }); 
      await Then('the measurement validation errors are shown', null, { addGearPage }); 
      await And('the saved gear list is unchanged', null, { accountPage, accountPageScenarioState }); 
    });

    test('Zero gear measurements are rejected', async ({ When, Then, And, accountPage, accountPageScenarioState, addGearPage, gearFlow }) => { 
      await When('I enter a zero gear measurement', null, { accountPage, accountPageScenarioState, addGearPage, gearFlow }); 
      await Then('the positive measurement validation error is shown', null, { addGearPage }); 
      await And('the saved gear list is unchanged', null, { accountPage, accountPageScenarioState }); 
    });

    test('A selected gear can be saved using the Enter key', async ({ When, Then, accountPage, accountPageScenarioState, addGearPage, favouritesFlow, gearFlow }) => { 
      await When('I save a line gear using only the Enter key', null, { accountPage, accountPageScenarioState, addGearPage, favouritesFlow, gearFlow }); 
      await Then('the selected gear is saved to my account', null, { accountPage, accountPageScenarioState }); 
    });

  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/ui/features/complete-user-account-page.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":12,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I see the account page heading","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I see the personal details, vessel details, ports, gear, and species sections","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then the personal details section shows email, password, and address","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the vessel details section shows the vessel name","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the \"Ports used\" section has Add and Remove links","stepMatchArguments":[{"group":{"start":4,"value":"\"Ports used\"","children":[{"start":5,"value":"Ports used","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":31,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the \"Gear onboard\" section has Add and Remove links","stepMatchArguments":[{"group":{"start":4,"value":"\"Gear onboard\"","children":[{"start":5,"value":"Gear onboard","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the \"Species caught\" section has Add and Remove links","stepMatchArguments":[{"group":{"start":4,"value":"\"Species caught\"","children":[{"start":5,"value":"Species caught","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":45,"pickleLine":32,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"When I open the add gear page","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then I see the add gear page and its gear search field","stepMatchArguments":[]}]},
  {"pwTestLine":50,"pickleLine":36,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"When I ensure gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":14,"value":"\"Pots\"","children":[{"start":15,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the account page lists gear \"Pots\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Pots\"","children":[{"start":29,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":55,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":56,"gherkinStepLine":41,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":57,"gherkinStepLine":42,"keywordType":"Action","textWithKeyword":"When I add a second gear whose name contains \"traps\"","stepMatchArguments":[{"group":{"start":40,"value":"\"traps\"","children":[{"start":41,"value":"traps","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":58,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"Then the account page lists gear \"Pots\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Pots\"","children":[{"start":29,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"And the account page lists a gear whose name contains \"traps\"","stepMatchArguments":[{"group":{"start":50,"value":"\"traps\"","children":[{"start":51,"value":"traps","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":62,"pickleLine":46,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":47,"keywordType":"Action","textWithKeyword":"When I ensure gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":14,"value":"\"Pots\"","children":[{"start":15,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":64,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"Then the account page lists gear \"Pots\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Pots\"","children":[{"start":29,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":67,"pickleLine":50,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":68,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"When I open the add gear page and go back","stepMatchArguments":[]},{"pwStepLine":69,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":72,"pickleLine":54,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":73,"gherkinStepLine":55,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":74,"gherkinStepLine":56,"keywordType":"Action","textWithKeyword":"When I try to add gear \"Pots\" again","stepMatchArguments":[{"group":{"start":18,"value":"\"Pots\"","children":[{"start":19,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":75,"gherkinStepLine":57,"keywordType":"Outcome","textWithKeyword":"Then I see that gear \"Pots\" has already been added","stepMatchArguments":[{"group":{"start":16,"value":"\"Pots\"","children":[{"start":17,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":78,"pickleLine":59,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":79,"gherkinStepLine":60,"keywordType":"Action","textWithKeyword":"When I open the remove gear page","stepMatchArguments":[]},{"pwStepLine":80,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"Then I see the remove gear page","stepMatchArguments":[]}]},
  {"pwTestLine":83,"pickleLine":63,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":84,"gherkinStepLine":64,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":85,"gherkinStepLine":65,"keywordType":"Action","textWithKeyword":"When I remove gear \"Pots\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Pots\"","children":[{"start":15,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":86,"gherkinStepLine":66,"keywordType":"Outcome","textWithKeyword":"Then the account page does not list gear \"Pots\"","stepMatchArguments":[{"group":{"start":36,"value":"\"Pots\"","children":[{"start":37,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":89,"pickleLine":68,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":90,"gherkinStepLine":69,"keywordType":"Action","textWithKeyword":"When I add an available gear from the catalogue using prefix \"po\"","stepMatchArguments":[{"group":{"start":56,"value":"\"po\"","children":[{"start":57,"value":"po","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":91,"gherkinStepLine":70,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":94,"pickleLine":72,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":95,"gherkinStepLine":73,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":96,"gherkinStepLine":74,"keywordType":"Action","textWithKeyword":"When I remove gear \"Pots\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Pots\"","children":[{"start":15,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":97,"gherkinStepLine":75,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":104,"pickleLine":79,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":105,"gherkinStepLine":80,"keywordType":"Action","textWithKeyword":"When I open the add port page","stepMatchArguments":[]},{"pwStepLine":106,"gherkinStepLine":81,"keywordType":"Outcome","textWithKeyword":"Then I am on the add port page","stepMatchArguments":[]}]},
  {"pwTestLine":109,"pickleLine":83,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":110,"gherkinStepLine":84,"keywordType":"Action","textWithKeyword":"When I replace any saved \"Plymouth\" port with \"Plymouth\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Plymouth\"","children":[{"start":21,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":41,"value":"\"Plymouth\"","children":[{"start":42,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":111,"gherkinStepLine":85,"keywordType":"Outcome","textWithKeyword":"Then the account page lists port \"Plymouth\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Plymouth\"","children":[{"start":29,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":114,"pickleLine":87,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":115,"gherkinStepLine":88,"keywordType":"Action","textWithKeyword":"When I replace any saved \"Plymouth\" port with \"Plymouth\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Plymouth\"","children":[{"start":21,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":41,"value":"\"Plymouth\"","children":[{"start":42,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":116,"gherkinStepLine":89,"keywordType":"Action","textWithKeyword":"And I replace any saved \"Lowestoft\" port with \"Lowestoft\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Lowestoft\"","children":[{"start":21,"value":"Lowestoft","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":42,"value":"\"Lowestoft\"","children":[{"start":43,"value":"Lowestoft","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":117,"gherkinStepLine":90,"keywordType":"Outcome","textWithKeyword":"Then the account page lists port \"Plymouth\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Plymouth\"","children":[{"start":29,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":118,"gherkinStepLine":91,"keywordType":"Outcome","textWithKeyword":"And the account page lists port \"Lowestoft\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Lowestoft\"","children":[{"start":29,"value":"Lowestoft","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":121,"pickleLine":93,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":122,"gherkinStepLine":94,"keywordType":"Action","textWithKeyword":"When I open the add port page and go back","stepMatchArguments":[]},{"pwStepLine":123,"gherkinStepLine":95,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":126,"pickleLine":97,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":127,"gherkinStepLine":98,"keywordType":"Action","textWithKeyword":"When I open the remove port page","stepMatchArguments":[]},{"pwStepLine":128,"gherkinStepLine":99,"keywordType":"Outcome","textWithKeyword":"Then I am on the remove port page","stepMatchArguments":[]}]},
  {"pwTestLine":131,"pickleLine":101,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":132,"gherkinStepLine":102,"keywordType":"Action","textWithKeyword":"When I replace any saved \"Plymouth\" port with \"Plymouth\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Plymouth\"","children":[{"start":21,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":41,"value":"\"Plymouth\"","children":[{"start":42,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":133,"gherkinStepLine":103,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":140,"pickleLine":107,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":141,"gherkinStepLine":108,"keywordType":"Action","textWithKeyword":"When I open the add species page","stepMatchArguments":[]},{"pwStepLine":142,"gherkinStepLine":109,"keywordType":"Outcome","textWithKeyword":"Then I see the add species page and its species search field","stepMatchArguments":[]}]},
  {"pwTestLine":145,"pickleLine":111,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":146,"gherkinStepLine":112,"keywordType":"Action","textWithKeyword":"When I ensure species \"Atlantic cod (COD)\" is saved","stepMatchArguments":[{"group":{"start":17,"value":"\"Atlantic cod (COD)\"","children":[{"start":18,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":147,"gherkinStepLine":113,"keywordType":"Outcome","textWithKeyword":"Then the account page lists species \"Atlantic cod (COD)\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Atlantic cod (COD)\"","children":[{"start":32,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":150,"pickleLine":115,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":151,"gherkinStepLine":116,"keywordType":"Action","textWithKeyword":"When I ensure species \"Atlantic cod (COD)\" is saved","stepMatchArguments":[{"group":{"start":17,"value":"\"Atlantic cod (COD)\"","children":[{"start":18,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":152,"gherkinStepLine":117,"keywordType":"Action","textWithKeyword":"And I ensure species \"Atlantic mackerel (MAC)\" is saved","stepMatchArguments":[{"group":{"start":17,"value":"\"Atlantic mackerel (MAC)\"","children":[{"start":18,"value":"Atlantic mackerel (MAC)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":153,"gherkinStepLine":118,"keywordType":"Outcome","textWithKeyword":"Then the account page lists species \"Atlantic cod (COD)\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Atlantic cod (COD)\"","children":[{"start":32,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":154,"gherkinStepLine":119,"keywordType":"Outcome","textWithKeyword":"And the account page lists species \"Atlantic mackerel (MAC)\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Atlantic mackerel (MAC)\"","children":[{"start":32,"value":"Atlantic mackerel (MAC)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":157,"pickleLine":121,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":158,"gherkinStepLine":122,"keywordType":"Action","textWithKeyword":"When I open the add species page and go back","stepMatchArguments":[]},{"pwStepLine":159,"gherkinStepLine":123,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":162,"pickleLine":125,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":163,"gherkinStepLine":126,"keywordType":"Action","textWithKeyword":"When I open the remove species page","stepMatchArguments":[]},{"pwStepLine":164,"gherkinStepLine":127,"keywordType":"Outcome","textWithKeyword":"Then I see the remove species page","stepMatchArguments":[]}]},
  {"pwTestLine":167,"pickleLine":129,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":168,"gherkinStepLine":130,"keywordType":"Context","textWithKeyword":"Given species \"Atlantic cod (COD)\" is saved","stepMatchArguments":[{"group":{"start":8,"value":"\"Atlantic cod (COD)\"","children":[{"start":9,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":169,"gherkinStepLine":131,"keywordType":"Action","textWithKeyword":"When I remove species \"Atlantic cod (COD)\"","stepMatchArguments":[{"group":{"start":17,"value":"\"Atlantic cod (COD)\"","children":[{"start":18,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":170,"gherkinStepLine":132,"keywordType":"Outcome","textWithKeyword":"Then the account page does not list species \"Atlantic cod (COD)\"","stepMatchArguments":[{"group":{"start":39,"value":"\"Atlantic cod (COD)\"","children":[{"start":40,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":173,"pickleLine":134,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":174,"gherkinStepLine":135,"keywordType":"Action","textWithKeyword":"When I replace any saved \"Atlantic cod (COD)\" species with \"Atlantic cod (COD)\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Atlantic cod (COD)\"","children":[{"start":21,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":54,"value":"\"Atlantic cod (COD)\"","children":[{"start":55,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":175,"gherkinStepLine":136,"keywordType":"Outcome","textWithKeyword":"Then I am on the account page","stepMatchArguments":[]}]},
  {"pwTestLine":182,"pickleLine":140,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":183,"gherkinStepLine":141,"keywordType":"Context","textWithKeyword":"Given port \"Plymouth\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Plymouth\"","children":[{"start":6,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":184,"gherkinStepLine":142,"keywordType":"Action","textWithKeyword":"When I start a catch record and search for port \"Plymouth\"","stepMatchArguments":[{"group":{"start":43,"value":"\"Plymouth\"","children":[{"start":44,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":185,"gherkinStepLine":143,"keywordType":"Outcome","textWithKeyword":"Then the departure-port suggestions include \"Plymouth\"","stepMatchArguments":[{"group":{"start":39,"value":"\"Plymouth\"","children":[{"start":40,"value":"Plymouth","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":188,"pickleLine":145,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":189,"gherkinStepLine":146,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":190,"gherkinStepLine":147,"keywordType":"Action","textWithKeyword":"When I open gear selection","stepMatchArguments":[]},{"pwStepLine":191,"gherkinStepLine":148,"keywordType":"Outcome","textWithKeyword":"Then gear \"Pots\" is available to select","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":194,"pickleLine":150,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":195,"gherkinStepLine":151,"keywordType":"Context","textWithKeyword":"Given species \"Atlantic cod (COD)\" is saved","stepMatchArguments":[{"group":{"start":8,"value":"\"Atlantic cod (COD)\"","children":[{"start":9,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":196,"gherkinStepLine":152,"keywordType":"Action","textWithKeyword":"When I open species selection","stepMatchArguments":[]},{"pwStepLine":197,"gherkinStepLine":153,"keywordType":"Outcome","textWithKeyword":"Then species \"Atlantic cod (COD)\" is available to select","stepMatchArguments":[{"group":{"start":8,"value":"\"Atlantic cod (COD)\"","children":[{"start":9,"value":"Atlantic cod (COD)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":200,"pickleLine":155,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":201,"gherkinStepLine":156,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":202,"gherkinStepLine":157,"keywordType":"Action","textWithKeyword":"When I reopen the account page","stepMatchArguments":[]},{"pwStepLine":203,"gherkinStepLine":158,"keywordType":"Outcome","textWithKeyword":"Then the account page lists gear \"Pots\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Pots\"","children":[{"start":29,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":206,"pickleLine":160,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":207,"gherkinStepLine":161,"keywordType":"Context","textWithKeyword":"Given gear \"Pots\" is saved","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":208,"gherkinStepLine":162,"keywordType":"Action","textWithKeyword":"When I save gear \"Pots\" from the add-gear journey and open gear selection","stepMatchArguments":[{"group":{"start":12,"value":"\"Pots\"","children":[{"start":13,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":209,"gherkinStepLine":163,"keywordType":"Outcome","textWithKeyword":"Then gear \"Pots\" is available to select","stepMatchArguments":[{"group":{"start":5,"value":"\"Pots\"","children":[{"start":6,"value":"Pots","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":216,"pickleLine":167,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":217,"gherkinStepLine":168,"keywordType":"Action","textWithKeyword":"When I select a line gear from search prefix \"lo\" and continue","stepMatchArguments":[{"group":{"start":40,"value":"\"lo\"","children":[{"start":41,"value":"lo","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":218,"gherkinStepLine":169,"keywordType":"Outcome","textWithKeyword":"Then the gear measurements form is displayed","stepMatchArguments":[]}]},
  {"pwTestLine":221,"pickleLine":171,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":222,"gherkinStepLine":172,"keywordType":"Action","textWithKeyword":"When I submit gear text that is not in the catalogue","stepMatchArguments":[]},{"pwStepLine":223,"gherkinStepLine":173,"keywordType":"Outcome","textWithKeyword":"Then the catalogue validation error is shown","stepMatchArguments":[]},{"pwStepLine":224,"gherkinStepLine":174,"keywordType":"Outcome","textWithKeyword":"And the saved gear list is unchanged","stepMatchArguments":[]}]},
  {"pwTestLine":227,"pickleLine":176,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":228,"gherkinStepLine":177,"keywordType":"Action","textWithKeyword":"When I continue without selecting a gear","stepMatchArguments":[]},{"pwStepLine":229,"gherkinStepLine":178,"keywordType":"Outcome","textWithKeyword":"Then the required-gear validation error is shown","stepMatchArguments":[]},{"pwStepLine":230,"gherkinStepLine":179,"keywordType":"Outcome","textWithKeyword":"And the saved gear list is unchanged","stepMatchArguments":[]}]},
  {"pwTestLine":233,"pickleLine":181,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":234,"gherkinStepLine":182,"keywordType":"Action","textWithKeyword":"When I select a line gear and continue without entering measurements","stepMatchArguments":[]},{"pwStepLine":235,"gherkinStepLine":183,"keywordType":"Outcome","textWithKeyword":"Then the required measurement errors are shown","stepMatchArguments":[]},{"pwStepLine":236,"gherkinStepLine":184,"keywordType":"Outcome","textWithKeyword":"And the saved gear list is unchanged","stepMatchArguments":[]}]},
  {"pwTestLine":239,"pickleLine":186,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":240,"gherkinStepLine":187,"keywordType":"Action","textWithKeyword":"When I enter fractional and negative gear measurements","stepMatchArguments":[]},{"pwStepLine":241,"gherkinStepLine":188,"keywordType":"Outcome","textWithKeyword":"Then the measurement validation errors are shown","stepMatchArguments":[]},{"pwStepLine":242,"gherkinStepLine":189,"keywordType":"Outcome","textWithKeyword":"And the saved gear list is unchanged","stepMatchArguments":[]}]},
  {"pwTestLine":245,"pickleLine":191,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":246,"gherkinStepLine":192,"keywordType":"Action","textWithKeyword":"When I enter a zero gear measurement","stepMatchArguments":[]},{"pwStepLine":247,"gherkinStepLine":193,"keywordType":"Outcome","textWithKeyword":"Then the positive measurement validation error is shown","stepMatchArguments":[]},{"pwStepLine":248,"gherkinStepLine":194,"keywordType":"Outcome","textWithKeyword":"And the saved gear list is unchanged","stepMatchArguments":[]}]},
  {"pwTestLine":251,"pickleLine":196,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in and on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":252,"gherkinStepLine":197,"keywordType":"Action","textWithKeyword":"When I save a line gear using only the Enter key","stepMatchArguments":[]},{"pwStepLine":253,"gherkinStepLine":198,"keywordType":"Outcome","textWithKeyword":"Then the selected gear is saved to my account","stepMatchArguments":[]}]},
]; // bdd-data-end