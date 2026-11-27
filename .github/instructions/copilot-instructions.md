# Copilot instructions: mmo-cr-frontend-tests

Playwright + TypeScript E2E tests for Record Your Catch (MMO catch recording). Conventions: [playwright-tests.instructions.md](playwright-tests.instructions.md).

## Routing BDD & acceptance criteria

Treat a message as BDD input if it contains Gherkin keywords (`Feature:`, `Background:`, `Rule:`, `Scenario:`, `Scenario Outline:`, `Examples:`, `Given`, `When`, `Then`, `And`, `But`), acceptance criteria (`AC1`, `Acceptance criteria`, `As a … I want … so that …`, numbered expected behaviours), or a `CRAR-<number>` key with requirement text.

Do not write specs directly from BDD input (unless already inside the Planner/Author agent, or the user is only asking a question about Gherkin):

1. **Plan:** Delegate raw input (+ CRAR key/context) to **Playwright BDD Test Planner** (or follow [bdd-test-planner.agent.md](../agents/bdd-test-planner.agent.md)).
2. **Present:** Show plan path in `test-cases/`, summary, and open questions/`UNVERIFIED` items; ask for approval and stop.
3. **Revise:** Delegate requested changes + plan path to Planner; repeat step 2.
4. **Approve:** On explicit user approval, delegate to Planner to mark `Approved` with approver and date.
5. **Implement:** Delegate approved plan path to **Playwright BDD Spec Author** (or follow [bdd-test-author.agent.md](../agents/bdd-test-author.agent.md)). Report changed files, checks, and conformance; return to step 3 if deviations occur.

Never skip approval, self-approve, or create specs without an `Approved` plan in `test-cases/`.
