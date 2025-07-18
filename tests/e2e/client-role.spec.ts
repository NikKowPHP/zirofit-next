
import { test, expect } from '@playwright/test';

test.describe('Client Role and Data Sharing Flow', () => {

  const trainer = {
    email: 'ada@ziro.fit',
    pass: 'password123',
  };

  test('Trainer sees "Request Access" when adding a client with an existing user account', async ({ page }) => {
    // 1. Create a new client user first to ensure they exist.
    const clientEmail = `client.${Date.now()}@example.com`;
    await page.goto('/en/auth/register');
    await page.getByTestId('register-name-input').fill('Test Client User');
    await page.getByTestId('register-email-input').fill(clientEmail);
    await page.getByTestId('register-password-input').fill('password123');
    await page.locator('input[name="role"][value="client"]').click();
    await page.getByTestId('register-submit-button').click();
    await expect(page).toHaveURL(/\/en\/auth\/login/);

    // 2. Log in as a trainer.
    await page.getByTestId('login-email-input').fill(trainer.email);
    await page.getByTestId('login-password-input').fill(trainer.pass);
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL(/\/en\/dashboard/);

    // 3. Navigate to add a new client.
    await page.goto('/en/clients/create');
    
    // Using a more robust selector for the title
    await expect(page.locator('h1, h2, h3')).toContainText('Create Client');

    // 4. Try to add the client that already exists as a user.
    await page.getByLabel('Name').fill('Test Client User');
    await page.getByLabel('Email').fill(clientEmail);
    await page.getByLabel('Phone').fill('1234567890');
    await page.getByRole('button', { name: 'Create Client' }).click();
    
    // 5. Verify the error message and "Request Access" button appear.
    await expect(page.getByText('A user with this email already exists')).toBeVisible();
    const requestAccessButton = page.getByRole('button', { name: 'Request Access' });
    await expect(requestAccessButton).toBeVisible();

    // 6. Click "Request Access" and check for success toast.
    await requestAccessButton.click();
    await expect(page.getByText('Connection request sent')).toBeVisible();
  });
});