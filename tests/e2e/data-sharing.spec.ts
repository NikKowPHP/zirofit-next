
import { test, expect } from '@playwright/test';
import fs from 'fs';

const clientCredentialsFile = 'tests/e2e/.auth/client-credentials.json';

test.describe('Client Dashboard & Data Sharing Flow', () => {
  
  test.describe('As a Client', () => {
    test.use({ storageState: 'tests/e2e/.auth/client.json' });

    test('should log a workout and then link/unlink from a trainer', async ({ page }) => {
      // --- 1. Client Logs Their Own Workout ---
      await page.goto('/en/client-dashboard/log-workout');
      await expect(page.getByRole('heading', { name: 'Manage Exercise Performance' })).toBeVisible();

      await page.getByPlaceholder('Search for an exercise...').fill('Bench Press');
      await page.getByText('Barbell Bench Press').click();
      await page.locator('input[name="logDate"]').fill('2025-02-01');
      await page.locator('input[placeholder="Reps"]').fill('10');
      await page.locator('input[placeholder="Weight (kg)"]').fill('60');
      await page.getByRole('button', { name: 'Add Log' }).click();

      await expect(page.getByText('Exercise log added.')).toBeVisible();
      const exerciseHistoryCard = page.locator('div:has-text("Barbell Bench Press")').first();
      await expect(exerciseHistoryCard).toBeVisible();
      await expect(exerciseHistoryCard).toContainText('10 reps @ 60 kg');

      // Verify on progress page
      await page.getByRole('link', { name: 'My Progress' }).click();
      await expect(page.getByRole('heading', { name: 'Exercise Progress' })).toBeVisible();
      // A simple check that the chart card is there. Detailed chart validation is complex.
      await expect(page.locator('div:has-text("Barbell Bench Press")').locator('canvas')).toBeVisible();

      // --- 2. Client Links to a Trainer ---
      await page.goto('/en/trainer/ada-lovelace');
      const shareButton = page.getByRole('button', { name: /Share My Data with/ });
      await expect(shareButton).toBeVisible();
      await shareButton.click();

      const modal = page.getByRole('dialog');
      await modal.getByRole('button', { name: 'Share Data' }).click();
      await expect(page.getByText('Successfully linked with trainer.')).toBeVisible();
      
      const unlinkButton = page.getByRole('button', { name: /Unlink from/ });
      await expect(unlinkButton).toBeVisible();

      // --- 3. Client Unlinks from Trainer ---
      await unlinkButton.click();
      await modal.getByRole('button', { name: 'Unlink' }).click();
      await expect(page.getByText('Successfully unlinked from trainer.')).toBeVisible();
      await expect(page.getByRole('button', { name: /Share My Data with/ })).toBeVisible();
    });
  });

  test.describe('As a Trainer', () => {
    test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

    test('should see a client\'s data after they link', async ({ page }) => {
      const clientCredentials = JSON.parse(fs.readFileSync(clientCredentialsFile, 'utf-8'));
      // This test requires the client to be in a linked state.
      // We will perform the linking action using the API or a separate page context.
      const clientPage = await page.context().newPage();
      await clientPage.context().addCookies(JSON.parse(fs.readFileSync('tests/e2e/.auth/client.json', 'utf-8')).cookies);
      
      await clientPage.goto('/en/trainer/ada-lovelace');
      await clientPage.getByRole('button', { name: /Share My Data with/ }).click();
      await clientPage.getByRole('dialog').getByRole('button', { name: 'Share Data' }).click();
      await expect(clientPage.getByText('Successfully linked with trainer.')).toBeVisible();
      await clientPage.close();

      // Now, as the trainer, verify access
      await page.goto('/en/clients');
      const clientCard = page.locator(`div:has-text("${clientCredentials.name}")`).first();
      await expect(clientCard).toBeVisible();
      await expect(clientCard.locator('span[title="Linked Account"]')).toBeVisible();

      await clientCard.getByRole('button', { name: 'Manage' }).click();
      await page.getByRole('button', { name: 'Exercise Performance' }).click();
      
      const exerciseCard = page.locator('div:has-text("Barbell Bench Press")').first();
      await expect(exerciseCard).toBeVisible();
      await expect(exerciseCard).toContainText('10 reps @ 60 kg');

      // Cleanup: Unlink the client so the test is idempotent
      const clientPageForUnlink = await page.context().newPage();
      await clientPageForUnlink.context().addCookies(JSON.parse(fs.readFileSync('tests/e2e/.auth/client.json', 'utf-8')).cookies);
      await clientPageForUnlink.goto('/en/trainer/ada-lovelace');
      await clientPageForUnlink.getByRole('button', { name: /Unlink from/ }).click();
      await clientPageForUnlink.getByRole('dialog').getByRole('button', { name: 'Unlink' }).click();
      await expect(clientPageForUnlink.getByText('Successfully unlinked from trainer.')).toBeVisible();
      await clientPageForUnlink.close();
    });
  });
});