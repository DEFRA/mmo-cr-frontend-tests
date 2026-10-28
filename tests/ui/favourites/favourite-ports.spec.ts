import { expect, test } from '../../../fixtures/commonfixture';

const accountPath = '/account';

test.describe('Favourites', () => {
  test.beforeEach(async ({ navigationFlow }) => {
    await navigationFlow.signInAndOpenAccount();
  });

  test.describe('Favourite ports', () => {
    test('searches with a partial name and saves the selected port as a favourite', async ({
      accountPage,
      addPortPage
    }) => {
      await accountPage.addPortLink().click();
      await addPortPage.portInput().fill('Plym');
      await expect(addPortPage.portResultItem('Plymouth')).toBeVisible();
      await addPortPage.portResultItem('Plymouth').click();
      await addPortPage.clickSaveAndContinue();

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.portsUsedValue()).toContainText('Plymouth');
    });

    test('rejects a port that is not in the reference data', async ({ page, accountPage, addPortPage }) => {
      await accountPage.addPortLink().click();
      await addPortPage.portInput().fill('Notaport Town');
      await addPortPage.clickSaveAndContinue();

      await expect(addPortPage.errorSummary()).toContainText('Select a port from the list');
      await addPortPage.expectUrl(/\/add-port/);
      await page.goto(accountPath);
      await expect(accountPage.portsUsedValue()).not.toContainText('Notaport Town');
    });

    test('requires a port before continuing', async ({ accountPage, addPortPage }) => {
      await accountPage.addPortLink().click();
      await addPortPage.clickSaveAndContinue();

      await expect(addPortPage.errorSummary()).toContainText('Select a port from the list');
    });

    test('does not create a duplicate when an existing favourite port is added again', async ({
      page,
      accountPage,
      addPortPage
    }) => {
      const existing = (await accountPage.portsUsedValue().innerText()).trim().split('\n')[0]!.trim();
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort(existing);
      await addPortPage.clickSaveAndContinue();

      await page.goto(accountPath);
      const ports = (await accountPage.portsUsedValue().innerText()).split('\n').map((p) => p.trim());
      expect(ports.filter((p) => p === existing)).toHaveLength(1);
    });

    test('tells the user when the port is already a favourite', async ({ accountPage, addPortPage }) => {
      test.fail(true, 'Known gap: duplicate port is silently ignored with no informative message');
      const existing = (await accountPage.portsUsedValue().innerText()).trim().split('\n')[0]!.trim();
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort(existing);
      await addPortPage.clickSaveAndContinue();

      await expect(addPortPage.errorSummary()).toBeVisible({ timeout: 5000 });
    });

    test('requires a port to be selected before removing', async ({ accountPage, removePortPage }) => {
      await accountPage.removePortLink().click();
      await expect(removePortPage.pageHeading()).toBeVisible();
      await removePortPage.continueButton().click();

      await expect(removePortPage.errorSummary()).toContainText('Select the port you want to remove');
    });

    test('removes a favourite port from the account', async ({ accountPage, addPortPage, removePortPage }) => {
      await accountPage.addPortLink().click();
      await addPortPage.searchAndSelectPort('Plymouth');
      await addPortPage.clickSaveAndContinue();
      await expect(accountPage.portsUsedValue()).toContainText('Plymouth');

      await accountPage.removePortLink().click();
      await removePortPage.removePorts('Plymouth');

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.portsUsedValue()).not.toContainText('Plymouth');
    });

    test('shows favourite ports first when searching for a departure port', async ({
      page,
      accountPage,
      addPortPage
    }) => {
      test.fail(true, 'Known gap: port results are alphabetical and do not prioritise favourites');
      await expect(accountPage.portsUsedValue()).toContainText('Hastings');

      await page.goto('/add-port?for=departure&entry=1');
      await addPortPage.portInput().fill('Ha');
      await expect(addPortPage.portResultItem('Hastings')).toBeVisible();
      await expect(addPortPage.portResultsList().locator('li').first()).toHaveText(/Hastings/, { timeout: 5000 });
    });
  });
});
