import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('New trainer registration', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Click on the "Trainer Sign Up" button
    await page.getByRole('link', { name: 'Trainer Sign Up' }).click();

    // We should be on the register page now
    await expect(page).toHaveURL('/auth/register');

    // Fill in the registration form
    // Using a unique email for each test run to avoid conflicts
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    await page.locator('input[name="name"]').fill('E2E Test User');
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill('password123');

    // Submit the form
    await page.getByRole('button', { name: 'Register' }).click();

    // Assert that the page redirects to /auth/login
    await expect(page).toHaveURL(/\/auth\/login/);

    // Assert that the success message is visible
    await expect(page.getByText('Registration successful! Please log in.')).toBeVisible();
  });
});