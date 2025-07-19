
import { test as setup, expect } from '@playwright/test';

const trainerAuthFile = 'tests/e2e/.auth/trainer.json';
const clientAuthFile = 'tests/e2e/.auth/client.json';

const trainerEmail = 'ada@ziro.fit';
const trainerPassword = 'password123';

setup('authenticate as trainer and client', async ({ page }) => {
  // Trainer authentication
  await page.goto('/en/auth/login');
  await page.getByTestId('login-email-input').fill(trainerEmail);
  await page.getByTestId('login-password-input').fill(trainerPassword);
  await page.getByTestId('login-submit-button').click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.context().storageState({ path: trainerAuthFile });

  // Client registration and authentication
  const clientEmail = `test.client.${Date.now()}@example.com`;
  const clientPassword = 'password123';

  await page.goto('/en/auth/register');
  await page.getByTestId('register-name-input').fill('E2E Test Client');
  await page.getByTestId('register-email-input').fill(clientEmail);
  await page.getByTestId('register-password-input').fill(clientPassword);
  await page.locator('input[name="role"][value="client"]').click();
  await page.getByTestId('register-submit-button').click();
  await expect(page.getByTestId('login-success-message')).toBeVisible();

  // Now log in as the new client
  await page.getByTestId('login-email-input').fill(clientEmail);
  await page.getByTestId('login-password-input').fill(clientPassword);
  await page.getByTestId('login-submit-button').click();
  await expect(page.getByRole('heading', { name: 'Client Dashboard' })).toBeVisible();
  await page.context().storageState({ path: clientAuthFile });
});