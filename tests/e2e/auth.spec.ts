
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('New trainer registration', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/en/');

    // Click on the "Trainer Sign Up" button
    await page.getByTestId('signup-link').click();

    // We should be on the register page now
    await expect(page).toHaveURL('/en/auth/register');

    // Fill in the registration form
    // Using a unique email for each test run to avoid conflicts
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    await page.getByTestId('register-name-input').fill('E2E Test User');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-password-input').fill('password123');

    // Perform the click and wait for the navigation to complete.
    // This is more robust than a simple click followed by a URL check.
    await Promise.all([
      page.waitForURL(/\/en\/auth\/login/, { timeout: 15000 }), // Wait for the URL to change
      page.getByTestId('register-submit-button').click(), // Perform the action
    ]);

    // Assert that the success message is visible on the login page
    await expect(page.getByTestId('login-success-message')).toBeVisible();
  });
});