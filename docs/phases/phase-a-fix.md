# **UI/UX Overhaul: Final Polish & Consistency Pass**

## Phase 1: Unify Deletion Confirmation Modals

*   **Goal:** Eradicate all remaining direct delete actions and `window.confirm` calls, replacing them with the standardized `DeleteConfirmationModal`.

*   **Task 1.1: Refactor Core `useEditableListManager` Hook**
    - [x] **Task 1.1.1:** Modify `src/hooks/useEditableListManager.ts`. Remove the `window.confirm` call from the `handleDelete` function. The hook should now only be responsible for executing the `deleteAction` and updating state, while the calling component handles confirmation.

*   **Task 1.2: Implement Modals in Profile Editors**
    - [x] **Task 1.2.1:** In `src/components/profile/sections/ExternalLinksEditor.tsx`, import `useState` and `DeleteConfirmationModal`. The "Delete" button must now trigger the modal, which then calls `handleDelete` on confirm.
    - [x] **Task 1.2.2:** In `src/components/profile/sections/SocialLinksEditor.tsx`, apply the same modal confirmation pattern for all deletions.
    - [x] **Task 1.2.3:** In `src/components/profile/sections/ServicesEditor.tsx`, implement the `DeleteConfirmationModal` to confirm service deletions.
    - [x] **Task 1.2.4:** In `src/components/profile/sections/BenefitsEditor.tsx`, implement the `DeleteConfirmationModal` to confirm benefit deletions.

*   **Task 1.3: Implement Modals in Client Data Management**
    - [x] **Task 1.3.1:** In `src/hooks/useMeasurementManager.ts`, remove the `window.confirm` call from `handleDelete`.
    - [x] **Task 1.3.2:** In `src/components/clients/modules/ManageClientMeasurements.tsx`, implement the `DeleteConfirmationModal`, using the hook's `handleDelete` function as the `onConfirm` action.
    - [x] **Task 1.3.3:** In `src/hooks/useProgressPhotoManager.ts`, remove `window.confirm` from `handleDelete`.
    - [x] **Task 1.3.4:** In `src/components/clients/modules/ManageClientProgressPhotos.tsx`, implement the `DeleteConfirmationModal` for photo deletions.

## Phase 2: Standardize Form Feedback with Toasts

*   **Goal:** Replace all remaining inline success/error message `divs` with the `useServerActionToast` hook for consistent, non-blocking feedback.

*   **Task 2.1: Refactor Profile Editors**
    - [x] **Task 2.1.1:** In `src/components/profile/sections/BenefitsEditor.tsx`, use the `useServerActionToast` hook for add/update actions and remove the corresponding inline message `divs`.
    - [x] **Task 2.1.2:** In `src/components/profile/sections/ExternalLinksEditor.tsx`, use the `useServerActionToast` hook and remove the inline message `divs`.
    - [x] **Task 2.1.3:** In `src/components/profile/sections/ServicesEditor.tsx`, use the `useServerActionToast` hook and remove the inline message `divs`.
    - [x] **Task 2.1.4:** In `src/components/profile/sections/SocialLinksEditor.tsx`, use the `useServerActionToast` hook and remove the inline message `divs`.

*   **Task 2.2: Refactor Client Data Management Components**
    - [x] **Task 2.2.1:** In `src/components/clients/modules/ManageClientMeasurements.tsx`, use the `useServerActionToast` hook for both add and update states and remove the inline error `div`.
    - [x] **Task 2.2.2:** In `src/components/clients/modules/ManageClientSessionLogs.tsx`, use the `useServerActionToast` hook for form actions and remove the inline message `div`.
    - [x] **Task 2.2.3:** In `src/hooks/useSessionLogManager.ts`, remove the direct `toast` calls from the `handleDelete` function. The component-level modal's `onConfirm` handler should now be responsible for showing the toast after the async `handleDelete` completes.

## Phase 3: Final Verification & Cleanup

*   **Goal:** Ensure all legacy UI patterns have been eradicated and the application is consistent.

*   **Task 3.1: Codebase Sweep**
    - [x] **Task 3.1.1:** Perform a global search for `window.confirm` to ensure no instances remain.
    - [x] **Task 3.1.2:** Perform a global search for inline `state.error` and `state.success` message `divs` within forms and remove any that were missed.

*   **Task 3.2: Manual Verification**
    - [x] **Task 3.2.1:** Manually test every delete button in every section to verify the confirmation modal appears and functions correctly.
    - [x] **Task 3.2.2:** Manually test every form to verify that feedback is provided exclusively via toasts.
    - [x] **Task 3.2.3:** Test all refactored components in both light and dark modes to check for visual regressions.