Description

User Story
As a fisher submitting catch records regularly
I want to create, maintain and use favourite species, ports and gear types
So that I can complete catch records more quickly and reduce repetitive data entry. [VN - Catc...v1.4.xlsx | Excel]

Brief Description
The current Catch Recording service allows users to save commonly used ports, gear and species as favourites. These favourites are then automatically presented during catch record creation, reducing search effort and speeding up data entry. Users can add, remove and amend favourites at any time. [VN - Catc...v1.4.xlsx | Excel]

The Web application shall provide equivalent functionality, allowing users to:

Add favourite species

Add favourite ports

Add favourite gear types

Remove favourites

Edit favourites

Automatically surface favourites during catch-record creation

Synchronise favourites across channels where applicable

In Scope
Create favourite species.

Create favourite gear types.

Create favourite ports.

Remove favourite species.

Remove favourite gear types.

Remove favourite ports.

View favourites in dedicated favourites management screens.

Automatically display favourites during catch record creation.

Search reference data when adding new favourites.

Prevent duplicate favourites being added.

Persist favourites against the user account.

Support English and Welsh content.

The guidance specifically states that ports, gear and species can be added as favourites before creating a catch record and can be amended at any time.

Out of Scope
Creating new species reference data.

Creating new gear reference data.

Creating new port reference data.

Amending catch records.

Trip preferences or trip templates.

Statistical sub-rectangle favourites.

ICES-area favourites.

The business requirements explicitly state that favourites are limited to species, ports and gear types. Additionally, ICES-area favourites are not required because statistical sub-rectangles are already filtered based on departure port. [VN - Catc...v1.4.xlsx | Excel], [VN - Catc...v1.4.xlsx | Excel]

Functional Requirements
FR1. View favourites
The application shall provide a "Manage favourites" area.

The application shall display favourites grouped by:

Species

Ports

Gear

The application shall display favourites currently saved by the user.

FR2. Add favourite species
The user shall be able to select Add species.

The application shall search approved species reference data.

Users shall only be able to select valid species from the approved reference dataset.

Free-text species entries shall not be accepted.

The selected species shall be added to the user's favourites list.

The existing service already supports adding species to a favourites list and uses reference-data lookups rather than free-text entries. [Field type...validation | Excel]

FR3. Add favourite gear
The user shall be able to select Add gear.

The application shall search approved gear reference data.

Users shall only be able to select a valid gear from the reference dataset.

Free-text gear entries shall not be accepted.

The selected gear shall be added to favourites.

The current process allows users to search and select gear types from a controlled list and save them for future use.

FR4. Add favourite ports
The user shall be able to select Add port.

The application shall search approved port reference data.

Users shall only be able to select ports from the reference-data list.

Free text shall not be accepted.

The selected port shall be added to favourites.

Port entry currently relies on reference-data selection rather than free-text input. [Field type...validation | Excel]

FR5. Prevent duplicate favourites
A user shall not be able to add the same species more than once.

A user shall not be able to add the same gear more than once.

A user shall not be able to add the same port more than once.

Attempting to add an existing favourite shall display an informative message.

FR6. Remove favourites
Users shall be able to remove an existing favourite.

Removal shall require explicit confirmation.

Removed favourites shall no longer appear in the favourites list.

Removal shall not affect historical catch records.

The guidance explicitly describes removal of gear and species previously added to favourites.+1

FR7. Use favourites during catch recording
Favourite ports shall appear before standard search.

Favourite gear shall appear before standard gear search.

Favourite species shall appear before standard species search.

Users shall still be able to search for non-favourite items.

Selection of a favourite shall not bypass any mandatory catch-record fields.

Current guidance states that saved gear and species automatically appear during future catch records.+1

FR8. Synchronisation
Favourites shall be associated with the user's account.

Favourites shall be available across supported channels.

Changes made on one channel shall be reflected on others after synchronisation.

The guidance describes favourites being managed through a user's account rather than a specific trip.

FR9. Search and lookup behaviour
Searches shall support partial matching.

Matching favourites shall be displayed as the user types.

Search results shall display meaningful identifiers:

Species name and code

Port name

Gear description

The system shall return only valid reference-data entries.

Reference data is currently selected from controlled lookups throughout the catch-record journey. [Field type...validation | Excel], [Field type...validation | Excel], [Field type...validation | Excel]

Non-Functional Requirements
Applicable NFRs from the requirements pack:

95% of interactions complete within 2 seconds. [VN - Catc...v1.4.xlsx | Excel]

Meaningful error messages with no raw system errors. [VN - Catc...v1.4.xlsx | Excel]

WCAG 2.2 AA compliance. [VN - Catc...v1.4.xlsx | Excel]

Welsh-language support. [VN - Catc...v1.4.xlsx | Excel], [VN - Catc...v1.4.xlsx | Excel]

Offline resilience where data cannot be lost. [VN - Catc...v1.4.xlsx | Excel], [VN - Catc...v1.4.xlsx | Excel]

Encryption of personal data at rest and in transit. [VN - Catc...v1.4.xlsx | Excel]

Acceptance Criteria (Gherkin)
Scenario 1: Add favourite species
Given I am signed into the iOS app
When I select "Add favourite species"
And search for a valid species
And select a species from the results
Then the species is added to my favourites list.

Scenario 2: Prevent duplicate favourite species
Given I already have a species saved as a favourite
When I attempt to add the same species again
Then I am informed the species already exists in favourites
And no duplicate favourite is created.

Scenario 3: Add favourite gear
Given I am managing favourites
When I search for and select a gear type
Then the gear is saved as a favourite.

Scenario 4: Add favourite port
Given I am managing favourites
When I search for and select a port
Then the port is saved as a favourite.

Scenario 5: Remove favourite species
Given I have a favourite species
When I choose Remove
And confirm the action
Then the species is removed from favourites.

Scenario 6: Remove favourite gear
Given I have a favourite gear entry
When I choose Remove
And confirm removal
Then the gear is removed from my favourites.

Scenario 7: Remove favourite port
Given I have a favourite port
When I choose Remove
And confirm removal
Then the port is removed from my favourites.

Scenario 8: Use favourite gear during catch recording
Given I have previously saved favourite gear
When I create a new catch record
Then my favourite gear is displayed in the gear-selection list before other search results.

Scenario 9: Use favourite species during catch recording
Given I have favourite species
When I add species to a catch record
Then my favourites are displayed before I search the wider species catalogue.

Scenario 10: Use favourite ports during catch recording
Given I have favourite ports
When I enter departure or return ports during catch recording
Then my saved favourite ports are shown first.

Scenario 11: Reject free-text entries
Given I am adding a species, gear or port favourite
When I enter a value that does not exist in approved reference data
Then I cannot save the favourite
And I am prompted to select a valid item from the list.

Scenario 12: Synchronise favourites
Given I add or remove favourites
When synchronisation completes successfully
Then the latest favourites are available across all supported channels.

Dependencies
E1 Access & Onboarding (authenticated user account)

E2 Fleet & Role Management

Reference-data services (Species, Port, Gear)

E3-S04 Offline Drafts, Retry & Sync

User profile and preferences service

Key Assumptions / Questions
Should favourites be stored per user or per vessel?

Should favourites support ordering and pinning?

Should favourites automatically be created after first use, or only when explicitly added?

Should there be limits on the number of favourites?

Should favourites sync immediately or during the next successful connection?

Should favourite lists be searchable and sortable?