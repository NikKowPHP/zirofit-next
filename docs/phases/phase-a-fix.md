I will now implement the E2E tests for the "Client Management Lifecycle" as outlined in the user's request.

My plan is as follows:

1.  **Update Task List**: I will mark all tasks and sub-tasks under "Phase 3: Trainer Dashboard - Client Management Lifecycle" in `E2E_TESTS.md` as complete (`[x]`).
2.  **Create New Test File**: I will create the file `tests/e2e/client-management.spec.ts`.
3.  **Implement a Comprehensive Test Flow**: To ensure efficiency and accurately mirror a user's journey, I will create a single, sequential test case within the new file. This test will cover the entire lifecycle of a client:
    *   It will start by creating a new client with a unique email.
    *   Then, it will navigate to the new client's detail page to log a measurement, a session, an exercise, and upload a progress photo, asserting the success of each action.
    *   Next, it will edit the client's details and verify the changes.
    *   Finally, it will delete the client and confirm their removal from the client list.
    *   All tests will run in an authenticated trainer state, as defined by the Playwright project configuration.

This approach ensures that all CRUD (Create, Read, Update, Delete) operations for a client and their associated data are thoroughly tested in a logical, end-to-end flow.

-------------------------------------------------------------------------------
### E2E_TESTS.md
```markdown
# ✅ Playwright E2E Test Implementation Plan

This document outlines the atomic tasks required to implement a comprehensive End-to-End (E2E) testing suite for the ZIRO.FIT application using Playwright. The goal is to ensure all core user flows are tested, bugs are caught before deployment, and new features don't break existing functionality.

## Phase 1: Setup & Foundational Tests

This phase focuses on improving the test environment and expanding the most critical user flow: authentication.

-   [x] **Configure Global Authentication State:**
    -   [x] Create a global setup file in Playwright (`global.setup.ts`).
    -   [x] In the setup file, programmatically log in as a test trainer (`ada@ziro.fit`) and a new test client.
    -   [x] Save the authentication state (cookies, local storage) to files (e.g., `trainerAuth.json`, `clientAuth.json`).
    -   [x] Update `playwright.config.ts` to use this global setup. This will allow tests to start in a logged-in state, making them faster and more reliable.

-   [x] **Create a New Test File: `authentication.spec.ts`**
    -   [x] Move the existing registration test from `auth.spec.ts` into this new file.
    -   [x] **Test Case: Trainer Login Success**
        -   [x] Navigate to the `/auth/login` page.
        -   [x] Fill in valid trainer credentials.
        -   [x] Click the "Log In" button.
        -   [x] Assert that the page redirects to `/dashboard`.
        -   [x] Assert that a "Dashboard" heading is visible.
    -   [x] **Test Case: Trainer Login Failure**
        -   [x] Navigate to the `/auth/login` page.
        -   [x] Fill in an invalid password.
        -   [x] Click the "Log In" button.
        -   [x] Assert that an error message (e.g., "Invalid credentials") is displayed.
        -   [x] Assert that the URL is still `/auth/login`.
    -   [x] **Test Case: Client Registration & Login**
        -   [x] Create a test for a new user registering with the "Client" role.
        -   [x] Assert the user is redirected to the login page with a success message.
        -   [x] Log in as the new client.
        -   [x] Assert the user is redirected to the `/client-dashboard`.
    -   [x] **Test Case: Logout Flow**
        -   [x] Start the test in a logged-in state (using the global setup).
        -   [x] Navigate to the `/dashboard`.
        -   [x] Click the "Log Out" button.
        -   [x] Assert the user is redirected to the `/auth/login` page with a "Logged out successfully" message.

## Phase 2: Trainer Dashboard - Comprehensive Profile Management

This is a critical, multi-section feature that needs thorough testing. Create a new test file: `profile-management.spec.ts`. All tests in this file should start authenticated as a trainer.

-   [x] **Test Group: Core Info Section**
    -   [x] Navigate to `/profile/edit`.
    -   [x] Click on the "Core Info" sidebar link.
    -   [x] Update the "Full Name" field and save. Assert the change is persistent after a page reload and a success toast appears.
    -   [x] Attempt to update the "Username" to an already taken value. Assert an inline error message appears.
    -   [x] Update the "Username" to a unique value and save. Assert the change persists.
    -   [x] Update "Certifications", "Location", and "Phone" fields. Save and assert changes persist.

-   [x] **Test Group: Branding Section**
    -   [x] Navigate to `/profile/edit` and select the "Branding" section.
    -   [x] Use `setInputFiles` to upload a test banner image (`tests/fixtures/banner.jpg`).
    -   [x] Use `setInputFiles` to upload a test profile photo (`tests/fixtures/profile.jpg`).
    -   [x] Click "Save Branding" and assert a success toast appears.
    -   [x] Reload the page and verify the new images are displayed (check `src` attributes).

-   [x] **Test Group: Services Section (CRUD)**
    -   [x] Navigate to `/profile/edit` and select the "Services" section.
    -   [x] **Create:** Fill in the title and description for a new service and click "Add Service". Assert it appears in the list below.
    -   [x] **Update:** Click the "Edit" button on the new service. Modify the title and description, then click "Save Changes". Assert the list updates with the new information.
    -   [x] **Delete:** Click the "Delete" button on the service. Confirm the action in the modal. Assert the service is removed from the list.

-   [x] **Test Group: Benefits Section (CRUD & Reordering)**
    -   [x] Navigate to `/profile/edit` and select the "Benefits" section.
    -   [x] Test the full Create, Update, and Delete flow for a benefit, similar to the Services test.
    -   [x] **Reorder:** Implement a drag-and-drop test to change the order of two benefits and verify the order is persistent after a page reload.

-   [x] **Test Group: Testimonials Section (CRUD)**
    -   [x] Navigate to `/profile/edit` and select the "Testimonials" section.
    -   [x] Test the full Create, Update, and Delete flow for a testimonial.

-   [x] **Test Group: Availability Section**
    -   [x] Navigate to `/profile/edit` and select the "Availability" section.
    -   [x] Toggle a day (e.g., Wednesday) to be available.
    -   [x] Change the start and end times for that day.
    -   [x] Click "Save Availability" and assert success toast.
    -   [x] Reload the page and verify the changes are persistent.
    -   [x] Navigate to the public profile and verify the calendar reflects the new availability.

## Phase 3: Trainer Dashboard - Client Management Lifecycle

Create a new test file: `client-management.spec.ts`. All tests start authenticated as a trainer.

-   [x] **Test Case: Create a New Client**
    -   [x] Navigate to `/clients/create`.
    -   [x] Fill out the form with details for a new client (ensure the email does *not* exist as a user).
    -   [x] Click "Create Client".
    -   [x] Assert the page redirects to `/clients`.
    -   [x] Assert the new client's card is visible in the grid.

-   [x] **Test Group: Client Detail Page & Logging**
    -   [x] From the `/clients` page, click the "Manage" button on a test client.
    -   [x] Assert navigation to the client's detail page (`/clients/[clientId]`).
    -   [x] **Log a Measurement:**
        -   [x] Navigate to the "Measurements" tab.
        -   [x] Fill in the form to add a new measurement (e.g., weight).
        -   [x] Click "Add Measurement".
        -   [x] Assert the new measurement appears in the list below.
    -   [x] **Log a Session:**
        -   [x] Navigate to the "Session Logs" tab.
        -   [x] Fill in the form to add a new session log.
        -   [x] Click "Add Session Log".
        -   [x] Assert the new log appears in the history.
    -   [x] **Log an Exercise:**
        -   [x] Navigate to the "Exercise Performance" tab.
        -   [x] Type an exercise name (e.g., "Squat") and select it from the search results.
        -   [x] Add at least two sets with reps and weight.
        -   [x] Click "Add Log".
        -   [x] Assert a new card for that exercise appears in the history.
    -   [x] **Upload a Photo:**
        -   [x] Navigate to the "Progress Photos" tab.
        -   [x] Upload a test photo.
        -   [x] Click "Add Photo".
        -   [x] Assert the new photo appears in the gallery.

-   [x] **Test Case: Edit a Client**
    -   [x] From the `/clients` page, click the "Edit" button on a test client.
    -   [x] Change the client's name and status.
    -   [x] Click "Update Client".
    -   [x] Assert redirection to `/clients` and that the client's card reflects the changes.

-   [x] **Test Case: Delete a Client**
    -   [x] From the `/clients` page, click the "Delete" button on a test client.
    -   [x] Confirm the deletion in the modal.
    -   [x] Assert the client's card is no longer visible on the `/clients` page.

## Phase 4: Client Dashboard & Data Sharing Flow

Create a new test file: `data-sharing.spec.ts`.

-   [ ] **Test Case: Client Logs Their Own Workout**
    -   [ ] Start authenticated as a client.
    -   [ ] Navigate to `/client-dashboard/log-workout`.
    -   [ ] Complete the form to log an exercise (similar to the trainer flow).
    -   [ ] Assert the new exercise log appears in the history below the form.
    -   [ ] Navigate to the "My Progress" tab and verify the chart data is present.

-   [ ] **Test Case: Client Links to a Trainer**
    -   [ ] Start authenticated as a client who is *not* linked to a trainer.
    -   [ ] Navigate to a test trainer's public profile page (`/trainer/ada-lovelace`).
    -   [ ] Assert the "Share My Data with..." button is visible.
    -   [ ] Click the "Share My Data" button and confirm in the modal.
    -   [ ] Assert a success toast appears.
    -   [ ] Assert the button text changes to "Unlink from...".

-   [ ] **Test Case: Verify Trainer Access**
    -   [ ] Log in as the trainer (`ada@ziro.fit`).
    -   [ ] Navigate to the `/clients` page.
    -   [ ] Assert the newly linked client appears in the list with a "link" icon.
    -   [ ] Click "Manage" on that client and verify you can see the workout data they logged themselves.

-   [ ] **Test Case: Client Unlinks from a Trainer**
    -   [ ] Start authenticated as the linked client.
    -   [ ] Navigate to the trainer's profile again.
    -   [ ] Click the "Unlink from..." button and confirm in the modal.
    -   [ ] Assert a success toast appears and the button text reverts to "Share My Data...".

## Phase 5: Refinement & Cross-Cutting Concerns

-   [ ] **Mobile Viewport Testing:**
    -   [ ] Add a mobile configuration to `playwright.config.ts`.
    -   [ ] Run the entire test suite against the mobile viewport to catch responsive design issues.
    -   [ ] Add a specific test case in `dashboard.spec.ts` to verify the bottom navigation bar is visible on mobile and that clicking its links works correctly.
-   [ ] **Code Cleanup:**
    -   [ ] Refactor all test files to use the global authentication state where applicable.
    -   [ ] Create helper functions for common actions (e.g., `login(page, role)`, `createClient(page, clientDetails)`).
    -   [ ] Review all tests for clarity, remove redundant steps, and ensure robust selectors (`data-testid`) are used everywhere.
```
-------------------------------------------------------------------------------
### tests/e2e/client-management.spec.ts
```typescript
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard - Client Management Lifecycle', () => {
  // All tests in this file use the authenticated trainer state.
  test.use({ storageState: 'tests/e2e/.auth/trainer.json' });

  test('should handle the full lifecycle of a client', async ({ page }) => {
    const clientName = `E2E Client ${Date.now()}`;
    const clientEmail = `e2e.client.${Date.now()}@example.com`;
    const clientPhone = '1234567890';

    // --- 1. Create a New Client ---
    await page.goto('/en/clients/create');
    await expect(page.getByRole('heading', { name: 'Create Client' })).toBeVisible();
    await page.getByLabel('Name').fill(clientName);
    await page.getByLabel('Email').fill(clientEmail);
    await page.getByLabel('Phone').fill(clientPhone);
    await page.getByRole('button', { name: 'Create Client' }).click();

    // Assert redirection and visibility of the new client
    await expect(page).toHaveURL('/en/clients');
    const clientCard = page.locator(`div:has-text("${clientName}")`).first();
    await expect(clientCard).toBeVisible();

    // --- 2. Manage Client & Log Data ---
    await clientCard.getByRole('button', { name: 'Manage' }).click();
    await expect(page.getByRole('heading', { name: clientName })).toBeVisible();

    // Log a Measurement
    await page.getByRole('button', { name: 'Measurements' }).click();
    await page.locator('input[name="measurementDate"]').fill('2025-01-01');
    await page.locator('input[name="weightKg"]').fill('80');
    await page.getByRole('button', { name: 'Add Measurement' }).click();
    await expect(page.getByText('Measurement added.')).toBeVisible();
    await expect(page.getByText('Weight (kg): 80')).toBeVisible();

    // Log a Session
    await page.getByRole('button', { name: 'Session Logs' }).click();
    await page.locator('input[name="sessionDate"]').fill('2025-01-01');
    await page.locator('input[name="durationMinutes"]').fill('60');
    await page.locator('textarea[name="activitySummary"]').fill('E2E Test Session');
    await page.getByRole('button', { name: 'Add Session Log' }).click();
    await expect(page.getByText('Session log added.')).toBeVisible();
    await expect(page.getByText('E2E Test Session')).toBeVisible();

    // Log an Exercise
    await page.getByRole('button', { name: 'Exercise Performance' }).click();
    await page.getByPlaceholder('Search for an exercise...').fill('Squat');
    await page.getByText('Barbell Squat').click();
    await page.locator('input[name="logDate"]').fill('2025-01-01');
    await page.locator('input[placeholder="Reps"]').first().fill('10');
    await page.locator('input[placeholder="Weight (kg)"]').first().fill('100');
    await page.getByRole('button', { name: 'Add Set' }).click();
    await page.locator('input[placeholder="Reps"]').nth(1).fill('8');
    await page.locator('input[placeholder="Weight (kg)"]').nth(1).fill('110');
    await page.getByRole('button', { name: 'Add Log' }).click();
    await expect(page.getByText('Exercise log added.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Barbell Squat' })).toBeVisible();

    // Upload a Photo
    await page.getByRole('button', { name: 'Progress Photos' }).click();
    await page.locator('input[name="photoDate"]').fill('2025-01-01');
    await page.locator('input[name="photo"]').setInputFiles('tests/fixtures/profile.jpg');
    await page.getByRole('button', { name: 'Add Photo' }).click();
    await expect(page.getByText('Photo added successfully.')).toBeVisible();
    await expect(page.locator('img[alt=""]')).toBeVisible();

    // --- 3. Edit the Client ---
    await page.goto('/en/clients');
    await clientCard.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Client' })).toBeVisible();

    const updatedClientName = `${clientName} (Updated)`;
    await page.getByLabel('Name').fill(updatedClientName);
    await page.locator('select[name="status"]').selectOption('inactive');
    await page.getByRole('button', { name: 'Update Client' }).click();

    await expect(page).toHaveURL('/en/clients');
    const updatedClientCard = page.locator(`div:has-text("${updatedClientName}")`).first();
    await expect(updatedClientCard).toBeVisible();
    await expect(updatedClientCard.getByText('inactive')).toBeVisible();

    // --- 4. Delete the Client ---
    await updatedClientCard.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Client deleted.')).toBeVisible();
    await expect(updatedClientCard).not.toBeVisible();
  });
});
```