# Copilot instructions: mmo-cr-frontend-tests

Playwright + TypeScript end-to-end tests for the Record Your Catch (MMO catch recording) external web frontend. Test conventions are in [playwright-tests.instructions.md](playwright-tests.instructions.md).

## Automatic routing of BDD and acceptance criteria

Before answering any message, check whether it contains test requirements. Treat it as BDD input when it contains any of:

- Gherkin keywords at the start of lines: `Feature:`, `Background:`, `Rule:`, `Scenario:`, `Scenario Outline:`, `Examples:`, `Given`, `When`, `Then`, `And`, `But`
- Acceptance criteria: lines such as `AC1`, `Acceptance criteria`, `As a … I want … so that …`, or a numbered list of expected behaviours
- A Jira key `CRAR-<number>` together with a story or requirement text

When BDD input is detected, do not write a spec directly. Route it as follows:

1. **Plan.** Delegate the full pasted text, unchanged, plus any CRAR key and extra context from the user, to the **Playwright BDD Test Planner** custom agent as a subagent. If subagents are unavailable, follow [bdd-test-planner.agent.md](../agents/bdd-test-planner.agent.md) yourself.
2. **Present for approval.** Show the user the plan file path in `test-cases/`, the summary, and any open questions or `UNVERIFIED` items. Ask them to approve or request changes, then stop.
3. **Revise.** If the user requests changes, delegate them with the plan path to the **Playwright BDD Test Planner** again, then repeat step 2.
4. **Approve.** When the user explicitly approves, delegate to the **Playwright BDD Test Planner** to mark the plan `Approved` with the approver and date.
5. **Implement and verify.** Delegate the approved plan path to the **Playwright BDD Spec Author** custom agent (or follow [bdd-test-author.agent.md](../agents/bdd-test-author.agent.md) yourself). Report the files changed, the checks run and the plan conformance result. If deviations are found, return to step 3.

Never skip the approval gate, never mark a plan approved on the user's behalf, and never create specs from BDD that has no approved plan in `test-cases/`.

This routing does not apply when the user is already using the Planner or Spec Author agent, or when they mention Gherkin only to ask a question about it rather than to request tests.
