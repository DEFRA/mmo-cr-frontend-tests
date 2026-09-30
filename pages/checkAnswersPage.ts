import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class CheckAnswersPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Check your catch record', exact: true });

  public readonly summaryRow = (key: string): Locator =>
    this.page.locator('.govuk-summary-list__row').filter({
      has: this.page.locator('.govuk-summary-list__key', { hasText: key }),
    });

  public readonly summaryValue = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__value');

  public readonly changeLink = (key: string): Locator => this.summaryRow(key).locator('.govuk-summary-list__actions a');

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
