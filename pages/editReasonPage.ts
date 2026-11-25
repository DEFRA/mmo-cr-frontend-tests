import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Give the reason for editing a submitted catch record.
 * Enter the reason before moving on to change the record.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */
export class EditReasonPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1, name: 'Why are you editing this catch record?' });

  public readonly reasonTextbox = (): Locator =>
    this.page.getByRole('textbox', { name: 'Why are you editing this catch record?' });

  async enterReason(reason: string): Promise<void> {
    await this.reasonTextbox().fill(reason);
  }
}
