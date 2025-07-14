import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
  // This test assumes at least one trainer exists and has future availability.
  test('should allow a user to book a session with a trainer', async ({ page }) => {
    // Navigate to the trainers search page, a more robust entry point than a hardcoded profile
    await page.goto('/trainers');
    await expect(page.getByRole('heading', { name: 'Meet Our Trainers' })).toBeVisible({ timeout: 10000 });

    // Find the first trainer's profile link and click it.
    const firstTrainerLink = page.locator('a:has-text("View Profile")').first();
    await expect(firstTrainerLink, "No trainers found on the search page.").toBeVisible();
    await firstTrainerLink.click();

    // Now on a trainer's profile page, wait for the page to load and calendar to be visible.
    await expect(page.getByRole('heading', { name: 'Book a Session' })).toBeVisible({ timeout: 15000 });

    // Find the calendar grid for days.
    const dayGrid = page.locator('.grid.grid-cols-7').last();
    
    // Find and click the first available day.
    const firstAvailableDay = dayGrid.locator('button:not([disabled])').first();
    await expect(firstAvailableDay, "No available booking day found on the calendar").toBeVisible({ timeout: 5000 });
    await firstAvailableDay.click();
    
    // Time slots should appear.
    await expect(page.getByText(/Available slots for/)).toBeVisible();
    
    // Find and click the first available time slot.
    const timeSlotContainer = page.locator('h4:has-text("Available slots for") + div');
    const firstAvailableTime = timeSlotContainer.locator('button').first();
    await expect(firstAvailableTime, "No available time slot found for the selected day").toBeVisible({ timeout: 5000 });
    await firstAvailableTime.click();

    // The booking form should now be visible.
    await expect(page.getByPlaceholder('Your Name')).toBeVisible();

    // Fill in the booking form.
    await page.getByPlaceholder('Your Name').fill('E2E Test Client');
    await page.getByPlaceholder('Your Email').fill(`e2e-client-${Date.now()}@example.com`);
    await page.getByPlaceholder('Any notes for the trainer? (optional)').fill('This is an E2E test booking.');
    
    // Submit the form.
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Assert that the success message is displayed.
    await expect(page.getByText('Session booked successfully!')).toBeVisible({ timeout: 10000 });
  });
});