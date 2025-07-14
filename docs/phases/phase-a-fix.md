Of course. I will update the plan to include these excellent, high-value features. They are a logical extension of the booking workflow and significantly improve the trainer's user experience.

The new tasks will be organized into a new **Phase 5**, ensuring a clear separation of concerns from the map and filter implementation. The plan is designed to integrate seamlessly with the existing notification system and codebase.

Here is the updated, comprehensive implementation plan:

```markdown
# Feature Implementation Plan: Map, Search, Filters & Booking Enhancements

This plan outlines the atomic tasks required to implement an interactive map, normalized location search, advanced filtering/sorting, and an enhanced booking workflow with Google Calendar integration and in-app notifications.

---

### Phase 1: Backend Foundation for Location & Geocoding

**Objective:** Enhance the database schema and backend logic to support normalized location searches and map coordinates.

*   [ ] **1.1: Enhance `Profile` Schema**
    *   [ ] Open `prisma/schema.prisma`.
    *   [ ] Add a `locationNormalized: String? @db.Text` field to the `Profile` model for case-insensitive, accent-insensitive searching.
    *   [ ] Add `latitude: Float?` and `longitude: Float?` fields to the `Profile` model to store geocoded coordinates.

*   [ ] **1.2: Update Database**
    *   [ ] Run `npx prisma migrate dev --name add_normalized_location_and_coords` to apply the schema changes.

*   [ ] **1.3: Create Location Normalization Utility**
    *   [ ] In `src/lib/utils.ts`, create a new function `normalizeLocation(location: string): string`.
    *   [ ] Implement the function to convert the input string to lowercase and replace Polish diacritics with their Latin equivalents (e.g., 'ł' -> 'l', 'ą' -> 'a').

*   [ ] **1.4: Integrate Geocoding and Normalization into Profile Updates**
    *   [ ] Create a new service file `src/lib/services/geocodingService.ts`.
    *   [ ] Inside, create a function `geocodeLocation(location: string): Promise<{latitude: number; longitude: number} | null>`. This function will call a free, public geocoding API.
    *   [ ] Open `src/app/profile/actions/core-info-actions.ts`.
    *   [ ] Modify the `updateCoreInfo` action to call `normalizeLocation` and `geocodeLocation` when the `location` field is updated, saving the results to the database.

*   [ ] **1.5: Backfill Data for Existing Trainers**
    *   [ ] Create a one-time script `prisma/seed-backfill-locations.ts` to update existing profiles with normalized locations and geocoded coordinates.
    *   [ ] Add an npm script in `package.json` to run this: `"db:backfill-locations": "npx ts-node --compiler-options '{\\\"module\\\":\\\"commonjs\\\"}' prisma/seed-backfill-locations.ts"`.

---

### Phase 2: Interactive Map Implementation

**Objective:** Replace the static map placeholder on the `/trainers` page with a live, interactive map displaying trainer locations.

*   [ ] **2.1: Install Mapping Library**
    *   [ ] Run `npm install leaflet react-leaflet`.
    *   [ ] Run `npm install -D @types/leaflet`.

*   [ ] **2.2: Update Trainer Fetching Logic**
    *   [ ] Open `src/lib/api/trainers.ts`.
    *   [ ] Modify the `getPublishedTrainers` function to select the `latitude` and `longitude` fields and to use `locationNormalized` for searching.

*   [ ] **2.3: Create the Map Component**
    *   [ ] Create a new file `src/components/trainers/TrainersMap.tsx`.
    *   [ ] This will be a client component (`"use client"`) that renders the map using `react-leaflet`, displaying a `Marker` for each trainer with a `Popup` linking to their profile.

*   [ ] **2.4: Integrate Map into Trainers Page**
    *   [ ] Open `src/app/trainers/page.tsx`.
    *   [ ] Dynamically import the `TrainersMap` component with `ssr: false` and replace the placeholder `div` with it.

---

### Phase 3: Filtering and Sorting Implementation

**Objective:** Add controls to the `/trainers` page to allow users to sort and filter the list of trainers.

*   [ ] **3.1: Enhance Backend for Sorting/Filtering**
    *   [ ] Open `src/lib/api/trainers.ts`.
    *   [ ] Modify `getPublishedTrainers` to accept a `sortBy` parameter and dynamically construct the `orderBy` clause for the Prisma query.

*   [ ] **3.2: Create UI for Sorting**
    *   [ ] Create a new client component `src/components/trainers/SortControl.tsx` that renders a dropdown and updates the URL's `sortBy` search parameter on change.

*   [ ] **3.3: Integrate Sorting into Trainers Page**
    *   [ ] Open `src/app/trainers/page.tsx`.
    *   [ ] Add the `SortControl` component and pass the `sortBy` search parameter to the `getPublishedTrainers` function.

*   [ ] **3.4: Design Polish for New UI Elements**
    *   [ ] Style all new components to match the HIG aesthetic (clean, ample padding, clear focus states).

---

### Phase 4: Comprehensive Testing (Part 1)

**Objective:** Verify the functionality of the map, search, and filter features.

*   [ ] **4.1: Unit & Integration Tests**
    *   [ ] Test the `normalizeLocation` utility.
    *   [ ] Expand tests for `getPublishedTrainers` to cover normalized location search and dynamic sorting.

*   [ ] **4.2: Component Tests (React Testing Library)**
    *   [ ] Test the `SortControl` component to ensure it correctly updates the URL.

*   [ ] **4.3: End-to-End Tests (Playwright)**
    *   [ ] Create `tests/e2e/trainers-search.spec.ts` to test normalized search, sorting, and basic map interaction (marker click).

---

### Phase 5: Booking Workflow Enhancements & Notifications

**Objective:** To improve the post-booking experience for trainers by adding 'Add to Google Calendar' functionality and real-time in-app notifications.

*   [ ] **5.1: Create Google Calendar Link Utility**
    *   [ ] Open `src/lib/utils.ts`.
    *   [ ] Create a new exported function `generateGoogleCalendarLink(booking: Booking)`.
    *   [ ] Implement the function to construct a URL (`https://www.google.com/calendar/render?action=TEMPLATE...`) with URL-encoded parameters:
        *   `text`: "Session with [Client Name]"
        *   `dates`: ISO 8601 format of `startTime`/`endTime`.
        *   `details`: Include client name, email, and notes.

*   [ ] **5.2: Implement In-App Booking Notification**
    *   [ ] Open `src/lib/services/notificationService.ts`.
    *   [ ] Create a new exported async function `createBookingNotification(trainerId: string, booking: Booking)`.
    *   [ ] Inside, call `prisma.notification.create` to save a new notification for the `trainerId` with a message like "New booking from [Client Name] on [Date]".
    *   [ ] Open `src/app/profile/actions/booking-actions.ts`.
    *   [ ] In the `createBooking` action, after the `createNewBooking` call is successful, add a call to `createBookingNotification(trainerId, booking)`.

*   [ ] **5.3: Add Calendar Link to Trainer's Email**
    *   [ ] Open `src/lib/services/notificationService.ts`.
    *   [ ] In the `sendBookingConfirmationEmail` function, locate the HTML content being generated for the *trainer's* email.
    *   [ ] Call the `generateGoogleCalendarLink` utility function.
    *   [ ] Add a styled button/link to the email's HTML: `<a href="[generated_url]" target="_blank">Add to Google Calendar</a>`.

*   [ ] **5.4: Add Calendar Link to Bookings Dashboard**
    *   [ ] Open `src/app/dashboard/bookings/page.tsx`.
    *   [ ] Import the `generateGoogleCalendarLink` utility from `@/lib/utils`.
    *   [ ] Inside the `map` function that renders each booking `div`, generate the calendar link for the current `booking`.
    *   [ ] Add a new `Button` component next to the booking details (e.g., `<Button asChild variant="secondary" size="sm">`).
    *   [ ] The button should contain a `Link` (`<a>` tag) with `href={calendarLink}` and `target="_blank"`. Label it "Add to Calendar".

*   [ ] **5.5: Comprehensive Testing (Part 2)**
    *   [ ] **Unit Test:** In `src/lib/utils.test.ts` (create if needed), add tests for `generateGoogleCalendarLink` to ensure the URL is correctly formatted and encoded.
    *   [ ] **Integration Test:**
        *   In `src/lib/services/notificationService.test.ts`, add a test for `createBookingNotification`.
        *   In `src/app/profile/actions/booking-actions.test.ts`, update the successful `createBooking` test to also assert that `createBookingNotification` was called.
    *   [ ] **E2E Test (Enhancement):**
        *   Create a test file `tests/e2e/dashboard.spec.ts`.
        *   The test will log in as a trainer, navigate to `/dashboard/bookings`, and assert that the "Add to Calendar" link exists and its `href` attribute is a valid Google Calendar URL. This confirms the frontend integration.
```