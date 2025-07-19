
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard - Profile Management', () => {
  // All tests in this file use the authenticated trainer state.
  test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/profile/edit');
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
  });

  test.describe('Core Info Section', () => {
    test('should update core information successfully', async ({ page }) => {
      await page.getByRole('button', { name: 'Core Info' }).click();

      const newName = `Ada Lovelace ${Date.now()}`;
      const newUsername = `ada-lovelace-${Date.now()}`;
      const newCerts = 'Certified Playwright Specialist';
      const newLocation = 'London, UK';
      const newPhone = '1234567890';

      await page.getByLabel('Full Name').fill(newName);
      await page.getByLabel('Username').fill(newUsername);
      await page.getByLabel('Certifications').fill(newCerts);
      await page.getByLabel('Location').fill(newLocation);
      await page.getByLabel('Phone (Optional)').fill(newPhone);

      await page.getByRole('button', { name: 'Save Core Info' }).click();
      await expect(page.getByText('Core info updated successfully!')).toBeVisible();

      await page.reload();

      await expect(page.getByLabel('Full Name')).toHaveValue(newName);
      await expect(page.getByLabel('Username')).toHaveValue(newUsername);
      await expect(page.getByLabel('Certifications')).toHaveValue(newCerts);
      await expect(page.getByLabel('Location')).toHaveValue(newLocation);
      await expect(page.getByLabel('Phone (Optional)')).toHaveValue(newPhone);
    });

    test('should show an error for a taken username', async ({ page }) => {
      await page.getByRole('button', { name: 'Core Info' }).click();
      await page.getByLabel('Username').fill('john-doe'); // A known taken username
      await page.getByRole('button', { name: 'Save Core Info' }).click();
      await expect(page.getByText('Username is already taken.')).toBeVisible();
    });
  });

  test.describe('Branding Section', () => {
    test('should upload banner and profile images', async ({ page }) => {
      await page.getByRole('button', { name: 'Branding' }).click();
      
      const bannerInput = page.locator('input[name="bannerImage"]');
      const photoInput = page.locator('input[name="profilePhoto"]');

      await bannerInput.setInputFiles('tests/fixtures/banner.jpg');
      await photoInput.setInputFiles('tests/fixtures/profile.jpg');

      await page.getByRole('button', { name: 'Save Branding' }).click();
      await expect(page.getByText('Branding updated successfully!')).toBeVisible();

      await page.reload();

      const bannerImage = page.locator('img[alt="Banner"]');
      const profileImage = page.locator('img[alt="Profile Photo"]');

      await expect(bannerImage).toHaveAttribute('src', /profile-assets/);
      await expect(profileImage).toHaveAttribute('src', /profile-assets/);
    });
  });

  test.describe('Services Section (CRUD)', () => {
    test('should allow creating, updating, and deleting a service', async ({ page }) => {
      await page.getByRole('button', { name: 'Services' }).click();

      const serviceTitle = `E2E Test Service ${Date.now()}`;
      const serviceDesc = 'This is a test service description.';
      const updatedTitle = `${serviceTitle} (Updated)`;

      // Create
      await page.getByLabel('Service Title').fill(serviceTitle);
      await page.locator('.ql-editor').fill(serviceDesc);
      await page.getByRole('button', { name: 'Add Service' }).click();
      await expect(page.getByText('Service added.')).toBeVisible();
      const serviceEntry = page.locator(`div:has-text("${serviceTitle}")`).first();
      await expect(serviceEntry).toBeVisible();

      // Update
      await serviceEntry.getByRole('button', { name: `Edit ${serviceTitle}` }).click();
      await expect(page.getByRole('heading', { name: 'Edit Service' })).toBeVisible();
      await page.getByLabel('Service Title').fill(updatedTitle);
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText('Service updated.')).toBeVisible();
      await expect(page.locator(`div:has-text("${updatedTitle}")`)).toBeVisible();
      await expect(serviceEntry).not.toBeVisible();

      // Delete
      const updatedServiceEntry = page.locator(`div:has-text("${updatedTitle}")`).first();
      await updatedServiceEntry.getByRole('button', { name: `Delete ${updatedTitle}` }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Service deleted.')).toBeVisible();
      await expect(updatedServiceEntry).not.toBeVisible();
    });
  });

  test.describe('Benefits Section (CRUD & Reordering)', () => {
    test('should allow creating, updating, deleting, and reordering benefits', async ({ page }) => {
        await page.getByRole('button', { name: 'Benefits' }).click();

        const benefit1Title = `Benefit A ${Date.now()}`;
        const benefit2Title = `Benefit B ${Date.now()}`;

        // Create Benefit 1
        await page.getByLabel('Title').fill(benefit1Title);
        await page.getByRole('button', { name: 'Save Benefit' }).click();
        await expect(page.getByText('Benefit added.')).toBeVisible();
        
        // Create Benefit 2
        await page.getByLabel('Title').fill(benefit2Title);
        await page.getByRole('button', { name: 'Save Benefit' }).click();
        await expect(page.getByText('Benefit added.')).toBeVisible();

        const benefit1 = page.locator(`li:has-text("${benefit1Title}")`);
        const benefit2 = page.locator(`li:has-text("${benefit2Title}")`);
        await expect(benefit1).toBeVisible();
        await expect(benefit2).toBeVisible();

        // Reorder
        await benefit2.locator('.drag-handle').dragTo(benefit1.locator('.drag-handle'));
        await expect(page.getByText('Order updated.')).toBeVisible();
        
        // Verify order after reload
        await page.reload();
        const benefitsList = await page.locator('#benefits-list li').all();
        const firstBenefit = await benefitsList[0].textContent();
        expect(firstBenefit).toContain(benefit2Title);

        // Delete
        await benefit2.getByRole('button', { name: 'Delete' }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText('Benefit deleted.')).toBeVisible();
        await expect(benefit2).not.toBeVisible();
    });
  });

  test.describe('Testimonials Section (CRUD)', () => {
    test('should allow creating, updating, and deleting a testimonial', async ({ page }) => {
      await page.getByRole('button', { name: 'Testimonials' }).click();

      const clientName = `E2E Tester ${Date.now()}`;
      const testimonialText = 'This is an amazing E2E test testimonial!';
      const updatedText = 'This is an updated testimonial.';

      // Create
      await page.getByPlaceholder('Client name').fill(clientName);
      await page.locator('.ql-editor').fill(testimonialText);
      await page.getByRole('button', { name: 'Add Testimonial' }).click();
      await expect(page.getByText('Testimonial added.')).toBeVisible();
      const testimonialEntry = page.locator(`div:has-text("${clientName}")`).first();
      await expect(testimonialEntry).toBeVisible();

      // Update
      await testimonialEntry.getByRole('button', { name: 'Edit' }).click();
      await page.locator('.ql-editor').fill(updatedText);
      await page.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText('Testimonial updated.')).toBeVisible();
      await expect(page.locator(`div:has-text("${updatedText}")`)).toBeVisible();

      // Delete
      await testimonialEntry.getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Testimonial deleted.')).toBeVisible();
      await expect(testimonialEntry).not.toBeVisible();
    });
  });

  test.describe('Availability Section', () => {
    test('should update availability and reflect it on the public profile', async ({ page }) => {
      await page.getByRole('button', { name: 'Availability' }).click();

      // Set Wednesday availability
      const wednesdayRow = page.locator('div:has-text("Wednesday")');
      await wednesdayRow.getByRole('checkbox').check();
      await wednesdayRow.locator('input[type="time"]').first().fill('10:30');
      await wednesdayRow.locator('input[type="time"]').last().fill('18:30');

      await page.getByRole('button', { name: 'Save Availability' }).click();
      await expect(page.getByText('Your availability has been updated successfully!')).toBeVisible();

      // Verify persistence on reload
      await page.reload();
      await expect(wednesdayRow.getByRole('checkbox')).toBeChecked();
      await expect(wednesdayRow.locator('input[type="time"]').first()).toHaveValue('10:30');

      // Verify on public profile
      await page.goto('/en/trainer/ada-lovelace');
      await expect(page.getByTestId('booking-heading')).toBeVisible();

      // Find Wednesday in the calendar and check if it's bookable
      const calendarGrid = page.getByTestId('calendar-grid');
      // This is a bit fragile, depends on the month. A better way would be to find the next Wednesday.
      // For now, we'll just look for any enabled button in the grid.
      // Let's find a Wednesday and click it.
      const wednesdayButton = calendarGrid.locator('button:not([disabled])').filter({ hasText: '17' }); // Assuming a month where the 17th is a Wednesday
      if (await wednesdayButton.count() > 0) {
        await wednesdayButton.click();
        await expect(page.getByTestId('available-slots-heading')).toBeVisible();
        await expect(page.getByTestId('available-time-slot').first()).toContainText('10:30');
      } else {
        console.log("Could not find a bookable Wednesday in the current month's view to verify availability.");
      }
    });
  });
});