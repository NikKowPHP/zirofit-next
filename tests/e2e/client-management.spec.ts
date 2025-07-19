
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard - Client Management Lifecycle', () => {
  // All tests in this file use the authenticated trainer state.
  test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

  test('should handle the full lifecycle of a client', async ({ page }) => {
    const clientName = `E2E Client ${Date.now()}`;
    const clientEmail = `e2e.client.${Date.now()}@example.com`;
    const clientPhone = '1234567890';

    // --- 1. Create a New Client ---
    await page.goto('/en/clients/create');
    await expect(page.getByRole('heading', { name: 'Create Client' })).toBeVisible();
    await page.getByLabel('Name').fill(clientName);
    await page.getByLabel('Email').fill(clientEmail);
    await page.getByLabel('Phone').fill(clientPhone);
    await page.getByRole('button', { name: 'Create Client' }).click();

    // Assert redirection and visibility of the new client
    await expect(page).toHaveURL('/en/clients');
    const clientCard = page.locator(`div:has-text("${clientName}")`).first();
    await expect(clientCard).toBeVisible();

    // --- 2. Manage Client & Log Data ---
    await clientCard.getByRole('button', { name: 'Manage' }).click();
    await expect(page.getByRole('heading', { name: clientName })).toBeVisible();

    // Log a Measurement
    await page.getByRole('button', { name: 'Measurements' }).click();
    await page.locator('input[name="measurementDate"]').fill('2025-01-01');
    await page.locator('input[name="weightKg"]').fill('80');
    await page.getByRole('button', { name: 'Add Measurement' }).click();
    await expect(page.getByText('Measurement added.')).toBeVisible();
    await expect(page.getByText('Weight (kg): 80')).toBeVisible();

    // Log a Session
    await page.getByRole('button', { name: 'Session Logs' }).click();
    await page.locator('input[name="sessionDate"]').fill('2025-01-01');
    await page.locator('input[name="durationMinutes"]').fill('60');
    await page.locator('textarea[name="activitySummary"]').fill('E2E Test Session');
    await page.getByRole('button', { name: 'Add Session Log' }).click();
    await expect(page.getByText('Session log added.')).toBeVisible();
    await expect(page.getByText('E2E Test Session')).toBeVisible();

    // Log an Exercise
    await page.getByRole('button', { name: 'Exercise Performance' }).click();
    await page.getByPlaceholder('Search for an exercise...').fill('Squat');
    await page.getByText('Barbell Squat').click();
    await page.locator('input[name="logDate"]').fill('2025-01-01');
    await page.locator('input[placeholder="Reps"]').first().fill('10');
    await page.locator('input[placeholder="Weight (kg)"]').first().fill('100');
    await page.getByRole('button', { name: 'Add Set' }).click();
    await page.locator('input[placeholder="Reps"]').nth(1).fill('8');
    await page.locator('input[placeholder="Weight (kg)"]').nth(1).fill('110');
    await page.getByRole('button', { name: 'Add Log' }).click();
    await expect(page.getByText('Exercise log added.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Barbell Squat' })).toBeVisible();

    // Upload a Photo
    await page.getByRole('button', { name: 'Progress Photos' }).click();
    await page.locator('input[name="photoDate"]').fill('2025-01-01');
    await page.locator('input[name="photo"]').setInputFiles('tests/fixtures/profile.jpg');
    await page.getByRole('button', { name: 'Add Photo' }).click();
    await expect(page.getByText('Photo added successfully.')).toBeVisible();
    await expect(page.locator('img[alt=""]')).toBeVisible();

    // --- 3. Edit the Client ---
    await page.goto('/en/clients');
    await clientCard.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Client' })).toBeVisible();

    const updatedClientName = `${clientName} (Updated)`;
    await page.getByLabel('Name').fill(updatedClientName);
    await page.locator('select[name="status"]').selectOption('inactive');
    await page.getByRole('button', { name: 'Update Client' }).click();

    await expect(page).toHaveURL('/en/clients');
    const updatedClientCard = page.locator(`div:has-text("${updatedClientName}")`).first();
    await expect(updatedClientCard).toBeVisible();
    await expect(updatedClientCard.getByText('inactive')).toBeVisible();

    // --- 4. Delete the Client ---
    await updatedClientCard.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Client deleted.')).toBeVisible();
    await expect(updatedClientCard).not.toBeVisible();
  });
});