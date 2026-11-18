# Trip date validation — draft test plan

**Status:** Approved for implementation  
**Source:** User-provided trip-date validation story, business rules and AC1–AC9  
**Ticket:** Not provided  
**Automation scope:** Playwright UI journey tests for the Record Your Catch web frontend

**Approval:** The user approved this plan in Copilot chat on 2026-11-17.

## User story

As a catch-recording user, I want the service to validate the trip start date and trip duration, so that trips outside the permitted reporting period or exceeding the maximum permitted duration cannot be recorded.

## Business rules

1. The trip start date must not be in the future.
2. The trip start date must not be more than 365 days before the date of entry.
3. The trip end date must be the same as or later than the trip start date.
4. The trip length must not exceed 30 days.
5. The 365-day backdating rule and 30-day maximum trip-length rule are separate validations.

## Scenarios for approval

### Scenario 1: Accept a valid trip (AC1)

- **Given** the trip start date is not in the future
- **And** the trip start date is no more than 365 days before the date of entry
- **And** the trip end date is the same as or later than the trip start date
- **And** the trip length does not exceed 30 days
- **When** the user continues
- **Then** the trip dates are accepted
- **And** the user is allowed to proceed

**Test data:** Use a start date within the permitted reporting period and a non-future end date on or after the start, no more than 30 days later.

### Scenario 2: Reject a trip start date more than 365 days ago (AC2)

- **Given** the trip start date is more than 365 days before the date of entry
- **When** the user continues
- **Then** progression is prevented
- **And** a validation message explains that the trip start date cannot be more than 365 days in the past

**Test data:** Set the start date to 366 calendar days before the date of entry; keep the end date on or after the start and within the maximum trip length.

### Scenario 3: Reject a trip longer than 30 days (AC3)

- **Given** the trip length exceeds 30 days
- **When** the user continues
- **Then** progression is prevented
- **And** a validation message explains that the trip cannot exceed 30 days

**Test data:** Set start and end dates 31 calendar days apart, with the start date within the 365-day reporting period and the end date not in the future. This must fail the duration rule independently of the backdating rule.

### Scenario 4: Reject an end date before the start date (AC4)

- **Given** the trip end date is earlier than the trip start date
- **When** the user continues
- **Then** progression is prevented
- **And** a validation message explains that the trip end date cannot be before the trip start date

**Test data:** Use two dates within the permitted reporting period, with the end date one day before the start date.

### Scenario 5: Reject a future trip start date (AC5)

- **Given** the trip start date is in the future
- **When** the user continues
- **Then** progression is prevented
- **And** a validation message explains that the trip start date cannot be in the future

**Test data:** Set both dates to the same future date so the ordering and duration checks do not obscure the future-start validation.

### Scenario 6: Accept the 365-day boundary (AC6)

- **Given** the trip start date is exactly 365 days before the date of entry
- **And** all other trip date validations are satisfied
- **When** the user continues
- **Then** the trip dates are accepted

**Test data:** Set the start date to the exact 365-day boundary and use a same-day end date.

### Scenario 7: Accept the 30-day boundary (AC7)

- **Given** the trip length is exactly 30 days
- **And** all other trip date validations are satisfied
- **When** the user continues
- **Then** the trip dates are accepted

**Test data:** Use a start date within the reporting period and an end date exactly 30 days after it, with neither date in the future.

### Scenario 8: Accept a same-day trip (AC8)

- **Given** the trip start date and trip end date are the same date
- **And** all other trip date validations are satisfied
- **When** the user continues
- **Then** the trip dates are accepted

**Test data:** Use a date within the permitted reporting period and not in the future for both trip dates.

### Scenario 9: Reject a future trip end date (AC9)

- **Given** the trip end date is in the future
- **When** the user continues
- **Then** progression is prevented
- **And** a validation message explains that the trip end date cannot be in the future

**Test data:** Use the date of entry as the start date and the next calendar day as the end date. The trip length and start-date checks should otherwise pass.

## Verification points

- For accepted trips, verify that the journey advances past the trip-date entry flow.
- For rejected trips, verify that the user remains on the relevant date-entry step, progression is blocked, and the corresponding validation is exposed to the user.
- For each rejection, verify the validation corresponds to the targeted rule. The 366-day scenario must not be a duration violation, and the 31-day scenario must not also violate the 365-day rule.
- Check that the validation is accessible through the rendered error summary and associated with the relevant date input.
- For AC2, AC3 and AC4, assert that the message communicates the rule described in the AC; exact copy is not part of the acceptance criteria.
- The test environment currently displays these exact future-date messages:
  - Start date: `Date you left for your trip must be today or in the past`
  - End date: `Date you returned from your trip must be today or in the past`

## Test data and implementation notes

- Compute dates at runtime relative to the date of entry; do not hardcode calendar dates.
- Keep each invalid scenario within the other rules' allowed values wherever possible, so a failure identifies the intended validation.
- For the 30-day boundary, use dates exactly 30 calendar days apart; this is the approved interpretation of “trip length” for these scenarios. AC8 establishes that equal start and end dates are valid.
- The journey treats the date of entry as the current date in the running service, using date-only calendar values.
- The repository already has `TripDatePage`, `TripDepartureDatePage`, and `TripReturnDatePage` page objects and registered fixtures. `DateInputPage.enterDate(day, month, year)` is available for date entry.
- Confirmed journey: create a record, select a vessel, choose “No” on `/trip-date`, enter the start date at `/trip-departure-date`, then enter the end date at `/trip-return-date`.
- Confirmed stable accessible controls: “Yes” / “No” radios, “Save and continue” button, and Day / Month / Year textboxes.
- The rendered validation summary is exposed as an alert with a “There is a problem” heading and a link to the field error. Use role-based locators for the alert and its link.
- The date pages expose a Cymraeg language link. The supplied ACs are in English; this plan does not add translated acceptance scenarios.
- Use the repository's configured test account via the existing sign-in flow and environment variables. Do not include credentials in the plan or spec.

## Approved interpretation

AC9 explicitly requires rejecting a future end date and is included even though the business-rules list does not separately state that restriction. Validation tests assert the AC's stated meaning without inventing exact wording for AC2–AC4.

## Proposed implementation

- **Target spec:** `tests/ui/trip-dates/tripDateValidation.spec.ts`
- **Existing fixtures/page objects:** `navigationFlow`, `recordsPage`, `selectVesselPage`, `tripDatePage`, `tripDepartureDatePage`, `tripReturnDatePage`
- **Tags:** `@ui`, `@regression`, `@tripDateValidation`
- **Test data:** Runtime dates relative to the date of entry; one confirmed vessel selected from the user's configured test account; no fixed calendar dates.
- **Step mapping:** Each Given / When / Then / And statement above maps to one `test.step`, keeping the original order. Sign-in and record creation are setup steps; validation and progression checks are Then steps.

## Conformance check

The spec covers AC1–AC9 as individual Playwright tests, with each Gherkin statement represented by a `test.step`. It uses runtime date offsets, the existing sign-in and vessel-selection fixtures, and role-based date/error-summary locators. The exact future-date messages were verified in the test environment; AC2–AC4 assert the rule described by the acceptance criteria because their exact wording is unspecified.

**Validation:** `npm run lint`, targeted Prettier check, and Playwright test discovery passed. The full UI journey was not run because the test environment stopped resolving its hostname during inspection.
