User Story

As a fisher recording a catch on the web service,
I want the map to open around my declared departure port and display at least the 9 nearest ICES Statistical sub-rectangles,
so that I can navigate the map and select the sub-rectangle where the majority of my catch was caught.

Description of the Ticket

Develop the ICES Statistical sub-rectangle selection map for the web-based Catch Recording service.

When the map opens, it must use the departure port declared for the fishing trip as its starting reference point and display a minimum of the 9 nearest relevant ICES Statistical sub-rectangles. On larger screens, the map may display more than 9 sub-rectangles where the visible map area allows.

The user must be able to:

Zoom in.

Zoom out.

Drag or pan the map left, right, up and down.

View additional coastline and sub-rectangles when zooming out or moving the map.

Select any sub-rectangle that is wholly or partially over the sea.

When the user zooms in, fewer sub-rectangles may be visible because the visible geographical area becomes smaller. Sub-rectangles located entirely on land must not be displayed.

These requirements reflect Alexandra Turnbull’s confirmation that 9 is the minimum default, rather than a fixed maximum, and that the visible rectangles should respond to screen size, zoom level and map position. [RE: 9 ICES...rt for web | Outlook], [Re: 9 ICES...rt for web | Outlook]

The departure-port-to-sub-rectangle mapping must use the approved mapping/reference data supplied for the existing service. The existing service information maps the nearest 9 sub-rectangles to the user’s selected departure port. [Re: Reference Data | Outlook]

In Scope

Web-based map for the Catch Recording website.

Internet-connected use of the map.

Centre the initial map view on, or around, the declared departure port.

Display a minimum of the 9 nearest ICES Statistical sub-rectangles by default.

Display more than 9 sub-rectangles where the screen size and visible map area allow.

Allow the user to zoom in and zoom out.

Allow the user to pan or drag the map:

Left.

Right.

Up.

Down.

Dynamically update the coastline and sub-rectangles displayed according to:

Screen size.

Zoom level.

Visible map area.

Map position.

Allow selection of sub-rectangles wholly or partially over the sea.

Exclude sub-rectangles located entirely on land.

Keep the initial map area related to the departure port declared for the trip.

Allow the user to select one ICES Statistical sub-rectangle for the fishing activity.

Use the approved port and ICES sub-rectangle mapping/reference data.

Store the selected sub-rectangle against the appropriate fishing activity or catch record.

Support the established ICES code structure, where the statistical sub-area code comprises the ICES rectangle followed by the relevant sub-rectangle number. [CR_Guidanc...uly_23 (2) | PDF]

Out of Scope

iOS mobile application functionality.

Android mobile application functionality.

Offline map access or offline data storage.

Mobile-specific gestures or mobile-native map behaviour.

Changes to how the departure port is selected or recorded.

Creation or maintenance of ICES geographical reference data.

Changes to the official ICES rectangle or sub-rectangle boundaries.

Displaying sub-rectangles located entirely on land.

Selecting more than one sub-rectangle for the same fishing activity, unless covered by a separate requirement.

Changing the catch-recording rules that determine which statistical area the fisher should select.

A fixed maximum of 9 visible sub-rectangles.

Automatic selection of a sub-rectangle without user confirmation.

Functional Requirements

FR1: Initial Map Position

The system shall open the web map using the departure port declared for the fishing trip as the reference location.

FR2: Display Minimum Sub-Rectangles

The system shall display a minimum of the 9 nearest relevant ICES Statistical sub-rectangles when the map initially loads.

FR3: Larger-Screen Display

The system shall allow more than 9 sub-rectangles to be displayed where the browser screen size and visible map area allow.

FR4: Zoom In

The system shall allow the user to zoom in on the web map.

As the user zooms in, the system shall reduce the geographical area displayed and may show fewer sub-rectangles according to the visible area.

FR5: Zoom Out

The system shall allow the user to zoom out on the web map.

As the user zooms out, the system shall display the additional coastline and ICES Statistical sub-rectangles contained within the expanded visible area.

FR6: Pan the Map

The system shall allow the user to drag or pan the map:

Left.

Right.

Up.

Down.

FR7: Dynamically Update the Visible Area

The system shall update the coastline and sub-rectangles displayed when the user changes the map’s zoom level or position.

FR8: Sea-Based Sub-Rectangles

The system shall display and allow selection of any sub-rectangle that is:

Wholly over the sea; or

Partially over the sea.

FR9: Land-Only Sub-Rectangles

The system shall not display a sub-rectangle that is located entirely on land.

FR10: Select a Sub-Rectangle

The system shall allow the user to select a visible and selectable ICES Statistical sub-rectangle.

FR11: Record the Selection

The system shall associate the selected ICES Statistical sub-rectangle with the relevant fishing activity or catch record.

FR12: Reference Data

The system shall use the approved departure-port and ICES Statistical sub-rectangle mapping data to determine the initial 9 nearest sub-rectangles.

Non-Functional Requirements

NFR1: Accessibility

The map controls and selectable sub-rectangles shall be usable through supported keyboard navigation and assistive technologies, in accordance with the service’s agreed accessibility standard.

NFR2: Responsive Web Design

The map shall adapt to different supported web browser window sizes. Larger visible areas may show more sub-rectangles, but the initial display shall show at least 9 relevant sub-rectangles.

NFR3: Performance

The initial map, coastline and relevant sub-rectangles shall load within the service’s agreed web performance threshold under normal operating conditions.

NFR4: Map Interaction

Zooming and panning shall update the visible map area without requiring the full webpage to be manually refreshed.

NFR5: Data Accuracy

The displayed sub-rectangle identifiers, boundaries and departure-port mappings shall match the approved ICES and service reference data.

NFR6: Browser Compatibility

The web map shall operate on all browsers and browser versions supported by the Catch Recording web service.

NFR7: Usability

Selectable and non-selectable map areas shall be visually distinguishable, and the currently selected sub-rectangle shall be clearly indicated.

NFR8: Security

The map shall only retrieve and submit information through approved service endpoints and shall not expose sensitive trip or vessel information through map requests or browser logs.

Business Rules

BR1: Minimum Initial Display

The initial web map view must show at least 9 relevant ICES Statistical sub-rectangles.

BR2: Nine Is Not a Maximum

The number 9 represents the minimum default display and must not be treated as a fixed maximum.

BR3: Departure Port Relationship

The initial set of sub-rectangles must relate to the departure port declared for the fishing trip.

BR4: Responsive Number of Sub-Rectangles

The number of visible sub-rectangles may increase or decrease according to the screen size, zoom level and visible geographical area.

BR5: Zoom-Out Rule

Zooming out must make additional coastline and relevant sub-rectangles visible where they fall within the expanded map area.

BR6: Zoom-In Rule

Zooming in may reduce the number of visible sub-rectangles because a smaller geographical area is displayed.

BR7: Partial-Sea Rule

A sub-rectangle that is partially over the sea must be displayed and selectable.

BR8: Land-Only Rule

A sub-rectangle located entirely on land must not be displayed.

BR9: Catch Location

The fisher should select the statistical sub-area where the majority of the catch was caught, in line with existing Catch Recording guidance. [CR_Guidanc...uly_23 (2) | PDF]

BR10: Approved Reference Data

The initial 9 nearest sub-rectangles must be determined using the approved departure-port mapping and ICES reference data.

Acceptance Criteria

AC1: Initial Map Display

Given the user has declared a departure port for the trip
When the user opens the ICES Statistical sub-rectangle web map
Then the map is positioned around the declared departure port
And at least the 9 nearest relevant sub-rectangles are displayed.

AC2: Larger Web Screen

Given the map is opened on a larger supported screen
When the visible map area can accommodate more than 9 sub-rectangles
Then the system may display the additional relevant sub-rectangles
And the display is not restricted to exactly 9.

AC3: Zoom Out

Given the map is displaying the initial departure-port area
When the user zooms out
Then a larger geographical area is displayed
And additional coastline is shown
And additional relevant sub-rectangles within the visible area are displayed.

AC4: Zoom In

Given multiple sub-rectangles are visible
When the user zooms in
Then a smaller geographical area is displayed
And the number of visible sub-rectangles may decrease according to the visible area.

AC5: Pan Left and Right

Given the web map is displayed
When the user drags the map left or right
Then the map moves in the selected direction
And the coastline and sub-rectangles visible within the new map area are displayed.

AC6: Pan Up and Down

Given the web map is displayed
When the user drags the map up or down
Then the map moves in the selected direction
And the coastline and sub-rectangles visible within the new map area are displayed.

AC7: Partially Over-Sea Sub-Rectangle

Given an ICES Statistical sub-rectangle is partially over the sea
When it falls within the visible map area
Then the sub-rectangle is displayed
And the user can select it.

AC8: Wholly Over-Sea Sub-Rectangle

Given an ICES Statistical sub-rectangle is wholly over the sea
When it falls within the visible map area
Then the sub-rectangle is displayed
And the user can select it.

AC9: Land-Only Sub-Rectangle

Given an ICES Statistical sub-rectangle is located entirely on land
When the relevant geographical area is displayed
Then the land-only sub-rectangle is not shown
And it cannot be selected.

AC10: Select a Sub-Rectangle

Given a selectable ICES Statistical sub-rectangle is displayed
When the user selects it
Then the selected sub-rectangle is clearly highlighted
And its identifier is captured for the fishing activity.

AC11: Save the Selection

Given the user has selected a valid ICES Statistical sub-rectangle
When the user saves or continues
Then the selected sub-rectangle is stored against the correct fishing activity or catch record.

AC12: Web-Only Behaviour

Given this story is implemented
When the functionality is tested
Then it is available through the internet-based Catch Recording website
And no iOS, Android or offline mobile functionality is introduced by this story.

AC13: No Departure Port

Given no departure port has been declared for the trip
When the user attempts to open the ICES Statistical sub-rectangle map
Then the system does not calculate or display the nearest 9 sub-rectangles
And the user is directed to provide or select a departure port before continuing.

AC14: Map Data Cannot Be Loaded

Given the user opens the web map
When the required map or reference data cannot be loaded
Then the system displays a clear error message
And the user is not allowed to submit an unverified map selection
And the user is given an option to retry.

Source and Drafting Notes

The confirmed business requirements are taken from Re: 9 ICES Statistical Rectangles from the leave port for web , the related internal response, the supplied reference-data discussion and the existing Catch Recording guidance. [RE: 9 ICES...rt for web | Outlook], [Re: 9 ICES...rt for web | Outlook], [Re: Reference Data | Outlook], [CR_Guidanc...uly_23 (2) | PDF]

The accessibility, security, performance, browser-support and failure-handling requirements above are proposed delivery requirements and should use the project’s agreed technical thresholds during refinement.

Main improvements made

Clarified that 9 is the minimum, not the maximum.

Separated the web requirement from iOS, Android and offline functionality.

Converted Alexandra Turnbull’s zoom, pan, coastline, sea and land rules into testable requirements.

Added Gherkin acceptance criteria suitable for Jira or Azure DevOps.

Distinguished confirmed business rules from proposed technical and non-functional requirements.