---
description: 'Record Your Catch Playwright test conventions: team rules, spec structure, Gherkin-to-test.step mapping, test data and constraints. Used by the BDD planner and spec author agents.'
applyTo: 'tests/**/*.ts,pages/**/*.ts,fixtures/**/*.ts,services/**/*.ts,test-data/**/*.ts,test-cases/**/*.md'
---

# Record Your Catch Playwright test conventions

Playwright + TypeScript E2E suite for Record Your Catch (external web frontend + API). No Cucumber: each `Scenario` is a `test`, and each `Given`/`When`/`Then`/`And`/`But` is a `test.step`.

## Workflow & human gates

Follow shift-left stages (AI drafts, human approves — never pass a gate on the user's behalf):

1. **Requirement:** Planner flags ambiguous, contradictory, or untestable AC (leave exhaustive field-level validation to app unit/component tests unless AC requires E2E).
2. **BDD & Plan:** Planner drafts Given/When/Then (including error/edge cases and `Cymraeg` where supported) and writes `test-cases/CRAR-<number>_<kebab-description>.md` → human approves.
3. **Automation:** Spec Author implements the approved plan → QA verifies on `dev`/`test`.
4. **PR checks (`.github/workflows/check-pull-request.yml`):** Branch `feature/CRAR-<number>_<description>`, `npm run format:check`, `npm run lint` (`tsc --noEmit`) → human reviews and merges. Tests run via `journey-tests.yml` with `workers: 1` and must be order-independent.

## Repository conventions

- **Stack:** `@playwright/test` + TypeScript (CommonJS), `allure-playwright` + HTML reporter, Prettier via Husky pre-commit. Projects: `Chrome`, `Edge`, `Firefox`, `Safari` (`tests/ui`), `api` (`tests/api`). `workers: 1`, `fullyParallel: false`.
- **Paths & structure:** `baseURL` comes from `CATCH_RECORDING_ENV` (`dev`|`test`|`prod`, default `test`). UI specs go under `tests/ui/<kebab-feature>/<camelCase>.spec.ts` with one top-level `test.describe` per file (split multi-group features into separate files).
- **Imports & fixtures:** Specs must import `test` and `expect` from `fixtures/commonfixture.ts` (never `@playwright/test`) and contain no raw `page.locator` / `page.getBy*` calls.
- **Page objects (`pages/`):** Extend `BasePage` (or `DateInputPage` / `PortSelectionPage` in `pages/basePage.ts`), take `Page` in constructor, expose locators as arrow functions returning `Locator`, implement unique `pageHeading` (role + accessible name, not `app-heading-title`), and register in `fixtures/commonfixture.ts`. Reuse `BasePage` helpers (`goto`, `clickSaveAndContinue`, `expectTitle`, `expectOnPage`, `acceptCookies`, `tabUntilFocused`, `common`, `header`, `footer`).
- **API clients (`services/`):** Extend `baseApi.ts` and register in `fixtures/commonfixture.ts`.
- **Navigation & flows (`tests/ui/helpers/`):** Use existing flow fixtures (`navigationFlow`, `gearFlow`, `speciesFlow`, `favouritesFlow`, `mapFlow`, `catchRecordFlow`); read helpers before calling. Never call `.goto()` directly in specs (start with `navigationFlow.openHomePage()` / `openSignIn()`, or add a helper method in the plan).
- **Session & cleanup:** Catch-record tests needing saved favourites use `createdRecords` with `test.use({ testFavourites })` (and `absentFavourites` if needed) on `test.describe`, requesting `createdRecords` in each test and pushing created draft references.
- **Waits & assertions:** Rely on locator auto-waiting and web-first `expect`; no `waitForTimeout`, sleeps, or redundant `waitForLoadState()` calls. Prove page transitions via `expectOnPage()` or a context heading—never `expectUrl` / `toHaveURL`.
- **Selectors & accessibility:** Prefer `getByRole`, `getByLabel`, `getByTestId`, then GOV.UK classes (`.govuk-error-summary`). Never invent selectors; flag missing labels/roles as WCAG 2.2 AA issues.

## Spec structure & Gherkin mapping

- **JSDoc header (specs & page objects):** 1–3 line summary, `@author`, `@since YYYY-MM-DD`, plus CRAR key in specs when provided. New files use `git config user.name` and today's date; existing files missing a header use their original Git addition commit author/date.
- **Mapping:** `Feature` → outer `test.describe`; `Rule` → nested `test.describe`; `Background` → `test.beforeEach` with `test.step` per line; `Scenario` → `test` title verbatim (strip `Scenario:` / `AC1:`); `Scenario Outline` → `for ... of` over typed array substituting `<placeholders>` in test/step titles.
- **Steps & assertions:** One `test.step` per `Given`/`When`/`Then`/`And`/`But` in order (strip keyword, capitalise first word; never merge/split). Explicit assertions belong only in `Then` steps (built-in sync checks inside page/flow methods are fine). Pass a descriptive message as the 2nd arg to every `expect` (except `expect.poll`), interpolating simple expected variables.
- **Tags:** `{ tag: ['@ui' | '@api', '@smoke' | '@regression', '@camelCaseFeature'] }` (reuse existing feature tags; flag typos).

## Test data, MCP & constraints

- **Test data (`test-data/testData.ts`):** Never hardcode or invent data. Reference exports directly (`vessels`, `ports`, `gears`, `catchSpecies`, `areas`, `checkAnswers`, `recordStatuses`, `errorMessages`, `signInData`); spec constants are only for composed `Favourites`, `Scenario Outline` tables, `RegExp`, or `daysAgo` dates. `AccountPage` helpers default `vesselName` to `vessels.testVessel`. Use `DateInputPage` + `new Date()` for dates. Use `test.fixme('<reason>')` only for intentionally incomplete items.
- **Credentials:** `navigationFlow.signIn()` reads `CATCH_RECORDING_EMAIL` / `CATCH_RECORDING_PASSWORD` from `.env`. Never request, print, or store secrets.
- **Playwright MCP:** Open browser only to verify unmapped locators/flows/errors; prefer accessibility snapshots over screenshots; never enter credentials via MCP; close browser when done.
- **Hard limits:** No code changes before plan approval; no unused imports/variables/types/params (`npx tsc --noEmit --noUnusedLocals --noUnusedParameters`); no `test.only`; never commit, push, merge, or trigger workflows unless asked.
