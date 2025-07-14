import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard', () => {
    // This test requires a pre-existing user in the test database.
    // Email: ada@ziro.fit, Password: password123
    // You may need to seed this user for the test to pass.
    const TEST_USER_EMAIL = 'ada@ziro.fit'; 
    const TEST_USER_PASS = 'password123';

    test.beforeEach(async ({ page }) => {
        await page.goto('/auth/login');
        await page.locator('input[name="email"]').fill(TEST_USER_EMAIL);
        await page.locator('input[name="password"]').fill(TEST_USER_PASS);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    });

    test('bookings page should have "Add to Calendar" links for bookings', async ({ page }) => {
        await page.goto('/dashboard/bookings');
        
        // Wait for the bookings to load. This targets the container for a single booking.
        const firstBooking = page.locator('div > h3').first();
        
        if (await firstBooking.isVisible()) {
            const bookingContainer = firstBooking.locator('.. >> ..'); // Navigate up to the booking card container
            const addToCalendarButton = bookingContainer.getByRole('link', { name: 'Add to Calendar' });
            
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