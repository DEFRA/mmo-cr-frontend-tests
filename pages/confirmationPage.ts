import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Confirm that a catch record has been submitted.
 *
 * @author Randhir Patel
 * @since 2026-11-26
 */
export class ConfirmationPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1, name: 'Your catch record has been submitted' });
}
