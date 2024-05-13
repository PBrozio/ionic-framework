import { expect } from '@playwright/test';
import { configs, test } from '@utils/test/playwright';
import { DatetimeHighlightType } from '../../datetime-interface';

configs({ directions: ['ltr'] }).forEach(({ title, screenshot, config }) => {
  test.describe(title('datetime: highlightedDates'), () => {
    test.beforeEach(async ({ page }) => {
      await page.setContent(
        `
        <ion-datetime locale="en-US"></ion-datetime>
      `,
        config
      );
    });

    test('should render highlights correctly when using an array', async ({ page }) => {
      const datetime = page.locator('ion-datetime');

      await datetime.evaluate((el: HTMLIonDatetimeElement) => {
        el.highlightedDates = [
          {
            date: '2024-04-30',
            type: DatetimeHighlightType.entry
          },
          {
            date: '2024-04-05',
            type: DatetimeHighlightType.entry
          },
          {
            date: '2024-04-01',
            type: DatetimeHighlightType.entryApproved
          },
          {
            date: '2024-04-16',
            type: DatetimeHighlightType.entryCanceled
          },
          {
            date: '2024-04-18',
            type: DatetimeHighlightType.entryOwnApproval
          },
          {
            date: '2024-04-19',
            type: DatetimeHighlightType.entryApproved
          },
          {
            date: '2024-04-26',
            type: DatetimeHighlightType.entry
          }
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

    test('should render vacation correctly', async ({ page }) => {
      const datetime = page.locator('ion-datetime');

      await datetime.evaluate((el: HTMLIonDatetimeElement) => {
        el.vacationDates = [
          '2024-01-01',
          '2024-03-29',
          '2024-04-01',
          '2024-05-01',
          '2024-05-09',
          '2024-05-20',
          '2024-05-30',
          '2024-10-03',
          '2024-11-01',
          '2024-12-25',
          '2024-12-26'
        ];
      });

      await page.waitForChanges();
      await expect(datetime).toHaveScreenshot(screenshot(`datetime-vacationDates`));
    });
  });
});
