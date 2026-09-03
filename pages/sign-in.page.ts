import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './basePage';

export class SigninPage extends BasePage {
  public readonly emailInput = (): Locator => this.page.getByLabel('Email address');
  public readonly passwordInput = (): Locator => this.page.getByLabel('Password');
  public readonly signInButton = (): Locator => this.page.getByRole('button', { name: 'Sign in' });
  public readonly errorMessage = (): Locator => this.page.locator('#errorIsland');

  public readonly signInHeading = (): Locator => this.page.getByTestId('app-heading-title');
  public readonly troubleHeading = (): Locator =>
    this.page.getByRole('heading', { name: 'Having trouble signing in?' });

  public readonly backLink = (): Locator => this.page.getByRole('link', { name: 'Back' });
  public readonly forgotPasswordLink = (): Locator => this.page.getByRole('link', { name: 'Forgotten your password?' });
  public readonly registerLink = (): Locator => this.page.getByRole('link', { name: 'Create an account' });

  public readonly englishLabel = (): Locator => this.page.getByText('English', { exact: true });
  public readonly cymraegLink = (): Locator => this.page.getByRole('link', { name: 'Cymraeg' });

  public readonly feedbackLink = (): Locator => this.page.locator('main').getByRole('link', { name: 'feedback' });

  async login(userName: string, password: string): Promise<void> {
    await this.emailInput().fill(userName);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }
}
