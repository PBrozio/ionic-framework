import { expect } from '@playwright/test';
import { configs, test } from '@utils/test/playwright';

configs({ modes: ['ios'], directions: ['ltr'] }).forEach(({ title, config }) => {
  test.describe(title('modal: inline'), () => {
    test('it should present and then remain in the dom on dismiss', async ({ page }) => {
      await page.goto('/src/components/modal/test/inline', config);
      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');
      const modal = page.locator('ion-modal').first();

      await page.click('#open-inline-modal');

      await ionModalDidPresent.next();

      await expect(modal).toBeVisible();

      await modal.evaluate((el: HTMLIonModalElement) => el.dismiss());

      await ionModalDidDismiss.next();

      await expect(modal).toBeHidden();
    });

    test('it should dismiss child modals when parent modal is dismissed', async ({ page }) => {
      await page.goto('/src/components/modal/test/inline', config);
      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');

      const parentModal = page.locator('ion-modal').first();
      const childModal = page.locator('#child-modal');

      // Open the parent modal
      await page.click('#open-inline-modal');
      await ionModalDidPresent.next();
      await expect(parentModal).toBeVisible();

      // Open the child modal
      await page.click('#open-child-modal');
      await ionModalDidPresent.next();
      await expect(childModal).toBeVisible();

      // Both modals should be visible
      await expect(parentModal).toBeVisible();
      await expect(childModal).toBeVisible();

      // Dismiss the parent modal
      await page.click('#dismiss-parent');

      // Wait for both modals to be dismissed
      await ionModalDidDismiss.next(); // child modal dismissed
      await ionModalDidDismiss.next(); // parent modal dismissed

      // Both modals should be hidden
      await expect(parentModal).toBeHidden();
      await expect(childModal).toBeHidden();
    });

    test('it should only dismiss child modal when child dismiss button is clicked', async ({ page }) => {
      await page.goto('/src/components/modal/test/inline', config);
      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');

      const parentModal = page.locator('ion-modal').first();
      const childModal = page.locator('#child-modal');

      // Open the parent modal
      await page.click('#open-inline-modal');
      await ionModalDidPresent.next();
      await expect(parentModal).toBeVisible();

      // Open the child modal
      await page.click('#open-child-modal');
      await ionModalDidPresent.next();
      await expect(childModal).toBeVisible();

      // Dismiss only the child modal
      await page.click('#dismiss-child');
      await ionModalDidDismiss.next();

      // Parent modal should still be visible, child modal should be hidden
      await expect(parentModal).toBeVisible();
      await expect(childModal).toBeHidden();
    });

    test('presenting should create a single root element with the ion-page class', async ({ page }, testInfo) => {
      testInfo.annotations.push({
        type: 'issue',
        description: 'https://github.com/ionic-team/ionic-framework/issues/26117',
      });

      await page.setContent(
        `
      <ion-datetime-button datetime="datetime"></ion-datetime-button>

      <ion-modal>
        <ion-datetime id="datetime" presentation="date-time"></ion-datetime>
      </ion-modal>
      `,
        config
      );

      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');
      const modal = page.locator('ion-modal');

      await page.click('#date-button');
      await ionModalDidPresent.next();

      // Verifies that the host element exists with the .ion-page class
      expect(await modal.evaluate((el: HTMLIonModalElement) => el.firstElementChild!.className)).toContain('ion-page');

      await modal.evaluate((el: HTMLIonModalElement) => el.dismiss());
      await ionModalDidDismiss.next();

      await page.click('#date-button');
      await ionModalDidPresent.next();

      // Verifies that presenting the overlay again does not create a new host element
      expect(await modal.evaluate((el: HTMLIonModalElement) => el.firstElementChild!.className)).toContain('ion-page');
      expect(
        await modal.evaluate((el: HTMLIonModalElement) => el.firstElementChild!.firstElementChild!.className)
      ).not.toContain('ion-page');
    });

    test('it should dismiss modal when parent container is removed from DOM', async ({ page }) => {
      await page.goto('/src/components/modal/test/inline', config);
      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');

      const modal = page.locator('ion-modal').first();
      const modalContainer = page.locator('#modal-container');

      // Open the modal
      await page.click('#open-inline-modal');
      await ionModalDidPresent.next();
      await expect(modal).toBeVisible();

      // Remove the modal container from DOM
      await page.click('#remove-modal-container');

      // Wait for modal to be dismissed
      const dismissEvent = await ionModalDidDismiss.next();

      // Verify the modal was dismissed with the correct role
      expect(dismissEvent.detail.role).toBe('parent-removed');

      // Verify the modal is no longer visible
      await expect(modal).toBeHidden();

      // Verify the container was actually removed
      await expect(modalContainer).not.toBeAttached();
    });

    test('it should dismiss both parent and child modals when parent container is removed from DOM', async ({
      page,
    }) => {
      await page.goto('/src/components/modal/test/inline', config);
      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');

      const parentModal = page.locator('ion-modal').first();
      const childModal = page.locator('#child-modal');
      const modalContainer = page.locator('#modal-container');

      // Open the parent modal
      await page.click('#open-inline-modal');
      await ionModalDidPresent.next();
      await expect(parentModal).toBeVisible();

      // Open the child modal
      await page.click('#open-child-modal');
      await ionModalDidPresent.next();
      await expect(childModal).toBeVisible();

      // Remove the modal container from DOM
      await page.click('#child-remove-modal-container');

      // Wait for both modals to be dismissed
      const firstDismissEvent = await ionModalDidDismiss.next();
      const secondDismissEvent = await ionModalDidDismiss.next();

      // Verify at least one modal was dismissed with 'parent-removed' role
      const dismissRoles = [firstDismissEvent.detail.role, secondDismissEvent.detail.role];
      expect(dismissRoles).toContain('parent-removed');

      // Verify both modals are no longer visible
      await expect(parentModal).toBeHidden();
      await expect(childModal).toBeHidden();

      // Verify the container was actually removed
      await expect(modalContainer).not.toBeAttached();
    });

    test('it should dismiss modals when top-level ancestor is removed', async ({ page }) => {
      // We need to make sure we can close a modal when a much higher
      // element is removed from the DOM. This will be a common
      // use case in frameworks like Angular and React, where an entire
      // page container for much more than the modal might be swapped out.
      await page.setContent(
        `
        <ion-app>
          <div class="ion-page">
            <ion-header>
              <ion-toolbar>
                <ion-title>Top Level Removal Test</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <div id="top-level-container">
                <div id="nested-container">
                  <button id="open-nested-modal">Open Nested Modal</button>
                  <ion-modal id="nested-modal">
                    <ion-header>
                      <ion-toolbar>
                        <ion-title>Nested Modal</ion-title>
                      </ion-toolbar>
                    </ion-header>
                    <ion-content class="ion-padding">
                      <p>This modal's original parent is deeply nested</p>
                      <button id="remove-top-level">Remove Top Level Container</button>
                    </ion-content>
                  </ion-modal>
                </div>
              </div>
            </ion-content>
          </div>
        </ion-app>

        <script>
          const nestedModal = document.querySelector('#nested-modal');
          nestedModal.presentingElement = document.querySelector('.ion-page');

          document.getElementById('open-nested-modal').addEventListener('click', () => {
            nestedModal.isOpen = true;
          });

          document.getElementById('remove-top-level').addEventListener('click', () => {
            document.querySelector('#top-level-container').remove();
          });
        </script>
        `,
        config
      );

      const ionModalDidPresent = await page.spyOnEvent('ionModalDidPresent');
      const ionModalDidDismiss = await page.spyOnEvent('ionModalDidDismiss');

      const nestedModal = page.locator('#nested-modal');
      const topLevelContainer = page.locator('#top-level-container');

      // Open the nested modal
      await page.click('#open-nested-modal');
      await ionModalDidPresent.next();
      await expect(nestedModal).toBeVisible();

      // Remove the top-level container
      await page.click('#remove-top-level');

      // Wait for modal to be dismissed
      const dismissEvent = await ionModalDidDismiss.next();

      // Verify the modal was dismissed with the correct role
      expect(dismissEvent.detail.role).toBe('parent-removed');

      // Verify the modal is no longer visible
      await expect(nestedModal).toBeHidden();

      // Verify the container was actually removed
      await expect(topLevelContainer).not.toBeAttached();
    });
  });
});
