import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
  // This test assumes a trainer with username 'test-trainer' exists and has future availability.
  // Seeding this data would be necessary for a real CI environment.
  test('should allow a user to book a session with a trainer', async ({ page }) => {
    // Navigate to a specific trainer's profile page
    await page.goto('/trainer/test-trainer');

    // Wait for the calendar to be visible by checking for its title
    await expect(page.getByRole('heading', { name: 'Book a Session' })).toBeVisible();

    // Find the calendar grid for days. There are two 7-col grids, we want the second one which contains the day buttons.
    const dayGrid = page.locator('.grid.grid-cols-7').last();
    
    // Find and click the first available day.
    // An available day is a button that is not disabled.
    const firstAvailableDay = dayGrid.locator('button:not([disabled])').first();
    await expect(firstAvailableDay).toBeVisible();
    await firstAvailableDay.click();
    
    // Now that a date is selected, time slots should appear.
    // Wait for the "Available slots" text to ensure the UI has updated.
    await expect(page.getByText(/Available slots for/)).toBeVisible();
    
    // Find and click the first available time slot.
    // The container for the time slots is the next sibling of the "Available slots" heading.
    const timeSlotContainer = page.locator('h4:has-text("Available slots for") + div');
    const firstAvailableTime = timeSlotContainer.locator('button').first();
    await expect(firstAvailableTime).toBeVisible();
    await firstAvailableTime.click();

    // The booking form should now be visible. We can check for the placeholder of the name input.
    await expect(page.getByPlaceholder('Your Name')).toBeVisible();

    // Fill in the client name and email in the booking form. Using a unique email for each test run.
    await page.getByPlaceholder('Your Name').fill('E2E Test Client');
    await page.getByPlaceholder('Your Email').fill(`e2e-client-${Date.now()}@example.com`);
    await page.getByPlaceholder('Any notes for the trainer? (optional)').fill('This is an E2E test booking.');
    
    // Submit the booking form.
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Assert that the success message is displayed. Give it a slightly longer timeout to account for server processing.
    await expect(page.getByText('Session booked successfully!')).toBeVisible({ timeout: 10000 });
  });
});