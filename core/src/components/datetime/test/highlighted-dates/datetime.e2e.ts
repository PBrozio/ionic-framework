import { expect } from '@playwright/test';
import { configs, test } from '@utils/test/playwright';
import { DatetimeHighlightType } from '../../datetime-interface';

configs({ directions: ['ltr'] }).forEach(({ title, screenshot, config }) => {
  test.describe(title('datetime: highlightedDates'), () => {
    test.beforeEach(async ({ page }) => {
      await page.setContent(
        `
        <ion-datetime value="2023-01-01" locale="en-US"></ion-datetime>
      `,
        config
      );
    });

    test('should render highlights correctly when using an array', async ({ page }) => {
      const datetime = page.locator('ion-datetime');

      await datetime.evaluate((el: HTMLIonDatetimeElement) => {
        el.highlightedDates = [
          {
            date: '2023-01-01', // ensure selected date style overrides highlight
            type: DatetimeHighlightType.entry
          },
          {
            date: '2023-01-02',
            type: DatetimeHighlightType.entryOwnApproval
          },
          {
            date: '2023-01-03',
            type: DatetimeHighlightType.entryApproved
          },
          {
            date: '2023-01-03',
            type: DatetimeHighlightType.entryCanceled
          },
        ];
      });

      await page.waitForChanges();
      await expect(datetime).toHaveScreenshot(screenshot(`datetime-highlightedDates-array`));
    });

    test('should render highlights correctly when using a callback', async ({ page }) => {
      const datetime = page.locator('ion-datetime');

      await datetime.evaluate((el: HTMLIonDatetimeElement) => {
        el.highlightedDates = (isoString) => {
          const date = new Date(isoString);
          const utcDay = date.getUTCDate();

          // ensure selected date style overrides highlight
          if (utcDay === 1) {
            return {
              type: DatetimeHighlightType.entry
            };
          }

          if (utcDay % 5 === 0) {
            return {
              type: DatetimeHighlightType.entryOwnApproval
            };
          }

          if (utcDay % 3 === 0) {
            return {
              type: DatetimeHighlightType.entryApproved
            };
          }

          if (utcDay % 7 === 0) {
            return {
              type: DatetimeHighlightType.entryCanceled
            };
          }

          return undefined;
        };
      });

      await page.waitForChanges();
      await expect(datetime).toHaveScreenshot(screenshot(`datetime-highlightedDates-callback`));
    });
  });
});
