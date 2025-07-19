
import { test as setup, expect } from '@playwright/test';
import fs from 'fs';

const trainerAuthFile = 'tests/e2e/.auth/trainer.json';
const clientAuthFile = 'tests/e2e/.auth/client.json';
const clientCredentialsFile = 'tests/e2e/.auth/client-credentials.json';

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
  const clientName = 'E2E Test Client';
  const clientEmail = `test.client.${Date.now()}@example.com`;
  const clientPassword = 'password123';

  await page.goto('/en/auth/register');
  await page.getByTestId('register-name-input').fill(clientName);
  await page.getByTestId('register-email-input').fill(clientEmail);
  await page.getByTestId('register-password-input').fill(clientPassword);
  await page.locator('input[name="role"][value="client"]').click();
  await page.getByTestId('register-submit-button').click();
  await expect(page.getByTestId('login-success-message')).toBeVisible();

  // Save client credentials for other tests to use
  fs.writeFileSync(clientCredentialsFile, JSON.stringify({
    name: clientName,
    email: clientEmail,
    password: clientPassword,
  }));

  // Now log in as the new client
  await page.getByTestId('login-email-input').fill(clientEmail);
  await page.getByTestId('login-password-input').fill(clientPassword);
  await page.getByTestId('login-submit-button').click();
  await expect(page.getByRole('heading', { name: 'Client Dashboard' })).toBeVisible();
  await page.context().storageState({ path: clientAuthFile });
});