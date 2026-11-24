# CRAR-422: Select a previously used port when creating a new catch record

| Field   | Value           |
| ------- | --------------- |
| Status  | Approved        |
| Ticket  | CRAR-422        |
| Author  | Hemasrivani07   |
| Created | 2026-11-24      |
| Feature | @favouritePorts |
| Type    | UI (`tests/ui`) |

## Source

```text
**As a** Catch Record user creating a new catch record,
**I want** to select a port that I have previously used,
**So that** I can quickly record the port I set off from and the port I returned to without adding the port again.

## Description
When a user creates a new catch record and has previously used a port, the previously used port must be presented as an available option on the:

1. **Select the port you set off from** screen.
2. **Select the port you returned to** screen.
The user can select the existing port or use **Add port** if the required port is not available.

# Acceptance Criteria

## AC1 – Display previously used port for port set off from
**Given** the user is creating a new catch record
**And** the user has previously used a port
**When** the **Select the port you set off from** screen is displayed
**Then** the previously used port must be displayed as a selectable radio-button option
**And** the previously used port must **not be selected by default**.
**And** the screen must display:
- Catch record reference
- **Select the port you set off from** heading
- Previously used port option
- **Add port** link
- **Save and continue** button
- **Back** link

## AC2 – Select previously used departure port
**Given** the user is on the **Select the port you set off from** screen
**And** a previously used port is available
**When** the user selects the previously used port
**And** selects **Save and continue**
**Then** the selected port must be recorded as the port the user set off from
**And** the user must proceed to **Select the port you returned to**.

## AC3 – Departure port is mandatory
**Given** the user is on the **Select the port you set off from** screen
**And** no port has been selected
**When** the user selects **Save and continue**
**Then** the user must remain on the same screen
**And** the user must not proceed
**And** the following inline validation error must be displayed:
> **Select the port you left from**

## AC4 – Add a different departure port (new)
**Given** the user is on the **Select the port you set off from** screen
**And** the required departure port is not available among the previously used port options
**When** the user selects **Add port**
**Then** the user must be taken to the existing Add Port journey
**And** the user must be able to add another port for the new catch record.

## AC5 – Display previously used port for port returned to
**Given** the user is creating a new catch record
**And** the user has previously used a port
**And** the user has completed the departure-port step
**When** the **Select the port you returned to** screen is displayed
**Then** the previously used port must be displayed as a selectable radio-button option
**And** the previously used port must **not be selected by default**.
**And** the screen must display:
- Catch record reference
- **Select the port you returned to** heading
- Previously used port option
- **Add port** link
- **Save and continue** button
- **Back** link

## AC6 – Select previously used return port
**Given** the user is on the **Select the port you returned to** screen
**And** a previously used port is available
**When** the user selects the previously used port
**And** selects **Save and continue**
**Then** the selected port must be recorded as the port the user returned to
**And** the user must proceed to the next applicable step in the new catch record journey.

## AC7 – Return port is mandatory
**Given** the user is on the **Select the port you returned to** screen
**And** no port has been selected
**When** the user selects **Save and continue**
**Then** the user must remain on the same screen
**And** the user must not proceed
**And** the following inline validation error must be displayed:
> **Select the port you returned to**

## AC8 – Add a different return port
**Given** the user is on the **Select the port you returned to** screen
**And** the required return port is not available among the previously used port options
**When** the user selects **Add port**
**Then** the user must be taken to the existing Add Port journey
**And** the user must be able to add another port for the new catch record.

## AC9 – Departure and return ports can be selected independently
**Given** the user has selected a port for **Select the port you set off from**
**When** the user reaches **Select the port you returned to**
**Then** the user must be able to select the required return port independently of the departure-port selection.
**And** the service must support the departure and return ports being either:
- The same port, or
- Different ports.

## AC10 – Single port selection
**Given** more than one previously used port is available on a port-selection screen
**When** the user selects a port
**Then** only one port must be selectable at a time.
**And when** the user subsequently selects another port
**Then** the previously selected option must become unselected.

## AC11 – Back navigation from departure port
**Given** the user is on the **Select the port you set off from** screen
**When** the user selects **Back**
**Then** the user must return to the previous applicable screen in the **new catch record** journey.

## AC12 – Back navigation from return port
**Given** the user is on the **Select the port you returned to** screen
**When** the user selects **Back**
**Then** the user must return to the **Select the port you set off from** screen.

## AC13 – Display catch record reference
**Given** the user is creating a new catch record
**When** either port-selection screen is displayed
**Then** the catch record reference must be displayed above the page heading
**And** the reference must correspond to the new catch record being created.

## AC14 – Previously used port remains available for reuse
**Given** a port has already been used by the user in a previous catch record
**When** the user creates another new catch record
**Then** the previously used port must be available for selection
**And** the user must not be required to add the same port again before it can be selected.

## Key distinction from first-time entry
> **First-time entry:** Where the user has not previously used the required port, the user follows the **Add port** journey to add the port.
> **Second-time entry:** Where the user has previously used a port, that port is presented as a selectable option when creating a new catch record. The user can reuse the existing port without adding it again.
```

## Analysis

- Existing coverage:
  - **AC1 (partial):** `tests/ui/favourites/createAndAmendFavourites.spec.ts` › "Suggests favourite ports before searching
    during departure-port entry" and `tests/ui/account/accountSelections.spec.ts` assert a favourite port radio is
    visible on `/departure-port`. Not covered: not selected by default, reference, Add port, Save and continue, Back.
  - **AC2 (covered):** the `return` variant of the same favourites test selects a favourite departure port and reaches
    `/return-port`; `tests/ui/e2e/tripInformation.spec.ts` (UAT-06) asserts the departure port saved on
    `/check-answers`. Scenario 2 below makes the move to the return screen an explicit `Then`.
  - **Add port journey (main focus of this revision, AC4/AC8):** not covered. `PortSelectionPage.clickAddPort()` has
    never been used by a spec, and existing specs go straight to `/add-port?for=<type>&entry=1` without passing through
    the radio screens. Scenarios 1 and 2 follow the user's journey on each radio screen: saved ports shown → "Add port"
    link shown on the same screen → Add port screen → search and select Hastings → recorded and the journey continues.
  - **AC5 (partial):** the `return` variant of the favourites test asserts the favourite radio on `/return-port`.
    Not covered: not selected by default, reference, Add port, Save and continue, Back.
  - **AC6 (covered):** `tripInformation.spec.ts` asserts the return port on `/check-answers` and the next step
    (`/gear-selection`); `catchRecordFlow.selectPorts()` asserts `/gear-selection` in every e2e spec that uses it.
  - **AC9 different ports (covered):** `tripInformation.spec.ts` (Plymouth → Lowestoft). **Same port** only implicit
    (`selectPorts(plymouth, plymouth)` in `catchLocation`, `fishingGear`, `landingInformation` etc.) with no
    recorded-value assertion; new Scenario 3 covers it. Different ports are also covered by Scenario 2 (Plymouth →
    Hastings).
  - **AC14 (partial):** "previously used port" means the account's saved "Ports used" favourites (OQ-2, answered).
    The favourites "Suggests favourite ports…" tests show a saved port is offered on a new record. Not covered: a saved
    port used on one catch record is offered again, unselected, on the next new record. Scenario 9 covers that.
  - **AC3, AC4, AC7, AC8, AC10, AC11, AC12, AC13:** not covered. `PortSelectionPage.clickAddPort()` has never been used
    by a spec. Existing specs go straight to `/add-port?for=<type>&entry=1`.
  - **Decision (revised 2026-11-24 at the user's request):** a single spec,
    `tests/ui/port-selection/addPortFunctionality.spec.ts`, with one outer `test.describe` for the feature and two
    nested `test.describe` blocks (Gherkin `Rule`s), each with its own `test.use`:
    - "Add a port that is not among my previously used ports": saves Plymouth and Lowestoft, and removes Hastings
      (restored afterwards). This is the main focus.
    - "Choose from my previously used ports": saves Plymouth and Lowestoft only.

    `addAnotherPort.spec.ts` is deleted. **Accepted exception (OQ-12, approved by @hehemasr_CGEMU on 2026-11-24):**
    the user chose one spec file with two `test.describe` blocks, against the instructions rule "put each group in its
    own spec file with a single top-level `test.describe`". Do not extend `createAndAmendFavourites.spec.ts`, which
    covers account favourites management and has an `afterEach` that unconditionally removes Plymouth and Lowestoft.
    Do not extend the UAT-traced `tripInformation.spec.ts`.

  - **AC1/AC5 folded into the Add port scenarios:** the radio-screen checks (reference, saved ports, nothing selected,
    Add port link, Save and continue, Back) run once per screen, at the start of Scenarios 1 and 2, instead of in
    separate display-only scenarios.
- AC issues:
  - "Previously used port" was not defined in the story. **Answered (OQ-2):** it means the account's saved favourite
    ports ("Ports used"). This matches the repository: the `catchRecordFlow.selectPorts` comment says "Both ports must be
    favourites so the radio lists are shown".
  - AC1/AC5 call it an **Add port link**, but `PortSelectionPage.addPortButton()` uses `role=button` and has never been
    exercised. **Answered (OQ-3):** it is a link, so `addPortButton` is renamed `addPortLink` with
    `getByRole('link', { name: 'Add port' })`.
  - AC3 message "Select the port you left from" uses different wording from the heading "Select the port you set off
    from". The AC7 message is identical to the return-screen heading. Neither message is confirmed (OQ-4).
  - AC13 "above the page heading" is a visual position. The trip-date page renders the reference within the heading
    accessible name (`TripDatePage.getRecordReference()`), and the "New catch record" caption is a separate element.
    Only presence and match with the new record's reference are asserted (OQ-5).
  - AC11 "previous applicable screen" depends on the trip type: `/trip-date` (same day) or `/trip-return-date`
    (multi-day). Neither target is confirmed on the authenticated radio screen (OQ-6).
  - AC4/AC8 "able to add another port for the new catch record": after an Add port save from the departure step, the
    app shows the confirm-same-port page, the favourite return-port radios or the return-port search, depending on the
    account (`navigationFlow.selectDepartureAndReturnPorts` comment). The recorded value check is unconfirmed (OQ-7).
  - Welsh (`Cymraeg`): the language link is shown on the port screens (live snapshot 2026-11-24), but
    `tests/ui/e2e/welshLanguage.spec.ts` is `test.fixme` because the journey pages have no Welsh copy. **Answered (OQ-9):**
    Welsh stays in scope. Scenario 10 is planned as a blocked `test.fixme` until Welsh copy is confirmed (see the
    Spec Author instructions).
- Accessibility issues: None. The "Add port" control is confirmed as a link (OQ-3), which matches the AC.
- Out of scope:
  - First-time entry (no saved ports redirects straight to Add port). **Answered (OQ-10):** out of scope. Live evidence:
    sessionless `/departure-port` redirects to `/add-port?for=departure&entry=1`.
  - The visual position of the reference "above" the heading (visual or component test).
  - Native radio single-selection on both screens (only the departure screen is checked, AC10).
- Not in scope / possible follow-ups (not requested in the 2026-11-24 revision; candidates for a later ticket):
  - Add port validation (Save and continue on the Add port screen with no port chosen).
  - Partial or no-match search on the Add port screen.
  - Back from the Add port screen to the radio screen.
  - Adding the same port on both screens through Add port (confirm-same-port page).

## Scenarios

```gherkin
Feature: Select a previously used port or add another port

  Rule: Add a port that is not among my previously used ports

    Background:
      Given "Plymouth" and "Lowestoft" are ports I have previously used
      And "Hastings" is not a port I have previously used

    # AC1, AC4, AC13
    Scenario: Add a departure port from the "Select the port you set off from" screen
      Given I have started a new catch record for "ACHILLES"
      When I confirm my trip started and finished today
      Then the "Select the port you set off from" screen is displayed
      And the catch record reference of the new record is displayed
      And "Plymouth" and "Lowestoft" are displayed as port options
      And no port option is selected
      And the "Add port" link is displayed alongside the port options
      And the "Add port" link is displayed below the port options
      And the "Save and continue" button is displayed
      And the "Back" link is displayed
      When I select "Add port"
      Then the "Enter the port or closest port you set off from" screen is displayed
      When I search for and select "Hastings"
      And I select "Save and continue"
      Then I continue to the return port step
      And "Hastings" is recorded as the departure port

    # AC2, AC5, AC8, AC9 (different ports), AC13
    Scenario: Add a return port from the "Select the port you returned to" screen
      Given I have started a new same-day catch record for "ACHILLES"
      When I select "Plymouth" as the port I set off from
      And I select "Save and continue"
      Then the "Select the port you returned to" screen is displayed
      And the catch record reference of the new record is displayed
      And "Plymouth" and "Lowestoft" are displayed as port options
      And no port option is selected
      And the "Add port" link is displayed alongside the port options
      And the "Add port" link is displayed below the port options
      And the "Save and continue" button is displayed
      And the "Back" link is displayed
      When I select "Add port"
      Then the "Enter the port or closest port you returned to" screen is displayed
      When I search for and select "Hastings"
      And I select "Save and continue"
      Then the "What gear did you use?" screen is displayed
      And "Plymouth" is recorded as the departure port
      And "Hastings" is recorded as the return port

  Rule: Choose from my previously used ports

    Background:
      Given "Plymouth" and "Lowestoft" are ports I have previously used

    # AC2, AC6, AC9 (same port)
    Scenario: Record the same previously used port as the departure and return port
      Given I have started a new same-day catch record for "ACHILLES"
      And I have selected "Plymouth" as the port I set off from
      When I select "Plymouth" as the port I returned to
      And I select "Save and continue"
      Then the "What gear did you use?" screen is displayed
      And "Plymouth" is recorded as the departure port
      And "Plymouth" is recorded as the return port

    # AC3
    Scenario: A departure port must be selected
      Given I have started a new same-day catch record for "ACHILLES"
      When I select "Save and continue" without selecting a port
      Then I remain on the "Select the port you set off from" screen
      And I am not taken to the "Select the port you returned to" screen
      And the inline error "Select the port you left from" is displayed

    # AC7
    Scenario: A return port must be selected
      Given I have started a new same-day catch record for "ACHILLES"
      And I have selected "Plymouth" as the port I set off from
      When I select "Save and continue" without selecting a port
      Then I remain on the "Select the port you returned to" screen
      And I am not taken to the "What gear did you use?" screen
      And the inline error "Select the port you returned to" is displayed

    # AC10
    Scenario: Only one previously used port can be selected at a time
      Given I have started a new same-day catch record for "ACHILLES"
      When I select "Plymouth" as the port I set off from
      Then "Plymouth" is selected
      When I select "Lowestoft" as the port I set off from
      Then "Lowestoft" is selected
      And "Plymouth" is no longer selected

    # AC11
    Scenario Outline: Back from the departure port screen returns to the previous screen of a <trip type> catch record
      Given I have started a new <trip type> catch record for "ACHILLES"
      When I select "Back"
      Then the "<previous screen>" screen is displayed

      Examples:
        | trip type | previous screen                           |
        | same-day  | Did your trip start and finish today?     |
        | multi-day | Which date did you return from your trip? |

    # AC12
    Scenario: Back from the return port screen returns to the departure port screen
      Given I have started a new same-day catch record for "ACHILLES"
      And I have selected "Plymouth" as the port I set off from
      When I select "Back"
      Then the "Select the port you set off from" screen is displayed

    # AC14
    Scenario: A previously used port is offered again on my next new catch record
      Given I have recorded "Plymouth" as the port I set off from on a new same-day catch record for "ACHILLES"
      When I start another new same-day catch record for "ACHILLES"
      Then "Plymouth" is displayed as a port option on the "Select the port you set off from" screen
      And "Plymouth" is not selected

    # Welsh journey (blocked until Welsh copy is available; implemented as test.fixme)
    Scenario Outline: The "<port screen>" screen is displayed in Welsh
      Given I am on the "<port screen>" screen of a new same-day catch record for "ACHILLES"
      When I select "Cymraeg"
      Then the "<port screen>" screen is displayed in Welsh
      And "Plymouth" and "Lowestoft" are still displayed as port options

      Examples:
        | port screen                      |
        | Select the port you set off from |
        | Select the port you returned to  |
```

### Scenario-to-AC mapping

All scenarios are in `tests/ui/port-selection/addPortFunctionality.spec.ts`.

| #   | Rule (nested `test.describe`)                         | Scenario                                                                      | ACs                                  |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Add a port that is not among my previously used ports | Add a departure port from the "Select the port you set off from" screen       | AC1, AC4, AC13                       |
| 2   | Add a port that is not among my previously used ports | Add a return port from the "Select the port you returned to" screen           | AC2, AC5, AC8, AC9 (different), AC13 |
| 3   | Choose from my previously used ports                  | Record the same previously used port as the departure and return port         | AC2, AC6, AC9 (same)                 |
| 4   | Choose from my previously used ports                  | A departure port must be selected                                             | AC3                                  |
| 5   | Choose from my previously used ports                  | A return port must be selected                                                | AC7                                  |
| 6   | Choose from my previously used ports                  | Only one previously used port can be selected at a time                       | AC10                                 |
| 7   | Choose from my previously used ports                  | Back from the departure port screen … (same-day, multi-day)                   | AC11                                 |
| 8   | Choose from my previously used ports                  | Back from the return port screen returns to the departure port screen         | AC12                                 |
| 9   | Choose from my previously used ports                  | A previously used port is offered again on my next new catch record           | AC14                                 |
| 10  | Choose from my previously used ports                  | The "<port screen>" screen is displayed in Welsh (both screens, `test.fixme`) | Welsh journey (blocked, OQ-9)        |

## Target files

| File                                                   | New / Update | Purpose                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/ui/port-selection/addPortFunctionality.spec.ts` | New          | Feature "Select a previously used port or add another port": nested describe "Add a port that is not among my previously used ports" (Scenarios 1–2: AC1, AC2, AC4, AC5, AC8, AC9 different ports, AC13) and nested describe "Choose from my previously used ports" (Scenarios 3–10: AC2, AC3, AC6, AC7, AC9 same port, AC10, AC11, AC12, AC14, Welsh `test.fixme`) |
| `tests/ui/port-selection/addAnotherPort.spec.ts`       | Delete       | Merged into `addPortFunctionality.spec.ts` at the user's request; deleted by the Spec Author                                                                                                                                                                                                                                                                        |
| `pages/basePage.ts`                                    | Update       | `PortSelectionPage`: add the missing JSDoc header, replace `addPortButton` with `addPortLink` (OQ-3, link confirmed), add `checkedPortRadios`, `portRadios` and `isAddPortLinkBelowPortOptions()` (OQ-13)                                                                                                                                                           |
| `tests/ui/helpers/catchRecordFlow.ts`                  | Update       | Add `selectDeparturePort`, `removeSavedFavourites`, `restoreAbsentFavourites`; `selectPorts` reuses `selectDeparturePort` (same behaviour)                                                                                                                                                                                                                          |
| `fixtures/commonfixture.ts`                            | Update       | Add `absentFavourites` option to the `createdRecords` session fixture (remove before, restore after)                                                                                                                                                                                                                                                                |

JSDoc headers: the new spec gets a new header (`@author Hemasrivani07`, `@since 2026-11-24`, CRAR key once OQ-1 is
answered). `PortSelectionPage` currently has no class header. Its original addition commit is `9ebf13c` (Randhir Patel,
2026-10-05), so the header uses `@author Randhir Patel` and `@since 2026-10-05`. `CatchRecordFlow`,
`DeparturePortPage`, `ReturnPortPage` and `AddPortPage` already have headers. `NavigationFlow` is no longer changed:
the earlier `addDeparturePortFromSelection` helper is dropped because AC14 now uses saved favourites.

## Test data

| Constant                                          | Value                                                                                 | Evidence (existing spec, page object or live app)                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `vesselName`                                      | `ACHILLES`                                                                            | `tripInformation.spec.ts`, `navigationFlow.ts` (`defaultVessel`)                                        |
| `plymouth`                                        | `Plymouth`                                                                            | `tripInformation.spec.ts`, `createAndAmendFavourites.spec.ts`                                           |
| `lowestoft`                                       | `Lowestoft`                                                                           | `tripInformation.spec.ts`, `createAndAmendFavourites.spec.ts`                                           |
| `hastings`                                        | `Hastings`                                                                            | `createCatchRecord.spec.ts`, `navigationFlow.ts` (`defaultReturnPort`)                                  |
| `departurePortKey` / `returnPortKey`              | `Departure port` / `Return port`                                                      | `tripInformation.spec.ts` (`/check-answers` summary keys)                                               |
| Multi-day trip dates                              | `daysAgo(2)` → `daysAgo(1)`                                                           | `tripDates.spec.ts`, `createCatchRecord.spec.ts`                                                        |
| Departure screen heading                          | `Select the port you set off from`                                                    | `DeparturePortPage.pageHeading`; asserted in `tripDates.spec.ts`, `completeCatchRecord.spec.ts`         |
| Return screen heading                             | `Select the port you returned to`                                                     | `ReturnPortPage.pageHeading`; used in the `navigationFlow` `.or()` wait (not asserted on its own yet)   |
| Add port headings                                 | `Enter the port or closest port you set off from` / `…returned to`                    | `AddPortPage`; live app snapshot 2026-11-24 (`/add-port?for=departure&entry=1`, `/add-port?for=return`) |
| Previous-screen headings                          | `Did your trip start and finish today?` / `Which date did you return from your trip?` | `TripDatePage`, `TripReturnDatePage`                                                                    |
| Gear selection heading                            | `What gear did you use?`                                                              | `GearSelectionPage.pageHeading`                                                                         |
| `departurePortRequiredError`                      | `Select the port you left from`                                                       | **UNVERIFIED (accepted)**: story text only (OQ-4)                                                       |
| `returnPortRequiredError`                         | `Select the port you returned to`                                                     | **UNVERIFIED (accepted)**: story text only (OQ-4)                                                       |
| Welsh port-screen headings                        | Not available                                                                         | **Blocked**: no Welsh journey copy (`welshLanguage.spec.ts`); none invented (OQ-9)                      |
| `testFavourites`                                  | `{ ports: [Plymouth, Lowestoft], gears: [], species: [] }`                            | `tripInformation.spec.ts`                                                                               |
| `absentFavourites` (Add port describe block only) | `{ ports: [Hastings], gears: [], species: [] }`                                       | New fixture option; temporary removal and restore of Hastings accepted (OQ-8)                           |

## Step mapping

**Accepted UNVERIFIED items (OQ-4, OQ-5, OQ-6, OQ-7).** The approver accepted these as items the Spec Author must
confirm in the signed-in Chrome run against `test`. For each item:

- If the live app matches the plan, implement the assertion exactly as written.
- If an item cannot be confirmed, implement that test with
  `test.fixme('<OQ-n>: <what could not be confirmed and the observed behaviour>')`.
- **Do not weaken assertions.** Do not swap in a looser locator, regex, `.or()` fallback or removed step.
- If the live app shows different but definitive copy or a different target, report a deviation so the plan can be
  revised and re-approved. Do not silently change the expected value.
- Record every outcome in the Implementation record.

Shared Given used by most scenarios:
`I have started a new same-day catch record for "ACHILLES"` →
`createdRecords.push(await catchRecordFlow.startRecord(vesselName)); await catchRecordFlow.enterSameDayTrip();`
(Existing; `enterSameDayTrip` waits for `/departure-port`).

`I have selected "Plymouth" as the port I set off from` → `catchRecordFlow.selectDeparturePort(plymouth)` (New; waits
for `/return-port` so the next click cannot hit the departure screen).

### Background: Rule "Add a port that is not among my previously used ports"

| #   | Gherkin statement                                                 | `test.step` title                                             | Page-object / flow calls                                                                                                                           | Status               |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| B1  | Given "Plymouth" and "Lowestoft" are ports I have previously used | `"Plymouth" and "Lowestoft" are ports I have previously used` | Nested `test.describe` with `test.use({ testFavourites, absentFavourites })`; `test.beforeEach` requests `createdRecords` (comment-only step body) | Existing             |
| B2  | And "Hastings" is not a port I have previously used               | `"Hastings" is not a port I have previously used`             | Done at sign-in by the new `absentFavourites` option of `createdRecords`; restored afterwards (comment-only step body)                             | New (OQ-8, accepted) |

### Scenario 1: Add a departure port from the "Select the port you set off from" screen

| #   | Gherkin statement                                                              | `test.step` title                                                           | Page-object / flow calls                                                                                                                                       | Status                               |
| --- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Given I have started a new catch record for "ACHILLES"                         | `I have started a new catch record for "ACHILLES"`                          | `reference = await catchRecordFlow.startRecord(vesselName)`; `createdRecords.push(reference)`                                                                  | Existing                             |
| 2   | When I confirm my trip started and finished today                              | `I confirm my trip started and finished today`                              | `catchRecordFlow.enterSameDayTrip()`                                                                                                                           | Existing                             |
| 3   | Then the "Select the port you set off from" screen is displayed                | `The "Select the port you set off from" screen is displayed`                | `departurePortPage.expectUrl(/\/departure-port$/)`; `expect(departurePortPage.pageHeading()).toBeVisible()`                                                    | Existing                             |
| 4   | And the catch record reference of the new record is displayed                  | `The catch record reference of the new record is displayed`                 | `expect(departurePortPage.pageHeading()).toContainText(reference)`                                                                                             | UNVERIFIED (OQ-5, accepted)          |
| 5   | And "Plymouth" and "Lowestoft" are displayed as port options                   | `"Plymouth" and "Lowestoft" are displayed as port options`                  | `expect(departurePortPage.portRadio(plymouth / lowestoft)).toBeVisible()`                                                                                      | Existing                             |
| 6   | And no port option is selected                                                 | `No port option is selected`                                                | `expect(departurePortPage.checkedPortRadios()).toHaveCount(0)`                                                                                                 | New                                  |
| 7   | And the "Add port" link is displayed alongside the port options                | `The "Add port" link is displayed alongside the port options`               | `expect(departurePortPage.addPortLink()).toBeVisible()`; `expect(departurePortPage.portRadio(plymouth)).toBeVisible()` (same screen)                           | New (link confirmed, OQ-3)           |
| 8   | And the "Add port" link is displayed below the port options                    | `The "Add port" link is displayed below the port options`                   | `await expect.poll(() => departurePortPage.isAddPortLinkBelowPortOptions()).toBe(true)`                                                                        | New, UNVERIFIED (OQ-13: verify live) |
| 9   | And the "Save and continue" button is displayed                                | `The "Save and continue" button is displayed`                               | `expect(departurePortPage.common.saveAndContinueButton()).toBeVisible()`                                                                                       | Existing                             |
| 10  | And the "Back" link is displayed                                               | `The "Back" link is displayed`                                              | `expect(departurePortPage.common.backLink()).toBeVisible()`                                                                                                    | Existing                             |
| 11  | When I select "Add port"                                                       | `I select "Add port"`                                                       | `departurePortPage.clickAddPort()` (uses `addPortLink`)                                                                                                        | New (link confirmed, OQ-3)           |
| 12  | Then the "Enter the port or closest port you set off from" screen is displayed | `The "Enter the port or closest port you set off from" screen is displayed` | `addPortPage.expectUrl(/\/add-port\?for=departure/)`; `expect(addPortPage.pageHeading()).toBeVisible()`                                                        | UNVERIFIED (OQ-7, accepted)          |
| 13  | When I search for and select "Hastings"                                        | `I search for and select "Hastings"`                                        | `addPortPage.searchAndSelectPort(hastings)`                                                                                                                    | Existing                             |
| 14  | And I select "Save and continue"                                               | `I select "Save and continue"`                                              | `addPortPage.clickSaveAndContinue()`                                                                                                                           | Existing                             |
| 15  | Then I continue to the return port step                                        | `I continue to the return port step`                                        | `expect(confirmSamePortPage.pageHeading().or(returnPortPage.pageHeading()).or(addPortPage.returnPortHeading())).toBeVisible()` (pattern from `navigationFlow`) | Existing                             |
| 16  | And "Hastings" is recorded as the departure port                               | `"Hastings" is recorded as the departure port`                              | `checkAnswersPage.goto('/check-answers')`; `expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(hastings)`                                      | UNVERIFIED (OQ-7, accepted)          |

### Scenario 2: Add a return port from the "Select the port you returned to" screen

| #   | Gherkin statement                                                             | `test.step` title                                                          | Page-object / flow calls                                                                                                       | Status                               |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| 1   | Given I have started a new same-day catch record for "ACHILLES"               | `I have started a new same-day catch record for "ACHILLES"`                | `reference = await catchRecordFlow.startRecord(vesselName)`; push; `catchRecordFlow.enterSameDayTrip()`                        | Existing                             |
| 2   | When I select "Plymouth" as the port I set off from                           | `I select "Plymouth" as the port I set off from`                           | `departurePortPage.selectPort(plymouth)`                                                                                       | Existing                             |
| 3   | And I select "Save and continue"                                              | `I select "Save and continue"`                                             | `departurePortPage.clickSaveAndContinue()`                                                                                     | Existing                             |
| 4   | Then the "Select the port you returned to" screen is displayed                | `The "Select the port you returned to" screen is displayed`                | `returnPortPage.expectUrl(/\/return-port$/)`; `expect(returnPortPage.pageHeading()).toBeVisible()`                             | Existing                             |
| 5   | And the catch record reference of the new record is displayed                 | `The catch record reference of the new record is displayed`                | `expect(returnPortPage.pageHeading()).toContainText(reference)`                                                                | UNVERIFIED (OQ-5, accepted)          |
| 6   | And "Plymouth" and "Lowestoft" are displayed as port options                  | `"Plymouth" and "Lowestoft" are displayed as port options`                 | `expect(returnPortPage.portRadio(plymouth / lowestoft)).toBeVisible()`                                                         | Existing                             |
| 7   | And no port option is selected                                                | `No port option is selected`                                               | `expect(returnPortPage.checkedPortRadios()).toHaveCount(0)`                                                                    | New                                  |
| 8   | And the "Add port" link is displayed alongside the port options               | `The "Add port" link is displayed alongside the port options`              | `expect(returnPortPage.addPortLink()).toBeVisible()`; `expect(returnPortPage.portRadio(plymouth)).toBeVisible()` (same screen) | New (link confirmed, OQ-3)           |
| 9   | And the "Add port" link is displayed below the port options                   | `The "Add port" link is displayed below the port options`                  | `await expect.poll(() => returnPortPage.isAddPortLinkBelowPortOptions()).toBe(true)`                                           | New, UNVERIFIED (OQ-13: verify live) |
| 10  | And the "Save and continue" button is displayed                               | `The "Save and continue" button is displayed`                              | `expect(returnPortPage.common.saveAndContinueButton()).toBeVisible()`                                                          | Existing                             |
| 11  | And the "Back" link is displayed                                              | `The "Back" link is displayed`                                             | `expect(returnPortPage.common.backLink()).toBeVisible()`                                                                       | Existing                             |
| 12  | When I select "Add port"                                                      | `I select "Add port"`                                                      | `returnPortPage.clickAddPort()`                                                                                                | New (link confirmed, OQ-3)           |
| 13  | Then the "Enter the port or closest port you returned to" screen is displayed | `The "Enter the port or closest port you returned to" screen is displayed` | `addPortPage.expectUrl(/\/add-port\?for=return/)`; `expect(addPortPage.returnPortHeading()).toBeVisible()`                     | UNVERIFIED (OQ-7, accepted)          |
| 14  | When I search for and select "Hastings"                                       | `I search for and select "Hastings"`                                       | `addPortPage.searchAndSelectPort(hastings)`                                                                                    | Existing                             |
| 15  | And I select "Save and continue"                                              | `I select "Save and continue"`                                             | `addPortPage.clickSaveAndContinue()`                                                                                           | Existing                             |
| 16  | Then the "What gear did you use?" screen is displayed                         | `The "What gear did you use?" screen is displayed`                         | `gearSelectionPage.expectUrl(/\/gear-selection$/)`; `expect(gearSelectionPage.pageHeading()).toBeVisible()`                    | Existing                             |
| 17  | And "Plymouth" is recorded as the departure port                              | `"Plymouth" is recorded as the departure port`                             | `checkAnswersPage.goto('/check-answers')`; `expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(plymouth)`      | Existing                             |
| 18  | And "Hastings" is recorded as the return port                                 | `"Hastings" is recorded as the return port`                                | `expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(hastings)`                                                    | Existing                             |

### Background: Rule "Choose from my previously used ports"

| #   | Gherkin statement                                                 | `test.step` title                                             | Page-object / flow calls                                                                                                                                        | Status   |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| B1  | Given "Plymouth" and "Lowestoft" are ports I have previously used | `"Plymouth" and "Lowestoft" are ports I have previously used` | Nested `test.describe` with `test.use({ testFavourites })`; `test.beforeEach` requests `createdRecords`, which signs in and saves them (comment-only step body) | Existing |

### Scenario 3: Record the same previously used port as the departure and return port

| #   | Gherkin statement                                               | `test.step` title                                           | Page-object / flow calls                                                                                                  | Status   |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Given I have started a new same-day catch record for "ACHILLES" | `I have started a new same-day catch record for "ACHILLES"` | shared Given                                                                                                              | Existing |
| 2   | And I have selected "Plymouth" as the port I set off from       | `I have selected "Plymouth" as the port I set off from`     | `catchRecordFlow.selectDeparturePort(plymouth)`                                                                           | New      |
| 3   | When I select "Plymouth" as the port I returned to              | `I select "Plymouth" as the port I returned to`             | `returnPortPage.selectPort(plymouth)`                                                                                     | Existing |
| 4   | And I select "Save and continue"                                | `I select "Save and continue"`                              | `returnPortPage.clickSaveAndContinue()`                                                                                   | Existing |
| 5   | Then the "What gear did you use?" screen is displayed           | `The "What gear did you use?" screen is displayed`          | `gearSelectionPage.expectUrl(/\/gear-selection$/)`; `expect(gearSelectionPage.pageHeading()).toBeVisible()`               | Existing |
| 6   | And "Plymouth" is recorded as the departure port                | `"Plymouth" is recorded as the departure port`              | `checkAnswersPage.goto('/check-answers')`; `expect(checkAnswersPage.summaryValue(departurePortKey)).toHaveText(plymouth)` | Existing |
| 7   | And "Plymouth" is recorded as the return port                   | `"Plymouth" is recorded as the return port`                 | `expect(checkAnswersPage.summaryValue(returnPortKey)).toHaveText(plymouth)`                                               | Existing |

### Scenario 4: A departure port must be selected

| #   | Gherkin statement                                                  | `test.step` title                                                | Page-object / flow calls                                                                                    | Status                      |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Given I have started a new same-day catch record for "ACHILLES"    | `I have started a new same-day catch record for "ACHILLES"`      | shared Given                                                                                                | Existing                    |
| 2   | When I select "Save and continue" without selecting a port         | `I select "Save and continue" without selecting a port`          | `departurePortPage.clickSaveAndContinue()`                                                                  | Existing                    |
| 3   | Then I remain on the "Select the port you set off from" screen     | `I remain on the "Select the port you set off from" screen`      | `departurePortPage.expectUrl(/\/departure-port$/)`; `expect(departurePortPage.pageHeading()).toBeVisible()` | Existing                    |
| 4   | And I am not taken to the "Select the port you returned to" screen | `I am not taken to the "Select the port you returned to" screen` | `expect(returnPortPage.pageHeading()).toBeHidden()`                                                         | Existing                    |
| 5   | And the inline error "Select the port you left from" is displayed  | `The inline error "Select the port you left from" is displayed`  | `expect(departurePortPage.common.errorMessage()).toContainText(departurePortRequiredError)`                 | UNVERIFIED (OQ-4, accepted) |

### Scenario 5: A return port must be selected

| #   | Gherkin statement                                                   | `test.step` title                                                 | Page-object / flow calls                                                                           | Status                      |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Given I have started a new same-day catch record for "ACHILLES"     | `I have started a new same-day catch record for "ACHILLES"`       | shared Given                                                                                       | Existing                    |
| 2   | And I have selected "Plymouth" as the port I set off from           | `I have selected "Plymouth" as the port I set off from`           | `catchRecordFlow.selectDeparturePort(plymouth)`                                                    | New                         |
| 3   | When I select "Save and continue" without selecting a port          | `I select "Save and continue" without selecting a port`           | `returnPortPage.clickSaveAndContinue()`                                                            | Existing                    |
| 4   | Then I remain on the "Select the port you returned to" screen       | `I remain on the "Select the port you returned to" screen`        | `returnPortPage.expectUrl(/\/return-port$/)`; `expect(returnPortPage.pageHeading()).toBeVisible()` | Existing                    |
| 5   | And I am not taken to the "What gear did you use?" screen           | `I am not taken to the "What gear did you use?" screen`           | `expect(gearSelectionPage.pageHeading()).toBeHidden()`                                             | Existing                    |
| 6   | And the inline error "Select the port you returned to" is displayed | `The inline error "Select the port you returned to" is displayed` | `expect(returnPortPage.common.errorMessage()).toContainText(returnPortRequiredError)`              | UNVERIFIED (OQ-4, accepted) |

### Scenario 6: Only one previously used port can be selected at a time

| #   | Gherkin statement                                               | `test.step` title                                           | Page-object / flow calls                                          | Status   |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| 1   | Given I have started a new same-day catch record for "ACHILLES" | `I have started a new same-day catch record for "ACHILLES"` | shared Given                                                      | Existing |
| 2   | When I select "Plymouth" as the port I set off from             | `I select "Plymouth" as the port I set off from`            | `departurePortPage.selectPort(plymouth)`                          | Existing |
| 3   | Then "Plymouth" is selected                                     | `"Plymouth" is selected`                                    | `expect(departurePortPage.portRadio(plymouth)).toBeChecked()`     | Existing |
| 4   | When I select "Lowestoft" as the port I set off from            | `I select "Lowestoft" as the port I set off from`           | `departurePortPage.selectPort(lowestoft)`                         | Existing |
| 5   | Then "Lowestoft" is selected                                    | `"Lowestoft" is selected`                                   | `expect(departurePortPage.portRadio(lowestoft)).toBeChecked()`    | Existing |
| 6   | And "Plymouth" is no longer selected                            | `"Plymouth" is no longer selected`                          | `expect(departurePortPage.portRadio(plymouth)).not.toBeChecked()` | Existing |

### Scenario 7: Back from the departure port screen returns to the previous screen of a <trip type> catch record

| #   | Gherkin statement                                                  | `test.step` title                                                    | Page-object / flow calls                                                                                                                                                         | Status                      |
| --- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Given I have started a new <trip type> catch record for "ACHILLES" | `` `I have started a new ${tripType} catch record for "ACHILLES"` `` | `startRecord` + push; `enterSameDayTrip()` (same-day) or `enterMultiDayTrip(tripDates)` (multi-day)                                                                              | Existing                    |
| 2   | When I select "Back"                                               | `I select "Back"`                                                    | `departurePortPage.common.backLink().click()`                                                                                                                                    | Existing                    |
| 3   | Then the "<previous screen>" screen is displayed                   | `` `The "${previousScreen}" screen is displayed` ``                  | `previousPage.expectUrl(previousUrl)`; `expect(previousPage.pageHeading()).toBeVisible()` (`tripDatePage` + `/\/trip-date$/`, or `tripReturnDatePage` + `/\/trip-return-date$/`) | UNVERIFIED (OQ-6, accepted) |

### Scenario 8: Back from the return port screen returns to the departure port screen

| #   | Gherkin statement                                               | `test.step` title                                            | Page-object / flow calls                                                                                    | Status                      |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Given I have started a new same-day catch record for "ACHILLES" | `I have started a new same-day catch record for "ACHILLES"`  | shared Given                                                                                                | Existing                    |
| 2   | And I have selected "Plymouth" as the port I set off from       | `I have selected "Plymouth" as the port I set off from`      | `catchRecordFlow.selectDeparturePort(plymouth)`                                                             | New                         |
| 3   | When I select "Back"                                            | `I select "Back"`                                            | `returnPortPage.common.backLink().click()`                                                                  | Existing                    |
| 4   | Then the "Select the port you set off from" screen is displayed | `The "Select the port you set off from" screen is displayed` | `departurePortPage.expectUrl(/\/departure-port$/)`; `expect(departurePortPage.pageHeading()).toBeVisible()` | UNVERIFIED (OQ-6, accepted) |

### Scenario 9: A previously used port is offered again on my next new catch record

| #   | Gherkin statement                                                                                         | `test.step` title                                                                                     | Page-object / flow calls                                                                                               | Status   |
| --- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Given I have recorded "Plymouth" as the port I set off from on a new same-day catch record for "ACHILLES" | `I have recorded "Plymouth" as the port I set off from on a new same-day catch record for "ACHILLES"` | `startRecord` + push; `enterSameDayTrip()`; `catchRecordFlow.selectDeparturePort(plymouth)`                            | New      |
| 2   | When I start another new same-day catch record for "ACHILLES"                                             | `I start another new same-day catch record for "ACHILLES"`                                            | `startRecord` + push; `enterSameDayTrip()`                                                                             | Existing |
| 3   | Then "Plymouth" is displayed as a port option on the "Select the port you set off from" screen            | `"Plymouth" is displayed as a port option on the "Select the port you set off from" screen`           | `expect(departurePortPage.pageHeading()).toBeVisible()`; `expect(departurePortPage.portRadio(plymouth)).toBeVisible()` | Existing |
| 4   | And "Plymouth" is not selected                                                                            | `"Plymouth" is not selected`                                                                          | `expect(departurePortPage.portRadio(plymouth)).not.toBeChecked()`                                                      | Existing |

### Scenario 10: The "<port screen>" screen is displayed in Welsh (blocked: `test.fixme`)

Planned as `test.fixme('OQ-9: Welsh copy is not available on the catch-record journey pages (see tests/ui/e2e/welshLanguage.spec.ts)')`.
During the signed-in Chrome run, the Spec Author selects Cymraeg on each port screen:

- **Welsh copy present:** replace `test.fixme` with `test` and assert the observed Welsh heading as a typed constant.
  Record it as evidence in the Implementation record. If the language choice persists beyond the test's browser
  context, switch back to English at the end of the test.
- **Welsh copy absent:** keep the `test.fixme` with that reason. Do not drop the scenario.

| #   | Gherkin statement                                                                      | `test.step` title                                                                        | Page-object / flow calls                                                                                               | Status            |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Given I am on the "<port screen>" screen of a new same-day catch record for "ACHILLES" | `` `I am on the "${portScreen}" screen of a new same-day catch record for "ACHILLES"` `` | `startRecord` + push; `enterSameDayTrip()`; plus `catchRecordFlow.selectDeparturePort(plymouth)` for the return screen | New               |
| 2   | When I select "Cymraeg"                                                                | `I select "Cymraeg"`                                                                     | `portPage.common.languageCymraeg().click()`                                                                            | Existing          |
| 3   | Then the "<port screen>" screen is displayed in Welsh                                  | `` `The "${portScreen}" screen is displayed in Welsh` ``                                 | Welsh heading assertion; no Welsh copy is available yet                                                                | Blocked (OQ-9)    |
| 4   | And "Plymouth" and "Lowestoft" are still displayed as port options                     | `"Plymouth" and "Lowestoft" are still displayed as port options`                         | `expect(portPage.portRadio(plymouth / lowestoft)).toBeVisible()` (port names assumed untranslated)                     | UNVERIFIED (OQ-9) |

## Page-object, flow-helper and fixture changes

### `pages/basePage.ts` (`PortSelectionPage` only)

`addPortButton` is used only by `clickAddPort()`, and no spec calls either, so renaming it does not break existing
callers. The approver confirmed the "Add port" control is a **link** (OQ-3). OQ-13 adds `portRadios` and
`isAddPortLinkBelowPortOptions()`. The position check stays in the page object so specs never compare raw boxes. It
returns a boolean, and specs wrap it in `expect.poll` because bounding boxes do not auto-retry. GOV.UK radio inputs are
visually hidden but keep a 44 px box over the styled circle, so `boundingBox()` returns a real position. The Spec
Author must confirm this live (OQ-13).

```ts
/**
 * Choose a saved port on the departure-port and return-port screens, or add another port.
 *
 * @author Randhir Patel
 * @since 2026-10-05
 */
export abstract class PortSelectionPage extends BasePage {
  public readonly portRadio = (portName: string): Locator => this.page.getByLabel(portName);
  public readonly portRadios = (): Locator => this.page.getByRole('radio');
  public readonly checkedPortRadios = (): Locator => this.page.getByRole('radio', { checked: true });
  public readonly addPortLink = (): Locator => this.page.getByRole('link', { name: 'Add port' });

  async selectPort(portName: string) {
    await this.portRadio(portName).click();
  }

  async clickAddPort() {
    await this.addPortLink().click();
  }

  // True when the top of the Add port link is at or below the bottom of the last port radio
  async isAddPortLinkBelowPortOptions(): Promise<boolean> {
    const lastPortRadioBox = await this.portRadios().last().boundingBox();
    const addPortLinkBox = await this.addPortLink().boundingBox();
    if (!lastPortRadioBox || !addPortLinkBox) return false;
    return addPortLinkBox.y >= lastPortRadioBox.y + lastPortRadioBox.height;
  }
}
```

### `tests/ui/helpers/catchRecordFlow.ts`

```ts
export class CatchRecordFlow {
  // ...existing members unchanged...

  // Removes the given favourites if saved; returns only those it removed so they can be re-added afterwards
  async removeSavedFavourites(favourites: Favourites): Promise<Favourites> {
    if (favourites.ports.length + favourites.gears.length + favourites.species.length === 0) return noFavourites;

    const { accountPage } = this.pages;
    await this.navigationFlow.openAccount();
    const savedPorts = await accountPage.getPortsUsed();
    const savedGear = await accountPage.getGearOnboardText();
    const savedSpecies = await accountPage.getSpeciesCaught();
    const removed: Favourites = {
      ports: favourites.ports.filter((port) => savedPorts.includes(port)),
      gears: favourites.gears.filter((gear) => savedGear.includes(gear)),
      species: favourites.species.filter((species) => savedSpecies.includes(species))
    };
    await this.restoreFavourites(removed);
    return removed;
  }

  // Removes absent favourites the journey saved, then re-adds those that were saved before the test
  async restoreAbsentFavourites(absent: Favourites, removed: Favourites): Promise<void> {
    await this.restoreFavourites(absent);
    if (removed.ports.length + removed.gears.length + removed.species.length > 0) {
      await this.ensureFavourites(removed);
    }
  }

  // The port must be a favourite so the radio list is shown; waits for the return-port screen
  async selectDeparturePort(departurePort: string): Promise<void> {
    const { departurePortPage, returnPortPage } = this.pages;

    await departurePortPage.selectPort(departurePort);
    await departurePortPage.clickSaveAndContinue();
    await returnPortPage.expectUrl(/\/return-port$/);
  }

  // Both ports must be favourites so the radio lists are shown instead of the port search
  async selectPorts(departurePort: string, returnPort: string): Promise<void> {
    const { returnPortPage, gearSelectionPage } = this.pages;

    await this.selectDeparturePort(departurePort);
    await returnPortPage.selectPort(returnPort);
    await returnPortPage.clickSaveAndContinue();
    await gearSelectionPage.expectUrl(/\/gear-selection$/);
  }
}
```

### `fixtures/commonfixture.ts`

`absentFavourites` defaults to `noFavourites`, so existing specs are unaffected (no extra account visits). It must not
overlap `testFavourites`. Draft cleanup is unchanged: only drafts tracked through `navigationFlow.openNewRecord()` are
deleted, never all account drafts.

```ts
type CatchRecordSessionFixtures = {
  // Favourites the account needs for the test; set per describe block with test.use({ testFavourites })
  testFavourites: Favourites;
  // Favourites that must not be saved during the test; removed at sign-in and restored afterwards
  absentFavourites: Favourites;
  // Signs in and prepares favourites; afterwards deletes the test's drafts and restores the favourites it changed
  createdRecords: string[];
};

export const test = base.extend<CommonFixtures>({
  testFavourites: [noFavourites, { option: true }],
  absentFavourites: [noFavourites, { option: true }],
  createdRecords: async ({ navigationFlow, catchRecordFlow, testFavourites, absentFavourites }, use) => {
    const createdRecords: string[] = [];
    let addedFavourites: Favourites = noFavourites;
    let removedFavourites: Favourites = noFavourites;

    await base.step('Setup: I am signed in with the test favourites saved', async () => {
      await navigationFlow.signIn();
      addedFavourites = await catchRecordFlow.ensureFavourites(testFavourites);
      removedFavourites = await catchRecordFlow.removeSavedFavourites(absentFavourites);
    });

    await use(createdRecords);

    await catchRecordFlow.deleteCreatedDrafts();
    await catchRecordFlow.restoreFavourites(addedFavourites);
    await catchRecordFlow.restoreAbsentFavourites(absentFavourites, removedFavourites);
  }
  // ...other fixtures unchanged...
});
```

## Proposed spec

### `tests/ui/port-selection/addPortFunctionality.spec.ts`

```ts
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
```

`tests/ui/port-selection/addAnotherPort.spec.ts` is no longer proposed. Its two scenarios are merged into the
"Add a port that is not among my previously used ports" block above. The Spec Author deletes the uncommitted copy of
that file from the working tree.

## Tags

`@ui`, `@regression`, `@favouritePorts` on every test. The existing camelCase feature tag for port favourites is reused
and is spelled correctly.

## Verification plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npx playwright test tests/ui/port-selection --project=Chrome`
- Regression for the changed shared helpers and fixture (`selectPorts`, `createdRecords`):
  `npx playwright test tests/ui/e2e/tripInformation.spec.ts tests/ui/e2e/tripDates.spec.ts tests/ui/account/accountSelections.spec.ts --project=Chrome`
- After each run, confirm on `/account` that "Ports used" matches its pre-run state (Plymouth, Lowestoft, Hastings).
  Confirm on `/records` that no draft created by the run remains and no pre-existing draft was removed.

## Open questions

OQ-1 to OQ-11 were answered or accepted on 2026-11-24 (first approval). OQ-12 and OQ-13 were answered at re-approval on
2026-11-24. Nothing remains open. OQ-13 is a live verification item for the Spec Author.

1. **CRAR ticket key. Answered: CRAR-422.** The plan and spec use this ticket key. The branch must follow
   `feature/CRAR-422_<description>`.
2. **Meaning of "previously used port". Answered.** It means the account's saved favourite ports ("Ports used"). AC14
   is planned with the saved favourite Plymouth in `addPortFunctionality.spec.ts`.
3. **Add port control role. Answered.** It is a **link**. Rename `addPortButton` to `addPortLink`.
4. **Validation messages. Accepted as UNVERIFIED.** "Select the port you left from" (AC3) and "Select the port you
   returned to" (AC7) are taken from the story. Verify them in the signed-in Chrome run.
5. **Catch record reference location. Accepted as UNVERIFIED.** The plan asserts
   `pageHeading().toContainText(reference)`. Verify it in the signed-in Chrome run.
6. **Back-link targets. Accepted as UNVERIFIED.** The expected targets are:
   - AC11 same-day: `/trip-date`
   - AC11 multi-day: `/trip-return-date`
   - AC12: `/departure-port`

   Verify them in the signed-in Chrome run.

7. **Add port destination and AC4 recorded value. Accepted as UNVERIFIED.** Expected values:
   - Add port destination: `/add-port?for=departure` or `/add-port?for=return`
   - AC4: `/check-answers` shows the departure port

   Verify both in the signed-in Chrome run.

8. **Temporary removal of Hastings. Answered.** Acceptable, provided Hastings is restored afterwards through
   `absentFavourites`. Separately, the existing `createAndAmendFavourites.spec.ts` cleanup removes Plymouth and
   Lowestoft unconditionally. That deviation predates this plan and is outside its scope.
9. **Welsh journey. Answered.** Welsh is in scope. Because Welsh copy is absent from the journey pages, it is planned
   as a blocked `test.fixme` and is not dropped.
10. **First-time entry. Answered.** Out of scope (it needs an account with no saved ports).
11. **Live authenticated verification. Delegated.** The Spec Author's signed-in Chrome run confirms items 4–7 and 9.
    No credentials were requested or entered during planning.
12. **One spec with nested `test.describe` blocks. Answered: exception accepted.** The user explicitly chose one spec
    file with two `test.describe` blocks (nested under one outer Feature block, one per Gherkin `Rule`). This is a
    recorded exception to the instructions rule (Spec structure) that each group goes in its own spec file with a
    single top-level `test.describe`. Approved by @hehemasr_CGEMU on 2026-11-24.
13. **Position of the "Add port" link. Answered.** The link must sit **below** the port options. Scenarios 1 and 2 add
    the step "The "Add port" link is displayed below the port options". It calls the new page-object method
    `PortSelectionPage.isAddPortLinkBelowPortOptions()`, which checks that the link's top is at or below the bottom of
    the last port radio, through `expect.poll`. **Spec Author: verify live.**

### Spec Author instructions

- **Implementation from the approved plan.** The current spec is
  `tests/ui/port-selection/addPortFunctionality.spec.ts`, with the shared page-object, flow and fixture updates in
  `pages/basePage.ts`, `tests/ui/helpers/catchRecordFlow.ts` and `fixtures/commonfixture.ts`.
  - Keep `addPortFunctionality.spec.ts` aligned with the Proposed spec.
  - Delete `addAnotherPort.spec.ts`.
  - Keep the flow and fixture changes, which match this plan unchanged. In `pages/basePage.ts`, retain `portRadios` and
    `isAddPortLinkBelowPortOptions()` (OQ-13).
- **"Add port" link position (OQ-13).** Verify live on both radio screens that the link's top is at or below the
  bottom of the last port radio, and that `getByRole('radio')` matches only the port radios.
  - If the check fails because the live layout differs, keep the assertion. Mark the test `test.fixme` with the
    observed positions and report a deviation.
  - Do not loosen the comparison and do not swap in a different element.
- **Verification.** Verify OQ-4, OQ-5, OQ-6 and OQ-7 in the signed-in Chrome run against `test`.
  - If an item cannot be confirmed, implement that test with `test.fixme` and a comment giving the OQ number, what
    was observed and why it could not be confirmed.
  - Never weaken an assertion: no looser locators, regexes, `.or()` fallbacks or dropped steps.
  - If the live app shows different but definitive copy or a different target, report it as a deviation for plan
    revision. Do not change the expected value silently.
- **Welsh (OQ-9).** Check both port screens after selecting Cymraeg.
  - Welsh copy present: change `test.fixme` to `test`, assert the observed Welsh heading as a typed constant, and
    record the evidence.
  - Welsh copy absent: keep `test.fixme` with the OQ-9 reason.
  - If the language preference persists beyond the browser context, switch back to English at the end of the test.
- **Cleanup.** Use only `createdRecords` / `deleteCreatedDrafts`. Never delete all drafts. Make sure Hastings and any
  favourites added by the fixture are restored.
- **Results.** Record every outcome in the Implementation record.

## Approval

| Approved by     | Date                                                   |
| --------------- | ------------------------------------------------------ |
| @hehemasr_CGEMU | 2026-11-24 (superseded: revision requested 2026-11-24) |
| @hehemasr_CGEMU | 2026-11-24 (revised plan re-approved)                  |

## Change log

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-24 | Draft plan created.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-11-24 | Applied the approver's answers. OQ-1: ticket TBC. OQ-2: favourites; AC14 reworked to use the saved favourite Plymouth and moved to `selectPreviouslyUsedPort.spec.ts`. OQ-3: link confirmed. OQ-8: Hastings removal and restore accepted. OQ-9: Welsh added as a blocked `test.fixme` outline. OQ-10: first-time entry out of scope. OQ-4–OQ-7 accepted as UNVERIFIED for the Spec Author to verify. Removed the `navigationFlow` change.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-11-24 | Approved by @hehemasr_CGEMU.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-11-24 | Revision requested by the user: the Add port journey is the main focus. Merged `addAnotherPort.spec.ts` into `selectPreviouslyUsedPort.spec.ts` (one Feature, two nested `test.describe` blocks as Gherkin `Rule`s, each with its own `test.use`; `addAnotherPort.spec.ts` to be deleted). Scenarios 1–2 now check, on each radio screen, the saved ports → "Add port" link on the same screen → Add port screen → search and select Hastings → recorded and the journey continues. AC1/AC5 display checks folded into Scenarios 1–2, and the separate display-only scenarios removed. Added the scenario-to-AC mapping table and a "Not in scope / possible follow-ups" list (Add port validation, partial search, Back from Add port, same port through Add port). Added OQ-12 (single-spec exception to the instructions) and OQ-13 ("alongside"). Status set back to Draft. |
| 2026-11-24 | Applied the re-approval answers. OQ-12: single-spec exception accepted and recorded. OQ-13: the "Add port" link must sit below the port options; added the step "The "Add port" link is displayed below the port options" to Scenarios 1 and 2 (step mapping renumbered), with the new page-object method `PortSelectionPage.isAddPortLinkBelowPortOptions()` and locator `portRadios`, marked for live verification.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-11-24 | Revised plan approved by @hehemasr_CGEMU.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-11-24 | Renamed the single spec to `addPortFunctionality.spec.ts` at the user's request; scenario content and approved scope are unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-11-24 | Ticket key confirmed as CRAR-422; updated the plan and spec traceability references.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Implementation record

_Completed by the Playwright BDD Spec Author._
