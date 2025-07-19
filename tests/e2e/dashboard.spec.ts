
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard', () => {
    // This test uses the authenticated trainer state from global setup.
    test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

    test('bookings page should have "Add to Calendar" links for bookings', async ({ page }) => {
        await page.goto('/en/dashboard/bookings');
        
        // Wait for the bookings to load. This targets the container for a single booking.
        const firstBooking = page.getByTestId(/booking-card-/).first();
        
        if (await firstBooking.isVisible({ timeout: 5000 })) {
            const addToCalendarButton = firstBooking.getByTestId(/add-to-calendar-link-/);
            
            await expect(addToCalendarButton).toBeVisible();
            const calendarUrl = await addToCalendarButton.getAttribute('href');
            
            expect(calendarUrl).not.toBeNull();
            expect(calendarUrl).toMatch(/^https:\/\/www\.google\.com\/calendar\/render\?/);
            expect(calendarUrl).toContain('action=TEMPLATE');
        } else {
            console.log('No bookings found for test user, skipping calendar link assertion.');
            await expect(page.getByText('You have no upcoming bookings.')).toBeVisible();
        }
    });
});