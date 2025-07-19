The user has provided a detailed plan for implementing a comprehensive E2E test suite. My first task is to implement the foundational step: configuring a global authentication state for Playwright.

My plan is as follows:

1.  **Create a new task file**: I will create a new file, `E2E_TESTS.md`, in the root directory to house the user's provided test plan.
2.  **Update the task file**: I will mark the first major task, "Configure Global Authentication State," and all its sub-tasks as complete (`[x]`) since I am implementing them now.
3.  **Create a global setup file**: I will create `tests/e2e/global.setup.ts`. This file will contain the logic to:
    *   Log in as the test trainer (`ada@ziro.fit`).
    *   Save the trainer's authentication state to `tests/e2e/.auth/trainer.json`.
    *   Register a new client user.
    *   Log in as the newly created client.
    *   Save the client's authentication state to `tests/e2e/.auth/client.json`.
4.  **Update Playwright configuration**: I will modify `playwright.config.ts` to:
    *   Change the `testDir` to point specifically to the `tests/e2e` directory.
    *   Define a `setup` project that runs only the `global.setup.ts` file.
    *   Define new `trainer` and `client` projects that use the saved authentication state files and depend on the `setup` project.
    *   Ensure existing and new test projects ignore the setup file during normal test runs.
5.  **Update `.gitignore`**: I will add the new `tests/e2e/.auth/` directory to `.gitignore` to ensure authentication state files are not committed to version control.
6.  **Create auth directory**: I will add a BASH command to create the `tests/e2e/.auth` directory.

This will establish a robust foundation for the rest of the E2E tests, making them faster and more reliable by allowing them to start in a pre-authenticated state.

### BASH COMMANDS
```bash
mkdir -p "tests/e2e/.auth"
```
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

-   [ ] **Create a New Test File: `authentication.spec.ts`**
    -   [ ] Move the existing registration test from `auth.spec.ts` into this new file.
    -   [ ] **Test Case: Trainer Login Success**
        -   [ ] Navigate to the `/auth/login` page.
        -   [ ] Fill in valid trainer credentials.
        -   [ ] Click the "Log In" button.
        -   [ ] Assert that the page redirects to `/dashboard`.
        -   [ ] Assert that a "Dashboard" heading is visible.
    -   [ ] **Test Case: Trainer Login Failure**
        -   [ ] Navigate to the `/auth/login` page.
        -   [ ] Fill in an invalid password.
        -   [ ] Click the "Log In" button.
        -   [ ] Assert that an error message (e.g., "Invalid credentials") is displayed.
        -   [ ] Assert that the URL is still `/auth/login`.
    -   [ ] **Test Case: Client Registration & Login**
        -   [ ] Create a test for a new user registering with the "Client" role.
        -   [ ] Assert the user is redirected to the login page with a success message.
        -   [ ] Log in as the new client.
        -   [ ] Assert the user is redirected to the `/client-dashboard`.
    -   [ ] **Test Case: Logout Flow**
        -   [ ] Start the test in a logged-in state (using the global setup).
        -   [ ] Navigate to the `/dashboard`.
        -   [ ] Click the "Log Out" button.
        -   [ ] Assert the user is redirected to the `/auth/login` page with a "Logged out successfully" message.

## Phase 2: Trainer Dashboard - Comprehensive Profile Management

This is a critical, multi-section feature that needs thorough testing. Create a new test file: `profile-management.spec.ts`. All tests in this file should start authenticated as a trainer.

-   [ ] **Test Group: Core Info Section**
    -   [ ] Navigate to `/profile/edit`.
    -   [ ] Click on the "Core Info" sidebar link.
    -   [ ] Update the "Full Name" field and save. Assert the change is persistent after a page reload and a success toast appears.
    -   [ ] Attempt to update the "Username" to an already taken value. Assert an inline error message appears.
    -   [ ] Update the "Username" to a unique value and save. Assert the change persists.
    -   [ ] Update "Certifications", "Location", and "Phone" fields. Save and assert changes persist.

-   [ ] **Test Group: Branding Section**
    -   [ ] Navigate to `/profile/edit` and select the "Branding" section.
    -   [ ] Use `setInputFiles` to upload a test banner image (`tests/fixtures/banner.jpg`).
    -   [ ] Use `setInputFiles` to upload a test profile photo (`tests/fixtures/profile.jpg`).
    -   [ ] Click "Save Branding" and assert a success toast appears.
    -   [ ] Reload the page and verify the new images are displayed (check `src` attributes).

-   [ ] **Test Group: Services Section (CRUD)**
    -   [ ] Navigate to `/profile/edit` and select the "Services" section.
    -   [ ] **Create:** Fill in the title and description for a new service and click "Add Service". Assert it appears in the list below.
    -   [ ] **Update:** Click the "Edit" button on the new service. Modify the title and description, then click "Save Changes". Assert the list updates with the new information.
    -   [ ] **Delete:** Click the "Delete" button on the service. Confirm the action in the modal. Assert the service is removed from the list.

-   [ ] **Test Group: Benefits Section (CRUD & Reordering)**
    -   [ ] Navigate to `/profile/edit` and select the "Benefits" section.
    -   [ ] Test the full Create, Update, and Delete flow for a benefit, similar to the Services test.
    -   [ ] **Reorder:** Implement a drag-and-drop test to change the order of two benefits and verify the order is persistent after a page reload.

-   [ ] **Test Group: Testimonials Section (CRUD)**
    -   [ ] Navigate to `/profile/edit` and select the "Testimonials" section.
    -   [ ] Test the full Create, Update, and Delete flow for a testimonial.

-   [ ] **Test Group: Availability Section**
    -   [ ] Navigate to `/profile/edit` and select the "Availability" section.
    -   [ ] Toggle a day (e.g., Wednesday) to be available.
    -   [ ] Change the start and end times for that day.
    -   [ ] Click "Save Availability" and assert success toast.
    -   [ ] Reload the page and verify the changes are persistent.
    -   [ ] Navigate to the public profile and verify the calendar reflects the new availability.

## Phase 3: Trainer Dashboard - Client Management Lifecycle

Create a new test file: `client-management.spec.ts`. All tests start authenticated as a trainer.

-   [ ] **Test Case: Create a New Client**
    -   [ ] Navigate to `/clients/create`.
    -   [ ] Fill out the form with details for a new client (ensure the email does *not* exist as a user).
    -   [ ] Click "Create Client".
    -   [ ] Assert the page redirects to `/clients`.
    -   [ ] Assert the new client's card is visible in the grid.

-   [ ] **Test Group: Client Detail Page & Logging**
    -   [ ] From the `/clients` page, click the "Manage" button on a test client.
    -   [ ] Assert navigation to the client's detail page (`/clients/[clientId]`).
    -   [ ] **Log a Measurement:**
        -   [ ] Navigate to the "Measurements" tab.
        -   [ ] Fill in the form to add a new measurement (e.g., weight).
        -   [ ] Click "Add Measurement".
        -   [ ] Assert the new measurement appears in the list below.
    -   [ ] **Log a Session:**
        -   [ ] Navigate to the "Session Logs" tab.
        -   [ ] Fill in the form to add a new session log.
        -   [ ] Click "Add Session Log".
        -   [ ] Assert the new log appears in the history.
    -   [ ] **Log an Exercise:**
        -   [ ] Navigate to the "Exercise Performance" tab.
        -   [ ] Type an exercise name (e.g., "Squat") and select it from the search results.
        -   [ ] Add at least two sets with reps and weight.
        -   [ ] Click "Add Log".
        -   [ ] Assert a new card for that exercise appears in the history.
    -   [ ] **Upload a Photo:**
        -   [ ] Navigate to the "Progress Photos" tab.
        -   [ ] Upload a test photo.
        -   [ ] Click "Add Photo".
        -   [ ] Assert the new photo appears in the gallery.

-   [ ] **Test Case: Edit a Client**
    -   [ ] From the `/clients` page, click the "Edit" button on a test client.
    -   [ ] Change the client's name and status.
    -   [ ] Click "Update Client".
    -   [ ] Assert redirection to `/clients` and that the client's card reflects the changes.

-   [ ] **Test Case: Delete a Client**
    -   [ ] From the `/clients` page, click the "Delete" button on a test client.
    -   [ ] Confirm the deletion in the modal.
    -   [ ] Assert the client's card is no longer visible on the `/clients` page.

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
### tests/e2e/global.setup.ts
```
```
-------------------------------------------------------------------------------
### playwright.config.ts
```typescript
```
-------------------------------------------------------------------------------
### .gitignore
```
```