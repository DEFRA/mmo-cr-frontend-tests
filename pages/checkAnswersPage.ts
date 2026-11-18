import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Review a catch record before submission.
 * Check summary details, change answers, confirm the declaration and submit the record.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class CheckAnswersPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Check your catch record', exact: true });

  public readonly summaryRow = (key: string): Locator =>
    this.page.locator('.govuk-summary-list__row').filter({
      has: this.page.locator('.govuk-summary-list__key', { hasText: key })
    });

  public readonly summaryValue = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__value');

  public readonly changeLink = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__actions a');

  // Accessible names add hidden context, e.g. "Change return date"
  public readonly changeLinkNamed = (accessibleName: string): Locator =>
    this.page.getByRole('link', { name: accessibleName });

  public readonly sectionHeading = (name: string): Locator =>
    this.page.getByRole('heading', { level: 2, name, exact: true });

  public readonly gearSection = (gearName: string): Locator =>
    this.page.getByRole('region', { name: gearName, exact: true });

  public readonly gearSummaryValue = (gearName: string, key: string): Locator =>
    this.gearSection(gearName)
      .locator('.govuk-summary-list__row')
      .filter({ has: this.page.locator('.govuk-summary-list__key', { hasText: key }) })
      .locator('.govuk-summary-list__value');

  // Species regions share the species name, so narrow them by the gear named in their change links
  public readonly speciesSection = (speciesName: string, gearName: string): Locator =>
    this.page
      .getByRole('region', { name: speciesName, exact: true })
      .filter({ has: this.page.getByRole('link', { name: `${speciesName}, ${gearName}` }) });

  public readonly speciesSummaryValue = (speciesName: string, gearName: string, key: string): Locator =>
    this.speciesSection(speciesName, gearName)
      .locator('.govuk-summary-list__row')
      .filter({ has: this.page.locator('.govuk-summary-list__key', { hasText: key }) })
      .locator('.govuk-summary-list__value');

  public readonly notLandedSummary = (): Locator =>
    this.page
      .locator('.govuk-summary-list')
      .filter({ has: this.page.locator('.govuk-summary-list__key', { hasText: 'Not landed' }) });

  public readonly notLandedValue = (key: string): Locator =>
    this.notLandedSummary()
      .locator('.govuk-summary-list__row')
      .filter({ has: this.page.locator('.govuk-summary-list__key', { hasText: key }) })
      .locator('.govuk-summary-list__value');

  public readonly declarationWarning = (): Locator => this.page.locator('.govuk-warning-text');

  public readonly declarationCheckbox = (): Locator =>
    this.page.getByLabel('I confirm the information is complete and accurate');

  public readonly submitButton = (): Locator =>
    this.page.getByRole('button', { name: 'Accept and submit trip details' });

  async getSummaryValueText(key: string): Promise<string> {
    const text = await this.summaryValue(key).textContent();
    return text ? text.trim() : '';
  }

  async clickChangeLinkFor(key: string) {
    await this.changeLink(key).click();
  }

  async checkDeclaration() {
    await this.declarationCheckbox().check();
  }

  async clickAcceptAndSubmit() {
    await this.submitButton().click();
  }
}
