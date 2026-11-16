---
description: 'Record Your Catch Playwright test conventions: team rules, spec structure, Gherkin-to-test.step mapping, test data and constraints. Used by the BDD planner and spec author agents.'
applyTo: 'tests/**/*.ts,pages/**/*.ts,fixtures/**/*.ts,services/**/*.ts,test-cases/**/*.md'
---

# Record Your Catch Playwright test conventions

This repository is the Playwright + TypeScript end-to-end suite for the Record Your Catch (MMO catch recording) external web frontend and its API. Cucumber is not used: a Gherkin Scenario becomes a Playwright `test`, and each Given/When/Then/And/But statement becomes its own `test.step`.

## Testing strategy: AI-assisted, human-approved

These agents support the Record Your Catch shift-left strategy, where tests start from the Jira ticket (`CRAR-<number>`), not after the code. The strategy follows the DEFRA Quality Assurance & Software Development Standards and the GDS Service Manual. **AI drafts and humans approve**: each stage below ends at a human gate, and you never pass a gate on the user's behalf.

| Stage            | Your role (AI draft)                                                                                                                                                                    | Human gate (stop and wait)                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1 Requirement    | Read the CRAR acceptance criteria (AC) the user supplies; flag any AC that is ambiguous, contradicts existing specs or the live app, or is not testable through the web UI or API       | PO confirms the AC are testable                                                          |
| 2 BDD scenarios  | Draft Given/When/Then scenarios from the AC, including error and edge cases and, where the page supports it, the Welsh (`Cymraeg`) journey                                              | QA / PO review the scenarios                                                             |
| 3 E2E automation | Turn the approved scenarios into Playwright specs in `tests/ui` or `tests/api`, with page objects in `pages/`, flows in `tests/ui/helpers/` and fixtures in `fixtures/commonfixture.ts` | QA runs the specs against the `dev`/`test` environment and confirms them on the live app |
| 4 PR checks      | Leave changes passing `npm run format:check` and `npm run lint` on a `feature/CRAR-<number>_<description>` branch                                                                       | A human reviews, approves and merges the PR                                              |

Agents: the **Playwright BDD Test Planner** covers stages 1–2 and writes the plan for stage 3 to `test-cases/<ticket>_<description>.md`; the **Playwright BDD Spec Author** implements an approved plan (stage 3) and records the plan conformance check in that file.

Scope: this repository is the end-to-end layer for the external web frontend and its API. Automate critical user journeys and AC that need a deployed environment. Leave exhaustive field-level validation permutations to the application repository's unit and component tests unless the AC needs them checked end to end.

PR checks (`.github/workflows/check-pull-request.yml`):

- The branch name must match `feature/CRAR-<number>_<description>`.
- `npm run format:check` (Prettier) and `npm run lint` (`tsc --noEmit`) must pass; Husky runs the pre-commit hook locally.
- Only the branch-name, format and lint checks run on pull requests (the UI/API test jobs in `check-pull-request.yml` are commented out). UI and API journey tests run separately against CDP environments through `.github/workflows/journey-tests.yml` / `run-journey-tests`, with Allure reporting, so QA must run new specs before merge. Specs must pass with `workers: 1` and must not depend on the order tests run in.
- A human code review is required before merge.

Team rules (non-negotiable):

- **AI drafts → humans approve.** Plan first in a `test-cases/` Markdown file; write specs only after the plan is explicitly approved.
- **Tests ship with the ticket.** Keep each spec traceable to its CRAR ticket; put the ticket key in the JSDoc header when the user provides it.
- **Real test data only, never invented.** Use data confirmed by existing specs or the live app; if none exists, ask the user.
- **Stable selectors only.** Use `getByRole`, `getByLabel` or `getByTestId` (`data-testid`) first, then GOV.UK Frontend classes. Never use positional or brittle CSS selectors.
- **Accessibility.** Prefer role and label locators so specs also check accessible names; flag anything that blocks this, such as a missing label, as an accessibility issue (WCAG 2.2 AA).
- **No secrets in prompts or code.** Credentials come only from `.env` (`CATCH_RECORDING_EMAIL` / `CATCH_RECORDING_PASSWORD`); never request, echo or store them.
- **AI never merges or releases.** Do not commit, push, open or merge PRs, or trigger workflows unless the user explicitly asks; approval and merging stay with a human.

## Stack and repository conventions

- Playwright Test (`@playwright/test`) + TypeScript (CommonJS, `tsc --noEmit` for type checks) + Allure (`allure-playwright`) and the HTML reporter. Prettier formatting enforced via Husky pre-commit.
- Projects in `playwright.config.ts`: `Chromium`, `Chrome`, `Edge`, `Firefox`, `Safari` (all use `tests/ui`) and `api` (uses `tests/api`). `workers: 1`, `fullyParallel: false`.
- `baseURL` is derived from `CATCH_RECORDING_ENV` (`dev` | `test` | `prod`, default `test`); always navigate with relative paths (e.g. `goto('/account')`).
- UI specs live in feature folders under `tests/ui/<feature-name>/` (kebab-case folder, camelCase file name, e.g. `tests/ui/species/catchWeightEntry.spec.ts`). Top-level specs exist for older features; prefer a feature folder for new work. When a feature needs more than one `test.describe` group (e.g. form, information panel, error scenarios), create the feature folder and put each group in its own spec file with a single top-level `test.describe`, rather than nesting several groups in one file (e.g. `tests/ui/sign-in/signInForm.spec.ts`, `createAccountPanel.spec.ts`, `signInErrors.spec.ts`).
- Specs import `test` and `expect` from `fixtures/commonfixture.ts`, never directly from `@playwright/test`.
- Page objects live in `pages/`, extend `BasePage` (or `DateInputPage` / `PortSelectionPage`) from `pages/basePage.ts`, take a `Page` in the constructor, and expose locators as arrow functions returning `Locator` (e.g. `pageHeading = (): Locator => ...`) plus async action methods. New page objects must be registered as fixtures in `fixtures/commonfixture.ts`.
- Page-object classes, like spec files, require a short JSDoc header. Follow the header and Git-history metadata rules in Spec structure.
- Reusable journeys live in `tests/ui/helpers/` (`NavigationFlow`, `GearFlow`, `SpeciesFlow`, `FavouritesFlow`, `MapFlow`) and are injected as fixtures (`navigationFlow`, `gearFlow`, etc.). Only use methods that currently exist; read the helper before calling it.
- API clients live in `services/` (extend `baseApi.ts`) and are exposed as fixtures (e.g. `healthApi`).
- `BasePage` already provides shared helpers (`goto`, `clickSaveAndContinue`, `expectTitle`, `expectUrl`, `acceptCookies`, `tabUntilFocused`, `common.backLink()`, `header`, `footer`). Reuse them instead of duplicating.
- Selectors follow GOV.UK Frontend conventions used in existing page objects: prefer `getByRole`, `getByLabel`, `getByTestId`, then GOV.UK classes (e.g. `.govuk-error-summary`). Never guess a selector, label, or test id.

## Spec structure

Convert Gherkin to plain Playwright tests (no Cucumber, no step definitions):

Given this input:

```gherkin
Feature: Favourite ports
  Background:
    Given I am signed in and on the account page

  Scenario: Save a port found by partial name as a favourite
    When I click "Add port"
    And I search for "Plym" and select "Plymouth"
    And I click "Save and continue"
    Then I am returned to the account page
    And "Plymouth" is shown in Ports used
```

Produce:

```ts
import { expect, test } from '../../../fixtures/commonfixture';

const portSearchTerm = 'Plym';
const favouritePort = 'Plymouth';

test.describe('Favourite ports', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await test.step('I am signed in and on the account page', async () => {
      await navigationFlow.signInAndOpenAccount();
    });
  });

  test(
    'Save a port found by partial name as a favourite',
    { tag: ['@ui', '@regression', '@favouritePorts'] },
    async ({ accountPage, addPortPage }) => {
      await test.step('I click "Add port"', async () => {
        await accountPage.addPortLink().click();
      });

      await test.step('I search for "Plym" and select "Plymouth"', async () => {
        await addPortPage.searchPorts(portSearchTerm);
        await addPortPage
          .portResultItem(favouritePort)
          .getByRole('option', { name: favouritePort, exact: true })
          .click();
      });

      await test.step('I click "Save and continue"', async () => {
        await addPortPage.clickSaveAndContinue();
      });

      await test.step('I am returned to the account page', async () => {
        await accountPage.expectUrl(/\/account$/);
      });

      await test.step('"Plymouth" is shown in Ports used', async () => {
        await expect(accountPage.portsUsedValue()).toContainText(favouritePort);
      });
    }
  );
});
```

Mapping rules:

- `Feature` -> outer `test.describe` using the feature title; `Rule` or logical grouping -> nested `test.describe`.
- Spec files and page-object classes start with a short JSDoc header: a 1–3 line summary of their purpose, `@author`, and `@since` in `YYYY-MM-DD` format. For a new file, use `git config user.name` and the creation date. If an existing file is missing a header, use the author and date from its original Git addition commit, not the date the header is added. Include the CRAR key in a spec header when the user provides one.
- `Scenario` statement -> the `test` name, copied verbatim from the scenario title (without the `Scenario:` prefix or any acceptance-criteria label such as `AC1:`).
- Each `Given` / `When` / `Then` / `And` / `But` statement -> one `test.step`, titled with the statement text without the Gherkin keyword (capitalise the first word, e.g. `And the user confirms` -> `The user confirms`). Keep the original order and do not merge or split statements.
- `Background` -> `test.beforeEach`, with each Background statement as its own `test.step`.
- `Scenario Outline` / `Examples` -> a `for ... of` loop over a typed data array generating one `test` per row; substitute `<placeholders>` with row values in both the test name and step titles so names stay unique.
- Assertions belong in `Then` steps; `Given`/`When` steps perform setup and actions only. Built-in synchronisation checks inside existing page-object or flow methods (e.g. `searchAndSelectPort`) are acceptable in `Given`/`When` steps; do not add new explicit assertions there.
- Tags: always include `@ui` (or `@api`), one of `@smoke` / `@regression`, and a camelCase feature tag. Reuse an existing feature tag when one already covers the area, and use correct spelling; flag any misspelt tag instead of copying it.

## Test data and environment

- Sign in via `navigationFlow.signIn()` / `signInAndOpenAccount()`, which read `CATCH_RECORDING_EMAIL` / `CATCH_RECORDING_PASSWORD` from `.env`. Never place credentials in code, logs, or chat, and never print `.env` contents.
- Use only test data already in existing specs or confirmed in the live app (e.g. `Cod (COD)`, `Plymouth`).
- Declare test data as typed constants at the top of the spec (e.g. `const cod: SpeciesData = { name: 'Cod (COD)', code: 'COD', weight: '100' };`) and reference them in steps; no hardcoded names, codes, or values inside test bodies.
- For date entry use the `DateInputPage` helpers and compute dates at runtime from `new Date()`.
- Use `test.fixme('<reason>')` only when implementation is intentionally incomplete (e.g. a blocked selector).

## Playwright MCP tools

- Open a browser only to verify a new locator, page flow, or error message; never for scenarios already covered by existing page objects.
- Prefer accessibility snapshots over screenshots; confirm roles and accessible names match what `getByRole` / `getByLabel` will resolve.
- Do not enter credentials via MCP tools. For authenticated pages, ask the user to sign in in the MCP browser or provide the page markup.
- Close any browser you opened.

## Constraints

- No spec, page-object, flow-helper or fixture changes before the plan file is approved.
- No Cucumber, `playwright-bdd`, `.feature` files, or step definitions.
- Specs import `test` / `expect` from `fixtures/commonfixture.ts` and contain no raw `page.locator(...)` / `page.getBy...` calls.
- No fabricated test data, selectors, credentials, URLs, or helper methods.
- No `waitForTimeout` or sleeps; rely on auto-waiting and web-first `expect` assertions.
- No `test.only` (CI sets `forbidOnly`).
