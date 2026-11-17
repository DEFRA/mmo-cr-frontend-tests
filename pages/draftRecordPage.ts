import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Choose what to do with a draft catch record.
 * Select whether to complete or delete the draft.
 *
 * @author Randhir Patel
 * @since 2026-09-30
 */
export class DraftRecordPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'What do you want to do with your draft record?' });
  public readonly completeCatchRecordRadio = (): Locator => this.page.getByLabel('Complete catch record');
  public readonly deleteCatchRecordRadio = (): Locator => this.page.getByLabel('Delete catch record');

  async deleteDraft(): Promise<void> {
    await this.deleteCatchRecordRadio().check();
    await this.clickSaveAndContinue();
  }
}
