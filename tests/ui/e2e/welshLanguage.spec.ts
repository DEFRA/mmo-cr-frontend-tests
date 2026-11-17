/**
 * Use Record Your Catch in Welsh.
 * Traceability: UAT-31 (CRAR ticket TBC).
 *
 * @author Randhir Patel
 * @since 2026-11-17
 */
import { test } from '../../../fixtures/commonfixture';

test.describe('Welsh Language', () => {
  // Blocked (OQ-11): /records?lang=cy returned HTTP 400 and no Welsh copy is available for the journey pages
  test.fixme(
    'Use service in Welsh',
    {
      tag: ['@ui', '@regression', '@welshLanguage', '@e2e'],
      annotation: { type: 'UAT', description: 'UAT-31' }
    },
    async ({ navigationFlow, recordsPage }) => {
      await test.step('I am signed in', async () => {
        await navigationFlow.signIn();
      });

      await test.step('I change the service language to Welsh', async () => {
        await recordsPage.common.languageCymraeg().click();
      });

      await test.step('The service should be displayed in Welsh', async () => {
        // UNVERIFIED (OQ-11): Welsh records-page heading and title to be supplied
      });

      await test.step('I should be able to complete the catch-recording journey in Welsh', async () => {
        // UNVERIFIED (OQ-11): needs Welsh labels for every page object in the journey
      });
    }
  );
});
