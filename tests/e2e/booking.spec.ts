
import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
  // This test assumes at least one trainer exists and has future availability.
  test('should allow a user to book a session with a trainer', async ({ page }) => {
    // Navigate to the trainers search page, a more robust entry point than a hardcoded profile
    await page.goto('/en/trainers');
    await expect(page.getByTestId('trainers-heading')).toBeVisible({ timeout: 10000 });

    // Find the first trainer's profile link and click it.
    const firstTrainerLink = page.getByTestId('view-profile-button').first();
    await expect(firstTrainerLink, "No trainers found on the search page.").toBeVisible();
    await firstTrainerLink.click();

    // Now on a trainer's profile page, wait for the page to load and calendar to be visible.
    await expect(page.getByTestId('booking-heading')).toBeVisible({ timeout: 15000 });

    // Find the calendar grid for days.
    const dayGrid = page.getByTestId('calendar-grid');
    
    // Find and click the first available day.
    const firstAvailableDay = dayGrid.locator('button:not([disabled])').first();
    await expect(firstAvailableDay, "No available booking day found on the calendar").toBeVisible({ timeout: 5000 });
    await firstAvailableDay.click();
    
    // Time slots should appear.
    await expect(page.getByTestId('available-slots-heading')).toBeVisible();
    
    // Find and click the first available time slot.
    const timeSlotContainer = page.getByTestId('time-slot-container');
    const firstAvailableTime = timeSlotContainer.getByTestId('available-time-slot').first();
    await expect(firstAvailableTime, "No available time slot found for the selected day").toBeVisible({ timeout: 5000 });
    await firstAvailableTime.click();

    // The booking form should now be visible.
    await expect(page.getByTestId('booking-name-input')).toBeVisible();

    // Fill in the booking form.
    await page.getByTestId('booking-name-input').fill('E2E Test Client');
    await page.getByTestId('booking-email-input').fill(`e2e-client-${Date.now()}@example.com`);
    await page.getByPlaceholder('Any notes for the trainer? (optional)').fill('This is an E2E test booking.');
    
    // Submit the form.
    await page.getByTestId('booking-confirm-button').click();

    // Assert that the success message is displayed.
    await expect(page.getByText('Session booked successfully!')).toBeVisible({ timeout: 10000 });
  });
});