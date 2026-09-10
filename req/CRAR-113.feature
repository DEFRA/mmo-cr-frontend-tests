# CRAR-113 — ICES Statistical sub-rectangle map
#
# BDD scenarios derived from req/CRAR-113.md for review before automation.
# Tags map back to the Acceptance Criteria (AC), Functional Requirements (FR),
# Business Rules (BR) and Non-Functional Requirements (NFR) in that document.

@CRAR-113 @map
Feature: ICES Statistical sub-rectangle selection map
    As a fisher recording a catch on the web service
    I want the map to open around my declared departure port and display at least the 9 nearest ICES Statistical sub-rectangles
    So that I can navigate the map and select the sub-rectangle where the majority of my catch was caught

    Background:
        Given I am signed in to the Catch Recording web service
        And I have started a new catch record for a registered vessel
        And I have entered the trip dates, return port and gear details
        And I have declared "Hastings" as my departure port

    @AC1 @FR1 @FR2 @BR1 @BR3 @BR10
    Scenario: Map opens centred on the declared departure port with the minimum sub-rectangles
        When I open the ICES Statistical sub-rectangle map
        Then the map is centred on or around "Hastings"
        And at least 9 relevant ICES Statistical sub-rectangles are displayed

    @AC2 @FR3 @BR2 @BR4 @NFR2
    Scenario: A larger browser window may display more than the minimum sub-rectangles
        Given I have opened the ICES Statistical sub-rectangle map on a large desktop browser window
        When the visible map area can accommodate more than 9 sub-rectangles
        Then more than 9 relevant sub-rectangles are displayed
        And the display is not restricted to exactly 9

    @AC3 @FR5 @FR7 @BR5
    Scenario: Zooming out reveals additional coastline and sub-rectangles
        Given the map is displaying the initial departure port area
        When I zoom out on the map
        Then a larger geographical area is displayed
        And additional coastline is shown
        And additional relevant sub-rectangles within the visible area are displayed

    @AC4 @FR4 @FR7 @BR6
    Scenario: Zooming in may reduce the number of visible sub-rectangles
        Given multiple sub-rectangles are visible on the map
        When I zoom in on the map
        Then a smaller geographical area is displayed
        And the number of visible sub-rectangles decreases or stays the same

    @AC5 @FR6 @FR7
    Scenario Outline: Panning the map left and right updates the visible area
        Given the map is displayed
        When I drag the map "<direction>"
        Then the map moves in the "<direction>" direction
        And the coastline and sub-rectangles within the new visible area are displayed

        Examples:
            | direction |
            | left      |
            | right     |

    @AC6 @FR6 @FR7
    Scenario Outline: Panning the map up and down updates the visible area
        Given the map is displayed
        When I drag the map "<direction>"
        Then the map moves in the "<direction>" direction
        And the coastline and sub-rectangles within the new visible area are displayed

        Examples:
            | direction |
            | up        |
            | down      |

    @AC7 @FR8 @BR7
    Scenario: A sub-rectangle partially over the sea can be selected
        Given a sub-rectangle that is partially over the sea is visible on the map
        When I select that sub-rectangle
        Then the sub-rectangle remains displayed
        And I am able to select it

    @AC8 @FR8 @BR7
    Scenario: A sub-rectangle wholly over the sea can be selected
        Given a sub-rectangle that is wholly over the sea is visible on the map
        When I select that sub-rectangle
        Then the sub-rectangle remains displayed
        And I am able to select it

    @AC9 @FR9 @BR8
    Scenario: A sub-rectangle located entirely on land is not shown
        Given a sub-rectangle is located entirely on land within the current visible area
        When the map renders that geographical area
        Then the land-only sub-rectangle is not displayed
        And it cannot be selected

    @AC10 @FR10 @NFR7
    Scenario: Selecting a sub-rectangle highlights it and captures the identifier
        Given a selectable sub-rectangle is displayed on the map
        When I select the sub-rectangle
        Then the selected sub-rectangle is clearly highlighted
        And its identifier is captured for the fishing activity

    @AC11 @FR11
    Scenario: The selected sub-rectangle is stored against the catch record
        Given I have selected a valid ICES Statistical sub-rectangle
        When I save and continue
        Then the selected sub-rectangle is stored against the fishing activity
        And it is shown on the check-your-answers / confirmation screen

    @AC12 @out-of-scope
    Scenario: The map is only available on the web service
        Given this story has been implemented
        Then the map functionality is available through the internet-based Catch Recording website
        And no iOS, Android or offline mobile functionality is introduced

    @AC13 @FR1
    Scenario: The map cannot be opened without a declared departure port
        Given I have not declared a departure port for the trip
        When I attempt to open the ICES Statistical sub-rectangle map
        Then the nearest 9 sub-rectangles are not calculated or displayed
        And I am directed to provide or select a departure port before continuing

    @AC14 @NFR3
    Scenario: A clear error is shown when map or reference data cannot be loaded
        Given the map or reference data service is unavailable
        When I open the ICES Statistical sub-rectangle map
        Then a clear error message is displayed
        And I cannot submit an unverified map selection
        And I am given an option to retry

    @NFR1 @accessibility
    Scenario: Map controls are usable with keyboard navigation
        Given the map is displayed
        When I navigate the map controls using only the keyboard
        Then I can zoom in, zoom out, pan and select a sub-rectangle without a mouse

    @NFR5 @data-accuracy
    Scenario: Selected sub-rectangle identifier matches the ICES code structure
        Given I have selected a sub-rectangle on the map
        Then the identifier follows the ICES rectangle (for example 29E6) followed by the sub-rectangle number (1-9)

    @NFR6 @cross-browser
    Scenario Outline: The map operates on all supported browsers
        Given I am using "<browser>"
        When I open the ICES Statistical sub-rectangle map
        Then the map, zoom, pan and selection controls all function correctly

        Examples:
            | browser |
            | Chrome  |
            | Edge    |
            | Firefox |
            | Safari  |
