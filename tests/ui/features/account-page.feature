Feature: Fisher account page favourites

  Background:
    Given I am signed in and on the account page

  Scenario: Account page loads with its main sections
    Then I see the account page heading
    And I see the personal, vessel, and favourite sections

  Scenario: Personal details are displayed
    Then I see the personal details section with email, password, and address

  Scenario: Vessel details are displayed
    Then I see the vessel details section with a vessel name

  Scenario: Ports used section has add and remove actions
    Then the "Ports used" section has Add and Remove links

  Scenario: Gear onboard section has add and remove actions
    Then the "Gear onboard" section has Add and Remove links

  Scenario: Species caught section has add and remove actions
    Then the "Species caught" section has Add and Remove links

  Scenario: Add gear page opens
    When I open the add gear page
    Then I see the add gear page and its search field

  Scenario: A gear favourite can be added
    When I ensure gear "Pots" is saved
    Then the account page lists gear "Pots"

  Scenario: Multiple gear favourites can be added
    Given gear "Pots" is saved
    When I add another available gear "Trammel net"
    Then the account page lists gear "Pots"
    And the account page lists gear "Trammel net"

  Scenario: Newly added gear appears without a manual refresh
    When I ensure gear "Pots" is saved
    Then the account page lists gear "Pots"

  Scenario: Adding gear can be cancelled
    When I open the add gear page and go back
    Then I am on the account page

  Scenario: Duplicate gear favourite is rejected
    Given gear "Pots" is saved
    When I try to add gear "Pots" again
    Then I see the duplicate gear error for "Pots"

  Scenario: Remove gear page opens
    When I open the remove gear page
    Then I see the remove gear page

  Scenario: A gear favourite can be removed
    Given gear "Pots" is saved
    When I remove gear "Pots"
    Then the account page does not list gear "Pots"

  Scenario: Adding gear returns to the account page
    When I add gear "Pots" from the catalogue
    Then I am on the account page

  Scenario: Removing gear returns to the account page
    Given gear "Pots" is saved
    When I remove gear "Pots"
    Then I am on the account page

  Scenario: Add port page opens
    When I open the add port page
    Then I see the add port page and its search field

  Scenario: A port favourite can be added
    When I replace saved port "Plymouth" with "Plymouth"
    Then the account page lists port "Plymouth"

  Scenario: Multiple port favourites can be added
    When I replace saved port "Plymouth" with "Plymouth"
    And I replace saved port "Lowestoft" with "Lowestoft"
    Then the account page lists port "Plymouth"
    And the account page lists port "Lowestoft"

  Scenario: Adding a port can be cancelled
    When I open the add port page and go back
    Then I am on the account page

  Scenario: Remove port page opens
    When I open the remove port page
    Then I see the remove port page

  Scenario: Adding a port returns to the account page
    When I replace saved port "Plymouth" with "Plymouth"
    Then I am on the account page

  Scenario: Add species page opens
    When I open the add species page
    Then I see the add species page and its search field

  Scenario: A species favourite can be added
    When I ensure species "Atlantic cod (COD)" is saved
    Then the account page lists species "Atlantic cod (COD)"

  Scenario: Multiple species favourites can be added
    When I ensure species "Atlantic cod (COD)" is saved
    And I ensure species "Atlantic mackerel (MAC)" is saved
    Then the account page lists species "Atlantic cod (COD)"
    And the account page lists species "Atlantic mackerel (MAC)"

  Scenario: Adding a species can be cancelled
    When I open the add species page and go back
    Then I am on the account page

  Scenario: Remove species page opens
    When I open the remove species page
    Then I see the remove species page

  Scenario: A species favourite can be removed
    Given species "Atlantic cod (COD)" is saved
    When I remove species "Atlantic cod (COD)"
    Then the account page does not list species "Atlantic cod (COD)"

  Scenario: Adding a species returns to the account page
    When I replace saved species "Atlantic cod (COD)" with "Atlantic cod (COD)"
    Then I am on the account page

  Scenario: A saved port is suggested during catch-record creation
    Given port "Plymouth" is saved
    When I start a catch record and search departure ports for "Plymouth"
    Then the departure-port options include "Plymouth"

  Scenario: Saved gear is available during catch-record creation
    Given gear "Pots" is saved
    When I open gear selection for a new catch record
    Then gear "Pots" is available to select

  Scenario: Saved species is available during catch-record creation
    Given species "Atlantic cod (COD)" is saved
    When I open species selection for a new catch record
    Then species "Atlantic cod (COD)" is available to select

  Scenario: Favourites persist when the account page is reopened
    Given gear "Pots" is saved
    When I reopen the account page
    Then the account page lists gear "Pots"

  Scenario: Saved gear is available later in the same session
    Given gear "Pots" is saved
    When I remove and re-add gear "Pots", then open gear selection for a new catch record
    Then gear "Pots" is available to select

  Scenario: Catalogue search finds a matching gear option
    When I search for gear prefix "Po" and select "Pots"
    Then gear "Pots" is selected from the catalogue

  Scenario: Gear outside the catalogue is rejected
    When I submit gear text that is not in the catalogue
    Then the catalogue validation error is shown
    And the saved gear list is unchanged

  Scenario: Gear selection is required
    When I continue without selecting a gear
    Then the required-gear validation error is shown
    And the saved gear list is unchanged

  Scenario: Required gear measurements must be entered
    When I select "Pots" and continue without entering a measurement
    Then the required measurement error is shown
    And the saved gear list is unchanged

  Scenario: Fractional and negative measurements are rejected
    When I enter fractional and negative measurements for "Pots"
    Then the fractional and positive-value errors are shown
    And the saved gear list is unchanged

  Scenario: Zero measurement is rejected
    When I enter a zero measurement for "Pots"
    Then the positive measurement error is shown
    And the saved gear list is unchanged

  Scenario: A selected gear can be saved using the Enter key
    When I save "Pots" using only the Enter key
    Then the selected gear "Pots" is saved to my account