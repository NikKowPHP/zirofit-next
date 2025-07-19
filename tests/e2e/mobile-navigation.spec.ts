
import { test, expect } from '@playwright/test';

test.describe('Mobile Bottom Navigation Bar', () => {
  // This group of tests will only run on mobile viewports
  test.skip(({ viewport }) => viewport && viewport.width >= 768, 'Only run on mobile');

  test.describe('Trainer Dashboard', () => {
    test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

    test('should display and allow navigation via the bottom nav bar', async ({ page }) => {
      await page.goto('/en/dashboard');
      
      const bottomNavBar = page.locator('div.md\\:hidden.fixed.bottom-0');
      await expect(bottomNavBar).toBeVisible();

      // Test navigation to Clients
      await bottomNavBar.getByRole('link', { name: 'Clients' }).click();
      await expect(page).toHaveURL(/.*\/clients/);
      await expect(page.getByRole('heading', { name: 'Manage Clients' })).toBeVisible();

      // Test navigation to Profile
      await bottomNavBar.getByRole('link', { name: 'Profile' }).click();
      await expect(page).toHaveURL(/.*\/profile\/edit/);
      await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();

      // Test navigation back to Dashboard
      await bottomNavBar.getByRole('link', { name: 'Dashboard' }).click();
      await expect(page).toHaveURL(/.*\/dashboard/);
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });
  });

  test.describe('Client Dashboard', () => {
    test.use({ storageState: 'tests/e2e/.auth/client.json' });

    test('should display and allow navigation via the bottom nav bar', async ({ page }) => {
      await page.goto('/en/client-dashboard');
      
      const bottomNavBar = page.locator('div.md\\:hidden.fixed.bottom-0');
      await expect(bottomNavBar).toBeVisible();

      // Test navigation to Log Workout
      await bottomNavBar.getByRole('link', { name: 'Log Workout' }).click();
      await expect(page).toHaveURL(/.*\/client-dashboard\/log-workout/);
      await expect(page.getByRole('heading', { name: 'Manage Exercise Performance' })).toBeVisible();

      // Test navigation to My Progress
      await bottomNavBar.getByRole('link', { name: 'My Progress' }).click();
      await expect(page).toHaveURL(/.*\/client-dashboard\/my-progress/);
      await expect(page.getByRole('heading', { name: 'Client Statistics' })).toBeVisible();

      // Test navigation back to Dashboard
      await bottomNavBar.getByRole('link', { name: 'Dashboard' }).click();
      await expect(page).toHaveURL(/.*\/client-dashboard/);
      await expect(page.getByRole('heading', { name: 'Client Dashboard' })).toBeVisible();
    });
  });
});