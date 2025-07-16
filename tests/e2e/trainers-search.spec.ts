
import { test, expect } from '@playwright/test';

test.describe('Trainer Search, Sorting, and Map Interaction', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/trainers');
    await expect(page.getByTestId('trainers-heading')).toBeVisible({ timeout: 15000 });
  });

  test('should sort results correctly when sort control is used', async ({ page }) => {
    // This test assumes there are at least two trainers to see a change in order.
    const firstTrainerCard = page.getByTestId('trainer-card-container').first();
    const initialFirstTrainerName = await firstTrainerCard.getByTestId('trainer-card-name').textContent();
    
    expect(initialFirstTrainerName).not.toBeNull();

    // Change sort order to Name (Z-A)
    await page.getByTestId('sort-by-select').selectOption('name_desc');
    await page.waitForURL(/\/en\/trainers\?sortBy=name_desc/);

    // Verify the first trainer is different, indicating a re-sort
    const newFirstTrainerCard = page.getByTestId('trainer-card-container').first();
    const newFirstTrainerName = await newFirstTrainerCard.getByTestId('trainer-card-name').textContent();
    
    expect(newFirstTrainerName).not.toBeNull();
    expect(newFirstTrainerName).not.toBe(initialFirstTrainerName);
  });

  test('should display map markers and show a popup on click', async ({ page }) => {
    // Wait for the map and its tiles to be fully loaded
    await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 20000 });

    // Find the first marker on the map and click it
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    await expect(firstMarker, "Map marker not found on the page.").toBeVisible({ timeout: 10000 });
    await firstMarker.click();

    // A popup should become visible
    const popup = page.locator('.leaflet-popup');
    await expect(popup, "Map popup did not appear after clicking a marker.").toBeVisible();
    
    // The popup should contain a link with the trainer's name which links to their profile
    const popupLink = popup.getByTestId(/map-popup-link-/).first();
    await expect(popupLink).toHaveAttribute('href', /^\/en\/trainer\/.+/);
    const trainerNameInPopup = await popupLink.textContent();
    expect(trainerNameInPopup?.trim()).not.toBe('');
  });

  // This test depends on seeded data having a trainer with location "Łódź"
  // It's better suited for an environment with known test data.
  test('should allow searching by a normalized location from the homepage', async ({ page }) => {
    await page.goto('/en/');
    
    // Use the search form on the homepage
    await page.getByTestId('search-type-in-person').click();
    await page.getByTestId('search-location-input').fill('łódź');
    await page.getByTestId('search-submit-button').click();

    // Wait for navigation to the results page
    await page.waitForURL(/\/en\/trainers\?location=.*&type=in-person/);
    
    // Assert that at least one trainer card is visible
    const cardContainer = page.locator('[data-testid="trainer-card"]:has-text("Ada")').first();
    await expect(cardContainer).toBeVisible();
    
    // Assert that the location text on the card contains the original, non-normalized location name
    await expect(cardContainer).toContainText('Łódź', { ignoreCase: true });
  });

});