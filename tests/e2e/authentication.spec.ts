
import { test, expect } from '@playwright/test';

test.describe('Authentication and Registration', () => {
  test('New trainer registration', async ({ page }) => {
    await page.goto('/en/auth/register');
    const uniqueEmail = `test.trainer.${Date.now()}@example.com`;
    await page.getByTestId('register-name-input').fill('E2E Test Trainer');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-password-input').fill('password123');
    await page.locator('input[name="role"][value="trainer"]').click();
    await page.getByTestId('register-submit-button').click();
    await expect(page).toHaveURL(/\/en\/auth\/login/);
    await expect(page.getByTestId('login-success-message')).toBeVisible();
    await expect(page.getByTestId('login-success-message')).toContainText('Registration successful! Please log in.');
  });

  test('Trainer login success', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByTestId('login-email-input').fill('ada@ziro.fit');
    await page.getByTestId('login-password-input').fill('password123');
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL(/\/en\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('Trainer login failure with wrong password', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByTestId('login-email-input').fill('ada@ziro.fit');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/en\/auth\/login/);
  });

  test('New client registration and login', async ({ page }) => {
    const clientEmail = `test.client.${Date.now()}@example.com`;
    const clientPassword = 'password123';

    // Registration
    await page.goto('/en/auth/register');
    await page.getByTestId('register-name-input').fill('E2E Test Client');
    await page.getByTestId('register-email-input').fill(clientEmail);
    await page.getByTestId('register-password-input').fill(clientPassword);
    await page.locator('input[name="role"][value="client"]').click();
    await page.getByTestId('register-submit-button').click();

    // Assert redirection to login with success message
    await expect(page).toHaveURL(/\/en\/auth\/login/);
    await expect(page.getByTestId('login-success-message')).toBeVisible();

    // Login
    await page.getByTestId('login-email-input').fill(clientEmail);
    await page.getByTestId('login-password-input').fill(clientPassword);
    await page.getByTestId('login-submit-button').click();

    // Assert redirection to client dashboard
    await expect(page).toHaveURL(/\/en\/client-dashboard/);
    await expect(page.getByRole('heading', { name: 'Client Dashboard' })).toBeVisible();
  });

  test('Logout flow', async ({ page }) => {
    // This test relies on the 'trainer' project in playwright.config.ts
    // which uses the saved authentication state.
    await page.goto('/en/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: 'Log Out' }).click();

    await expect(page).toHaveURL(/\/en\/auth\/login/);
    await expect(page.getByText('Logged out successfully.')).toBeVisible();
  });
});