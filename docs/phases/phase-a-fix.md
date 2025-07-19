This is an excellent step towards creating a robust and reliable testing environment. Using Docker for E2E tests ensures a clean, consistent database for every test run, eliminating flakiness caused by leftover data.

Here is my plan to implement this:

1.  **Add a new task to the test plan**: I will add a new "Phase 0" to the `E2E_TESTS.md` file to document the setup of the Dockerized testing environment and mark it as complete.
2.  **Install `dotenv-cli`**: This package is needed to load the new `.env.test` file when running scripts from `package.json`. I will add it to the `devDependencies`.
3.  **Create `docker-compose.yml`**: This file will define the PostgreSQL service that will be used exclusively for our E2E tests. It will be configured to run on a different port (`5433`) to avoid conflicts with any local development database.
4.  **Create `.env.test`**: This new environment file will contain the `DATABASE_URL` pointing to the Dockerized PostgreSQL instance, along with other necessary environment variables for the application to run in a test context.
5.  **Update `package.json`**: I will add a new script, `dev:test`, to run the Next.js development server using the `.env.test` configuration. I will also update the main `test:e2e` script to orchestrate the entire process: starting the Docker container, running database migrations, executing the Playwright tests, and finally, shutting down the container.
6.  **Update `playwright.config.ts`**: I will modify the `webServer` configuration to use the new `npm run dev:test` script, ensuring that Playwright starts the application connected to the correct test database.

This implementation will fully automate the setup and teardown of the E2E test environment.

### BASH COMMANDS
```bash
npm install --save-dev dotenv-cli
```
-------------------------------------------------------------------------------
### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: zirofit_test
    ports:
      - '5433:5432'
    volumes:
      - postgres_test_data:/var/lib/postgresql/data

volumes:
  postgres_test_data:
```
-------------------------------------------------------------------------------
### .env.test
```
```
-------------------------------------------------------------------------------
### package.json
```json
```
-------------------------------------------------------------------------------
### playwright.config.ts
```
```
-------------------------------------------------------------------------------
### E2E_TESTS.md
```markdown
# ✅ Playwright E2E Test Implementation Plan

This document outlines the atomic tasks required to implement a comprehensive End-to-End (E2E) testing suite for the ZIRO.FIT application using Playwright. The goal is to ensure all core user flows are tested, bugs are caught before deployment, and new features don't break existing functionality.

## Phase 0: Test Environment Setup

- [x] **Configure Docker for E2E Testing:**
    - [x] Create a `docker-compose.yml` file to define a PostgreSQL service for testing.
    - [x] Create a `.env.test` file with a `DATABASE_URL` pointing to the Docker container.
    - [x] Add `dotenv-cli` package to run scripts with the test environment.
    - [x] Create an `npm run dev:test` script to start the Next.js server with the test database.
    - [x] Update `playwright.config.ts` to use the `npm run dev:test` command for its `webServer`.
    - [x] Update the `npm run test:e2e` script to manage the Docker container lifecycle (up, migrate, test, down).

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

-   [x] **Test Case: Client Logs Their Own Workout**
    -   [x] Start authenticated as a client.
    -   [x] Navigate to `/client-dashboard/log-workout`.
    -   [x] Complete the form to log an exercise (similar to the trainer flow).
    -   [x] Assert the new exercise log appears in the history below the form.
    -   [x] Navigate to the "My Progress" tab and verify the chart data is present.

-   [x] **Test Case: Client Links to a Trainer**
    -   [x] Start authenticated as a client who is *not* linked to a trainer.
    -   [x] Navigate to a test trainer's public profile page (`/trainer/ada-lovelace`).
    -   [x] Assert the "Share My Data with..." button is visible.
    -   [x] Click the "Share My Data" button and confirm in the modal.
    -   [x] Assert a success toast appears.
    -   [x] Assert the button text changes to "Unlink from...".

-   [x] **Test Case: Verify Trainer Access**
    -   [x] Log in as the trainer (`ada@ziro.fit`).
    -   [x] Navigate to the `/clients` page.
    -   [x] Assert the newly linked client appears in the list with a "link" icon.
    -   [x] Click "Manage" on that client and verify you can see the workout data they logged themselves.

-   [x] **Test Case: Client Unlinks from a Trainer**
    -   [x] Start authenticated as the linked client.
    -   [x] Navigate to the trainer's profile again.
    -   [x] Click the "Unlink from..." button and confirm in the modal.
    -   [x] Assert a success toast appears and the button text reverts to "Share My Data...".

## Phase 5: Refinement & Cross-Cutting Concerns

-   [x] **Mobile Viewport Testing:**
    -   [x] Add a mobile configuration to `playwright.config.ts`.
    -   [x] Run the entire test suite against the mobile viewport to catch responsive design issues.
    -   [x] Add a specific test case in `dashboard.spec.ts` to verify the bottom navigation bar is visible on mobile and that clicking its links works correctly.
-   [x] **Code Cleanup:**
    -   [x] Refactor all test files to use the global authentication state where applicable.
    -   [x] Create helper functions for common actions (e.g., `login(page, role)`, `createClient(page, clientDetails)`).
    -   [x] Review all tests for clarity, remove redundant steps, and ensure robust selectors (`data-testid`) are used everywhere.
```