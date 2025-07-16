
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard', () => {
    // This test requires a pre-existing user in the test database.
    // Email: ada@ziro.fit, Password: password123
    // You may need to seed this user for the test to pass.
    const TEST_USER_EMAIL = 'ada@ziro.fit'; 
    const TEST_USER_PASS = 'password123';

    test.beforeEach(async ({ page }) => {
        await page.goto('/en/auth/login');
        await page.getByTestId('login-email-input').fill(TEST_USER_EMAIL);
        await page.getByTestId('login-password-input').fill(TEST_USER_PASS);
        await page.getByTestId('login-submit-button').click();
        await expect(page).toHaveURL('/en/dashboard', { timeout: 15000 });
    });

    test('bookings page should have "Add to Calendar" links for bookings', async ({ page }) => {
        await page.goto('/en/dashboard/bookings');
        
        // Wait for the bookings to load. This targets the container for a single booking.
        const firstBooking = page.getByTestId(/booking-card-/).first();
        
        if (await firstBooking.isVisible()) {
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