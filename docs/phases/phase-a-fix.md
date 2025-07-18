
### Part 1: Analysis & Discovery
*(Tasks to fully understand the current state before writing any code.)*
- [x] **Identify Key Files:**
    -   **Page Navigation & Data Fetching:** `src/app/[locale]/dashboard/page.tsx`, `src/app/[locale]/dashboard/DashboardContent.tsx`, `src/lib/services/dashboardService.ts`, `src/app/api/dashboard/route.ts`.
    -   **Client-Side State Management & Actions (Optimistic UI):** `src/hooks/useEditableListManager.ts`, `src/hooks/useSessionLogManager.ts`, `src/hooks/useMeasurementManager.ts`, `src/hooks/useProgressPhotoManager.ts`, `src/hooks/useExerciseLogManager.ts`.
    -   **Action Handlers (for adding loading/disabled states):** All files in `src/components/profile/sections/`, `src/components/clients/modules/`, `src/app/[locale]/auth/login/page.client.tsx`, `src/app/[locale]/auth/register/page.client.tsx`.
    -   **Tab Switching Logic:** `src/components/clients/ClientDetailView.tsx`.
- [x] **Map Data/State Flow:**
    -   **Dashboard:** Trace the current flow: `page.tsx` (Server) -> `DashboardContent.tsx` (Client) -> `useSWR` -> `/api/dashboard` (API Route) -> `dashboardService.ts` -> Prisma. Note the extra client-server roundtrip for the initial view.
    -   **CRUD Actions (e.g., Services):** Trace the current flow: `ServicesEditor.tsx` (Client) -> `addService` (Server Action) -> `profileService.ts` -> Prisma. Note that the UI update in `useEditableListManager.ts` is pessimistic (waits for server response).
    -   **Button States:** Audit forms to identify where `useFormStatus` is used versus where it is missing, leading to inconsistent user feedback.
- [x] **Pinpoint Logic:**
    -   **Sequential Queries:** Locate the series of sequential `await` calls in `getDashboardData` within `src/lib/services/dashboardService.ts`.
    -   **Pessimistic UI Updates:** Isolate the `useEffect` blocks in `useEditableListManager.ts` that react to `addState` and `updateState`. Pinpoint the `handleDelete` function that awaits the server action before updating local state.
    -   **State Updates on Tab Click:** Identify the synchronous `setActiveTab` call in the tab click handler within `src/components/clients/ClientDetailView.tsx`.
- [x] **Analyze Bundle Size:**
    -   [x] Integrate `@next/bundle-analyzer` to generate a visual report of the application's JavaScript bundles. Identify any unexpectedly large dependencies in the initial client-side bundle.

### Part 2: Core Logic Implementation
*(The primary "happy path" implementation tasks.)*
- [x] **State Management:**
    -   [x] In `useEditableListManager.ts` (and apply pattern to other `use...Manager` hooks), refactor `handleDelete` to store the original list state, update the UI state immediately, then `await` the server action.
    -   [ ] In `useEditableListManager.ts`, refactor the add logic: generate a temporary client-side ID for the new item, add it to the local state immediately, then call the server action.
    -   [ ] In the `useEffect` that handles the successful response from the `add...` action, implement logic to find the item with the temporary ID in the local state and replace it with the final item (containing the real database ID) returned from the server.
- [x] **Component Logic:**
    -   [x] In `src/app/[locale]/dashboard/page.tsx`, move the data fetching logic from `DashboardContent.tsx` here. Call `getDashboardData` directly on the server.
    -   [x] In `src/app/[locale]/dashboard/DashboardContent.tsx`, refactor the component to accept `initialData` as a prop and pass it to `useSWR`'s `fallbackData` option.
    -   [x] In `src/components/clients/ClientDetailView.tsx`, import `useTransition` from React. Wrap the `setActiveTab` state update inside a `startTransition` call.
- [x] **API/Service Logic:**
    -   [x] In `src/lib/services/dashboardService.ts`, refactor the `getDashboardData` function to use `prisma.$transaction([...])` to execute all independent data-fetching queries in parallel.
    -   [x] Ensure all server actions that create a new database entry (e.g., `addService`, `addBenefit`) return the complete, newly created object.

### Part 3: UI/UX & Polish
*(Tasks to ensure the feature feels good to use, not just functional.)*
- [ ] **Loading States:**
    -   [ ] In all forms that use a Server Action, ensure the main submit button uses `useFormStatus` to show a pending state (e.g., text changes to "Saving...", spinner appears).
    -   [ ] In `ClientDetailView.tsx`, use the `isPending` state from `useTransition` to apply a subtle opacity change to the tab content area (`<div style={{ opacity: isPending ? 0.5 : 1 }}>`) while the next tab is rendering.
    -   [ ] When implementing optimistic deletions, apply a temporary "dimmed" or "strikethrough" style to the list item before it's removed from the DOM to provide a clear visual cue of the pending action.
    -   [ ] Ensure skeleton loaders (`TrainersListSkeleton`, etc.) have a fixed `min-height` that approximates the height of the final content to prevent Cumulative Layout Shift (CLS).
- [ ] **Disabled States:**
    -   [ ] Universally apply the `pending` state from `useFormStatus` to disable submit buttons during form submission.
    -   [ ] In list components (`BenefitsEditor`, `ServicesEditor`, etc.), use a state variable like `deletingId` to disable the "Delete" and "Edit" buttons for a specific item while its deletion is in progress.
- [ ] **User Feedback:**
    -   [ ] Modify the optimistic `handleDelete` function to show a success toast only *after* the server confirms the deletion.
    -   [ ] If an optimistic update fails, show an error toast and ensure the UI reverts correctly to its original state.
- [ ] **Smooth Transitions:**
    -   [ ] Wrap list items that support optimistic deletion in `framer-motion`'s `<AnimatePresence>` and `<motion.div>` tags to provide a smooth exit animation (e.g., fade out).

### Part 4: Robustness & Edge Case Handling
*(Tasks to make the feature resilient to unexpected user behavior and system failures.)*
- [ ] **Handle API Errors:**
    -   [ ] In each `use...Manager` hook, implement a `try...catch` block around the server action call inside the optimistic update handler. On failure, revert the UI state to the pre-action state and display an error toast.
    -   [ ] For the server-side data fetching in `dashboard/page.tsx`, wrap the `getDashboardData` call in a `try...catch` block. If it fails, pass a specific error prop to `DashboardContent` and render an `ErrorState` component with a retry mechanism (`router.refresh()`).
- [ ] **Handle User Interruption:**
    -   [ ] The shift to server-side data fetching for initial loads naturally handles refresh interruptions well. This requires no extra implementation.
    -   [ ] For optimistic UI, the client-side state is lost on refresh, and the page will simply refetch the correct state from the server. This is the desired behavior and requires no extra implementation.
- [ ] **Handle Unexpected Navigation:**
    -   [ ] If a user navigates away while a server action is pending, the component will unmount. Ensure there are no state updates on unmounted components by using a mounted flag or a cleanup function in `useEffect`.
- [ ] **Input Validation:**
    -   [ ] The codebase already uses Zod for server-side validation. This plan does not introduce new inputs, so the primary task is to ensure existing validation schemas are maintained during refactoring.

### Part 5: Comprehensive Testing
*(A concrete plan to verify everything works as expected.)*
- [ ] **Unit Tests:**
    -   [ ] Update the test for `dashboardService` in `src/lib/services/dashboardService.test.ts` to mock `prisma.$transaction` and verify it's called with an array of Prisma promises.
- [ ] **Component Tests:**
    -   [ ] Update `src/app/[locale]/dashboard/DashboardContent.test.tsx` to test the new `initialData` prop. Verify it renders immediately without a skeleton state when the prop is provided.
    -   [ ] Create a test for a component using `useEditableListManager` (e.g., a new `BenefitsEditor.test.tsx`). Mock the `deleteBenefit` action. Trigger a delete, assert the item is removed from the UI *synchronously*, and then mock a failed server response to assert the item reappears.
    -   [ ] Test a form's submit button to ensure it enters a `disabled` and "loading" state when clicked, using a mocked `useFormStatus`.
- [ ] **End-to-End (E2E) Manual Test Plan:**
    -   [ ] **The "Happy Path" (the feature works perfectly under normal conditions).**
        -   [ ] Navigate from the homepage to the dashboard. Verify it loads quickly without a content skeleton.
        -   [ ] Navigate between Dashboard, Clients, and Profile pages. Confirm smooth and fast transitions.
        -   [ ] Go to a client's detail page and switch between the Statistics, Measurements, and Logs tabs. Verify the content loads and the UI remains responsive.
        -   [ ] Add a new Service in the profile editor. Verify it appears in the list instantly. Refresh the page and confirm it persists with the correct data.
        -   [ ] Delete a Testimonial. Verify it is removed from the list instantly with a fade-out animation. Refresh and confirm it's gone.
    -   [ ] **The "Error Paths" (verify all error-handling from Part 4 works).**
        -   [ ] Use browser dev tools to simulate a network failure for a `delete` action. Click delete, see the item disappear, then reappear after the network error, accompanied by an error toast.
        -   [ ] Use dev tools to block the `/api/dashboard` route. Navigate to the dashboard and verify an error state with a "Retry" button appears.
    -   [ ] **The "Interruption Paths" (verify all interruption-handling from Part 4 works).**
        -   [ ] Click to delete an item, and immediately refresh the page before the action completes. Verify the item is still present on page load (as the action never finished).

### Part 6: Cleanup & Finalization
*(The final tasks before merging.)*
- [ ] **Remove Temporary Code:**
    -   [ ] Search the entire project for any `console.log` statements used during development and remove them.
- [ ] **Code Review & Refactor:**
    -   [ ] Review all modified hooks (`use...Manager.ts`) to ensure the optimistic update and revert logic is consistent and clean.
    -   [ ] Ensure all form buttons now correctly implement loading/disabled states via `useFormStatus`.
    -   [ ] Verify that all internal navigation uses the Next.js `<Link>` component to enable prefetching, rather than `<a>` tags or unnecessary `router.push()` calls.
- [ ] **Remove Obsolete Flags/Code:**
    -   [ ] Evaluate if the `/api/dashboard` route is still necessary after moving data fetching server-side. If it's only used for SWR revalidation, confirm it's secure and cannot be exploited. Otherwise, remove it.
- [ ] **Documentation:**
    -   [ ] Add JSDoc comments to `useEditableListManager.ts` explaining the optimistic update pattern, including the temporary ID and state reconciliation logic.
    -   [ ] Add a comment in `dashboard/page.tsx` explaining why data is fetched on the server and passed down as a prop for performance reasons.

### src/app/[locale]/dashboard/DashboardContent.tsx
```
```
### src/app/[locale]/dashboard/page.tsx
```
```
### src/app/[locale]/profile/actions/benefit-actions.ts
```

```
### src/components/clients/ClientDetailView.tsx
```
```
### src/components/clients/modules/ManageClientExerciseLogs.tsx
```
```
### src/hooks/useEditableListManager.ts
```
```
### src/hooks/useExerciseLogManager.ts
```
```
### src/hooks/useMeasurementManager.ts
```
```
### src/hooks/useProgressPhotoManager.ts
```
```
### src/hooks/useSessionLogManager.ts
```
```
### src/lib/services/dashboardService.ts
```
```