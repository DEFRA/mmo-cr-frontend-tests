import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class DraftRecordPage extends BasePage {
  public readonly pageHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'What do you want to do with your draft record?' });
  public readonly completeCatchRecordRadio = (): Locator => this.page.getByLabel('Complete catch record');
  public readonly deleteCatchRecordRadio = (): Locator => this.page.getByLabel('Delete catch record');
}
