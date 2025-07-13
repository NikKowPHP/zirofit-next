### Phase 1: Establish a Service Layer for Business Logic

The goal of this phase is to decouple business logic (database queries, data transformation) from the presentation layer (Server Actions, API Routes). We will centralize this logic in a new `src/lib/services` directory.

*   [x] **1.1: Create the Client Service**
    *   [x] Create a new file: `src/lib/services/clientService.ts`.
    *   [x] Move the data-fetching logic from `getTrainerClients`, `getClientById`, and `getClientDetails` in `src/app/clients/actions/client-actions.ts` into `clientService.ts`.
    *   [x] Move the core database operations for creating, updating, and deleting clients from the actions file into `clientService.ts`. The service functions should handle only the `prisma` calls.
    *   [x] Keep authorization checks and `revalidatePath`/`redirect` calls in the original action file for now.

*   [x] **1.2: Create the Profile & Booking Services**
    *   [x] Create `src/lib/services/profileService.ts`.
    *   [x] Move the logic from `getCurrentUserProfileData` in `src/app/profile/actions/_utils.ts` into `profileService.ts`.
    *   [x] Create `src/lib/services/bookingService.ts`.
    *   [x] Move the complex availability and overlap-checking logic from `createBooking` in `src/app/profile/actions/booking-actions.ts` into `bookingService.ts`.
    *   [x] Move `getTrainerSchedule` and `getTrainerBookings` into `bookingService.ts`.

*   [x] **1.3: Create the Dashboard Service**
    *   [x] Rename `src/lib/dashboard.ts` to `src/lib/services/dashboardService.ts` for consistency.
    *   [x] Update the import path in `src/app/api/dashboard/route.ts` to reflect the new file location.
    *   [x] Review `dashboardService.ts` to ensure all functions are pure and focused on data aggregation.

*   [x] **1.4: Create a Notification Service**
    *   [x] Create `src/lib/services/notificationService.ts`.
    *   [x] Extract the Resend email-sending logic from `createBooking` in `src/app/profile/actions/booking-actions.ts` into a `sendBookingConfirmationEmail` function in `notificationService.ts`.
    *   [x] Extract the milestone notification logic from `addSessionLog` in `src/app/clients/actions/log-actions.ts` into a `createMilestoneNotification` function in `notificationService.ts`.

---
### Phase 2: Refactor Server Actions to be Thin Controllers

Now that the business logic is in services, we'll refactor the Server Actions to be simple controllers that orchestrate calls to these services.

*   [x] **2.1: Refactor Client Server Actions**
    *   [x] In `src/app/clients/actions/client-actions.ts`, replace direct `prisma` calls with calls to the new `clientService`.
    *   [x] The `addClient` action should now: 1. Validate input, 2. Get user, 3. Call `clientService.createClient`, 4. Revalidate/Redirect.
    *   [x] Apply the same pattern to `updateClient` and `deleteClient`.

*   [x] **2.2: Refactor Profile Server Actions**
    *   [x] In `src/app/profile/actions/core-info-actions.ts`, `service-actions.ts`, etc., refactor each action to call its corresponding service function. The actions should not contain any direct `prisma` calls.
    *   [x] In `src/app/profile/actions/booking-actions.ts`, the `createBooking` action should now call `bookingService.createBooking` and then `notificationService.sendBookingConfirmationEmail`.

*   [x] **2.3: Refactor Client-Module Server Actions**
    *   [x] In `src/app/clients/actions/log-actions.ts`, refactor `addSessionLog` to use `notificationService.createMilestoneNotification`.
    *   [x] In `src/app/clients/actions/measurement-actions.ts` and `photo-actions.ts`, ensure any complex logic is moved to a service, and the actions remain thin.

---
### Phase 3: Enhance Component Modularity with Custom Hooks

To clean up client components and promote logic reuse, we will extract complex state management and side effects into custom hooks.

*   [x] **3.1: Create `useSessionLogManager` Hook**
    *   [x] Create a new file: `src/hooks/useSessionLogManager.ts`.
    *   [x] Move the state management (`useState`, `useEffect`) and form/delete handling logic from `src/components/clients/modules/ManageClientSessionLogs.tsx` into this new hook.
    *   [x] The hook should accept `initialSessionLogs` and `clientId` as props.
    *   [x] The hook should return `{ sessionLogs, handleDelete, isEditing, handleEdit, ... }`.
    *   [x] Refactor `ManageClientSessionLogs.tsx` to use the `useSessionLogManager` hook, making the component purely presentational.

*   [x] **3.2: Create Hooks for Other Management Components**
    *   [x] Apply the same pattern to `ManageClientMeasurements.tsx` by creating a `useMeasurementManager` hook.
    *   [x] Apply the same pattern to `ManageClientProgressPhotos.tsx` by creating a `useProgressPhotoManager` hook.

*   [x] **3.3: Refactor Profile Editor Sections**
    *   [x] Analyze the various editor components in `src/components/profile/sections/` (e.g., `ServicesEditor`, `ExternalLinksEditor`, `SocialLinksEditor`). They share a similar pattern of "add form + list of items".
    *   [x] Create a generic hook, e.g., `useEditableListManager`, that handles the common logic for adding, editing, updating, and deleting items optimistically.
    *   [x] Refactor `ServicesEditor.tsx`, `ExternalLinksEditor.tsx`, and `SocialLinksEditor.tsx` to use this new generic hook, drastically reducing duplicated code.

---
### Phase 4: Strengthen and Reorganize Tests

To ensure the refactoring is safe and maintainable, we will improve the testing structure.

*   [x] **4.1: Test the New Service Layer**
    *   [x] Create test files for each new service (e.g., `src/lib/services/clientService.test.ts`).
    *   [x] Move and adapt the existing test logic from `src/app/profile/actions/booking-actions.test.ts` to `src/lib/services/bookingService.test.ts`.
    *   [x] Write new unit tests for `clientService.ts`, covering all major functions (create, read, update, delete). Use the existing `prismaMock` for this.
    *   [x] Write unit tests for `dashboardService.ts` to verify data aggregation logic.

*   [x] **4.2: Test Custom Hooks**
    *   [x] Create test files for the new custom hooks (e.g., `src/hooks/useSessionLogManager.test.ts`).
    *   [x] Use `@testing-library/react`'s `renderHook` to test the behavior of the hooks in isolation.

*   [x] **4.3: Verify Component Tests**
    *   [x] Run the entire test suite (`npm test`) to ensure no existing component tests have been broken by the refactoring.
    *   [x] Review components like `ClientDetailView.tsx` and `ProfileEditorLayout.tsx` and add integration tests to confirm that tabbing/navigation still works correctly after their child components were refactored.
---
### Phase 5: Final Cleanup and Documentation

The final phase is to polish the codebase, ensuring consistency and clarity.

*   [x] **5.1: Add JSDoc Documentation**
    *   [x] Add JSDoc comments to all functions in the `src/lib/services` directory, explaining their purpose, parameters, and return values.
    *   [x] Add JSDoc comments to all new custom hooks.

*   [x] **5.2: Code Style and Linting**
    *   [x] Run `npx prettier --write .` to format the entire project.
    *   [x] Run `npm run lint -- --fix` to automatically fix any linting errors.

*   [x] **5.3: Final Review**
    *   [x] Manually review all changed files to ensure consistency in naming conventions and patterns.
    *   [x] Delete any old files or commented-out code blocks that are no longer necessary.
    *   [x] Confirm the application builds and runs correctly in a development environment.