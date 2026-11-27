import { type Locator } from '@playwright/test';
import { BasePage, escapeRegExp } from './basePage';

/**
 * Review a catch record before submission.
 * Check summary details, change answers, read the declaration warning and submit the record.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class CheckAnswersPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Check your details', exact: true });

  // Shown instead of "Check your details" when reviewing changes to a submitted record
  public readonly amendmentHeading = (vesselName: string): Locator =>
    this.page.getByRole('heading', { level: 1, name: `Edit catch record for ${vesselName}` });

  public readonly summaryRow = (key: string): Locator => this.summaryRowIn(this.page.locator('main'), key);

  public readonly summaryValue = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__value');

  public readonly changeLink = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__actions a');

  // Accessible names add hidden context, e.g. "Change Change Date returned"; getByRole matches substrings
  public readonly changeLinkNamed = (accessibleName: string): Locator =>
    this.page.getByRole('link', { name: accessibleName });

  public readonly sectionHeading = (name: string): Locator =>
    this.page.getByRole('heading', { level: 2, name, exact: true });

  public readonly gearSection = (gearName: string): Locator =>
    this.page.getByRole('region', { name: gearName, exact: true });

  public readonly gearSummaryValue = (gearName: string, key: string): Locator =>
    this.summaryValueIn(this.gearSection(gearName), key);

  // Species regions share the species name, so narrow them by the gear named in their weight change links
  public readonly speciesSection = (speciesName: string, gearName: string): Locator =>
    this.page.getByRole('region', { name: speciesName, exact: true }).filter({
      has: this.page.getByRole('link', {
        name: new RegExp(`^Change weight .* for ${escapeRegExp(speciesName)}, ${escapeRegExp(gearName)}$`)
      })
    });

  public readonly speciesSummaryValue = (speciesName: string, gearName: string, key: string): Locator =>
    this.summaryValueIn(this.speciesSection(speciesName, gearName), key);

  public readonly notLandedSummary = (): Locator =>
    this.page.locator('.govuk-summary-list').filter({
      has: this.page.locator('.govuk-summary-list__key', { hasText: 'Catch kept onboard or in keep pots' })
    });

  public readonly notLandedValue = (key: string): Locator => this.summaryValueIn(this.notLandedSummary(), key);

  public readonly declarationWarning = (): Locator => this.page.locator('.govuk-warning-text');

  public readonly submitButton = (): Locator =>
    this.page.getByRole('button', { name: 'Accept and submit trip details' });

  async getSummaryValueText(key: string): Promise<string> {
    const text = await this.summaryValue(key).textContent();
    return text ? text.trim() : '';
  }

  async clickChangeLinkFor(key: string) {
    await this.changeLink(key).click();
  }

  async clickAcceptAndSubmit() {
    await this.submitButton().click();
  }
}
