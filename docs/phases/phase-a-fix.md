### docs/phases/phase-a-fix.md
```
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
    -   [x] In `useEditableListManager.ts`, refactor the add logic: generate a temporary client-side ID for the new item, add it to the local state immediately, then call the server action.
    -   [x] In the `useEffect` that handles the successful response from the `add...` action, implement logic to find the item with the temporary ID in the local state and replace it with the final item (containing the real database ID) returned from the server.
- [x] **Component Logic:**
    -   [x] In `src/app/[locale]/dashboard/page.tsx`, move the data fetching logic from `DashboardContent.tsx` here. Call `getDashboardData` directly on the server.
    -   [x] In `src/app/[locale]/dashboard/DashboardContent.tsx`, refactor the component to accept `initialData` as a prop and pass it to `useSWR`'s `fallbackData` option.
    -   [x] In `src/components/clients/ClientDetailView.tsx`, import `useTransition` from React. Wrap the `setActiveTab` state update inside a `startTransition` call.
- [x] **API/Service Logic:**
    -   [x] In `src/lib/services/dashboardService.ts`, refactor the `getDashboardData` function to use `prisma.$transaction([...])` to execute all independent data-fetching queries in parallel.
    -   [x] Ensure all server actions that create a new database entry (e.g., `addService`, `addBenefit`) return the complete, newly created object.

### Part 3: UI/UX & Polish
*(Tasks to ensure the feature feels good to use, not just functional.)*
- [x] **Loading States:**
    -   [x] In all forms that use a Server Action, ensure the main submit button uses `useFormStatus` to show a pending state (e.g., text changes to "Saving...", spinner appears).
    -   [x] In `ClientDetailView.tsx`, use the `isPending` state from `useTransition` to apply a subtle opacity change to the tab content area (`<div style={{ opacity: isPending ? 0.5 : 1 }}>`) while the next tab is rendering.
    -   [x] When implementing optimistic deletions, apply a temporary "dimmed" or "strikethrough" style to the list item before it's removed from the DOM to provide a clear visual cue of the pending action.
    -   [x] Ensure skeleton loaders (`TrainersListSkeleton`, etc.) have a fixed `min-height` that approximates the height of the final content to prevent Cumulative Layout Shift (CLS).
- [x] **Disabled States:**
    -   [x] Universally apply the `pending` state from `useFormStatus` to disable submit buttons during form submission.
    -   [x] In list components (`BenefitsEditor`, `ServicesEditor`, etc.), use a state variable like `deletingId` to disable the "Delete" and "Edit" buttons for a specific item while its deletion is in progress.
- [x] **User Feedback:**
    -   [x] Modify the optimistic `handleDelete` function to show a success toast only *after* the server confirms the deletion.
    -   [x] If an optimistic update fails, show an error toast and ensure the UI reverts correctly to its original state.
- [x] **Smooth Transitions:**
    -   [x] Wrap list items that support optimistic deletion in `framer-motion`'s `<AnimatePresence>` and `<motion.div>` tags to provide a smooth exit animation (e.g., fade out).

### Part 4: Robustness & Edge Case Handling
*(Tasks to make the feature resilient to unexpected user behavior and system failures.)*
- [x] **Handle API Errors:**
    -   [x] In each `use...Manager` hook, implement a `try...catch` block around the server action call inside the optimistic update handler. On failure, revert the UI state to the pre-action state and display an error toast.
    -   [x] For the server-side data fetching in `dashboard/page.tsx`, wrap the `getDashboardData` call in a `try...catch` block. If it fails, pass a specific error prop to `DashboardContent` and render an `ErrorState` component with a retry mechanism (`router.refresh()`).
- [x] **Handle User Interruption:**
    -   [x] The shift to server-side data fetching for initial loads naturally handles refresh interruptions well. This requires no extra implementation.
    -   [x] For optimistic UI, the client-side state is lost on refresh, and the page will simply refetch the correct state from the server. This is the desired behavior and requires no extra implementation.
- [x] **Handle Unexpected Navigation:**
    -   [x] If a user navigates away while a server action is pending, the component will unmount. Ensure there are no state updates on unmounted components by using a mounted flag or a cleanup function in `useEffect`.
- [x] **Input Validation:**
    -   [x] The codebase already uses Zod for server-side validation. This plan does not introduce new inputs, so the primary task is to ensure existing validation schemas are maintained during refactoring.

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
```
### src/hooks/useEditableListManager.ts
```
import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";

type Item = { id: string; createdAt: Date; [key: string]: any };

type AddAction<T extends Item> = (
  prevState: any,
  formData: FormData,
) => Promise<any>;
type UpdateAction<T extends Item> = (
  prevState: any,
  formData: FormData,
) => Promise<any>;
type DeleteAction = (
  id: string,
) => Promise<{ success: boolean; deletedId?: string; error?: string; messageKey?: string }>;

interface UseEditableListProps<T extends Item> {
  initialItems: T[];
  addAction: AddAction<T>;
  updateAction: UpdateAction<T>;
  deleteAction: DeleteAction;
}

const initialActionState = { success: false };

/**
 * Manages the state and actions for a list of editable items.
 * Handles adding, updating, and deleting items with optimistic UI updates.
 * @template T The type of items in the list, must extend a base Item type.
 * @param {UseEditableListProps<T>} props - The initial items and server actions.
 * @returns An object containing the list state and handlers.
 */
export function useEditableList<T extends Item>({
  initialItems,
  addAction,
  updateAction,
  deleteAction,
}: UseEditableListProps<T>) {
  const [items, setItems] = useState<T[]>(() =>
    [...initialItems].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [addState, serverAddFormAction] = useFormState(addAction, initialActionState);
  const [updateState, updateFormAction] = useFormState(updateAction, initialActionState);
  const [optimisticTempId, setOptimisticTempId] = useState<string | null>(null);

  const isEditing = !!editingItemId;
  const currentEditingItem = isEditing
    ? items.find((item) => item.id === editingItemId)
    : null;

  const addFormAction = (formData: FormData) => {
    const tempId = `temp-${Date.now()}`;
    setOptimisticTempId(tempId);

    const tempItemData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        tempItemData[key] = value;
      }
    }

    const optimisticItem = {
      id: tempId,
      createdAt: new Date(),
      ...tempItemData,
    } as T;
    
    setItems((current) =>
      [...current, optimisticItem].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    
    serverAddFormAction(formData);
  };

  useEffect(() => {
    if (addState?.success) {
      const newItemKey = Object.keys(addState).find((k) => k.startsWith("new"));
      if (newItemKey && addState[newItemKey] && optimisticTempId) {
        const newItem = addState[newItemKey] as T;
        setItems((current) =>
          current.map((item) => (item.id === optimisticTempId ? newItem : item))
        );
        setOptimisticTempId(null);
        formRef.current?.reset();
      }
    } else if (addState?.error && optimisticTempId) {
      setItems((current) => current.filter((item) => item.id !== optimisticTempId));
      setOptimisticTempId(null);
    }
  }, [addState, optimisticTempId]);

  useEffect(() => {
    if (updateState?.success) {
      const updatedItemKey = Object.keys(updateState).find((k) =>
        k.startsWith("updated"),
      );
      if (updatedItemKey && updateState[updatedItemKey]) {
        const updatedItem = updateState[updatedItemKey] as T;
        setItems((current) =>
          current
            .map((item) => (item.id === updatedItem.id ? updatedItem : item))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
        );
        setEditingItemId(null);
      }
    }
  }, [updateState]);

  const handleEdit = (item: T) => setEditingItemId(item.id);
  const handleCancelEdit = () => setEditingItemId(null);

  const handleDelete = async (id: string) => {
    const originalItems = items;
    setDeletingId(id);
    setItems((current) => current.filter((i) => i.id !== id));

    try {
      const result = await deleteAction(id);
      
      if (!result.success) {
        if (isMounted.current) {
          setItems(originalItems);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete action failed:", error);
      if (isMounted.current) {
        setItems(originalItems);
      }
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
  };

  return {
    items,
    editingItemId,
    deletingId,
    formRef,
    addState,
    addFormAction,
    updateState,
    updateFormAction,
    isEditing,
    currentEditingItem,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  };
}
```
### src/hooks/useExerciseLogManager.ts
```
"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
  searchExercisesAction,
  type ExerciseLogFormState,
  type ClientExerciseLog,
  type Exercise,
} from "@/app/[locale]/clients/actions/exercise-log-actions";

interface UseExerciseLogManagerProps {
  initialExerciseLogs: ClientExerciseLog[];
  clientId: string;
}

const initialActionState: ExerciseLogFormState = { success: false };

export const useExerciseLogManager = ({
  initialExerciseLogs,
}: UseExerciseLogManagerProps) => {
  const [logs, setLogs] = useState<ClientExerciseLog[]>(initialExerciseLogs);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [blockSearch, setBlockSearch] = useState(false);

  const [addState, addAction] = useActionState(
    addExerciseLog,
    initialActionState,
  );
  const [updateState, updateAction] = useActionState(
    updateExerciseLog,
    initialActionState,
  );

  const isEditing = !!editingLogId;
  const currentEditingLog = isEditing
    ? logs.find((l) => l.id === editingLogId)
    : null;

  useEffect(() => {
    if (addState.success && addState.newLog) {
      setLogs((prev) =>
        [...prev, addState.newLog!].sort(
          (a, b) =>
            new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.updatedLog) {
      setLogs((prev) =>
        prev
          .map((l) =>
            l.id === updateState.updatedLog!.id ? updateState.updatedLog! : l,
          )
          .sort(
            (a, b) =>
              new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
          ),
      );
      setEditingLogId(null);
    }
  }, [updateState]);

  const handleDelete = async (logId: string) => {
    const originalLogs = logs;
    setDeletingId(logId);
    setLogs((prev) => prev.filter((log) => log.id !== logId));
    
    try {
      const result = await deleteExerciseLog(logId);
      if (!result?.success) {
        if (isMounted.current) {
          setLogs(originalLogs);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete exercise log failed:", error);
      if (isMounted.current) {
        setLogs(originalLogs);
      }
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (log: ClientExerciseLog) => {
    setEditingLogId(log.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2 || blockSearch) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      const { exercises } = await searchExercisesAction(searchQuery);
      setSearchResults(exercises);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, blockSearch]);

  return {
    logs,
    editingLogId,
    deletingId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingLog,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setBlockSearch,
    handleDelete,
    handleEdit,
    handleCancelEdit,
  };
};
```
### src/hooks/useMeasurementManager.ts
```
import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  type MeasurementFormState,
} from "@/app/[locale]/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/[locale]/clients/actions/measurement-actions";

interface UseMeasurementManagerProps {
  initialMeasurements: ClientMeasurement[];
}

/**
 * Custom hook to manage client measurements state and actions.
 * @param {UseMeasurementManagerProps} props - The initial measurements for the client.
 * @returns An object with state and handlers for managing measurements.
 */
export const useMeasurementManager = ({
  initialMeasurements,
}: UseMeasurementManagerProps) => {
  const [measurements, setMeasurements] =
    useState<ClientMeasurement[]>(initialMeasurements);
  const [editingMeasurementId, setEditingMeasurementId] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const initialActionState: MeasurementFormState = { message: "", success: false };

  const [addState, addAction] = useFormState(
    addMeasurement,
    initialActionState,
  );
  const [updateState, updateAction] = useFormState(
    updateMeasurement,
    initialActionState,
  );

  const isEditing = !!editingMeasurementId;

  useEffect(() => {
    if (addState?.success && addState.measurement) {
      setMeasurements((prev) =>
        [...prev, addState.measurement!].sort(
          (a, b) =>
            new Date(b.measurementDate).getTime() -
            new Date(a.measurementDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState?.success && updateState.measurement) {
      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === updateState.measurement!.id ? updateState.measurement! : m,
        ),
      );
    }
  }, [updateState]);

  const handleDelete = async (measurementId: string) => {
    const originalMeasurements = measurements;
    setIsDeleting(true);
    setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));

    try {
      const result = await deleteMeasurement({}, measurementId);
      if (!result?.success) {
        if (isMounted.current) {
          setMeasurements(originalMeasurements);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete measurement failed:", error);
      if (isMounted.current) {
        setMeasurements(originalMeasurements);
      }
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (measurement: ClientMeasurement) => {
    setEditingMeasurementId(measurement.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelEdit = () => {
    setEditingMeasurementId(null);
  };

  const currentEditingMeasurement = isEditing
    ? measurements.find((m) => m.id === editingMeasurementId)
    : null;

  return {
    measurements,
    editingMeasurementId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingMeasurement,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    isDeleting,
  };
};
```
### src/hooks/useProgressPhotoManager.ts
```
import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import {
  addProgressPhoto,
  deleteProgressPhoto,
} from "@/app/[locale]/clients/actions/photo-actions";
import { ClientProgressPhoto } from "@/app/[locale]/clients/actions";

interface ActionState {
  errors?: {
    photoDate?: string[];
    caption?: string[];
    photo?: string[];
    form?: string[];
  };
  message: string;
  success?: boolean;
  progressPhoto?: ClientProgressPhoto;
}

interface UseProgressPhotoManagerProps {
  initialProgressPhotos: ClientProgressPhoto[];
}

/**
 * Manages the state and actions for client progress photos.
 * @param {UseProgressPhotoManagerProps} props - The initial progress photos.
 * @returns An object containing state and handlers for photo management.
 */
export const useProgressPhotoManager = ({
  initialProgressPhotos,
}: UseProgressPhotoManagerProps) => {
  const [progressPhotos, setProgressPhotos] =
    useState<ClientProgressPhoto[]>(initialProgressPhotos);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const initialActionState: ActionState = { message: "", success: false };

  const addPhotoActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addProgressPhoto(state, formData);
    if (result?.success && result.progressPhoto) {
      setProgressPhotos((prevPhotos) =>
        [...prevPhotos, result.progressPhoto!].sort(
          (a, b) =>
            new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime(),
        ),
      );
      setSelectedImage(null); // Clear preview on success
      return {
        ...state,
        success: true,
        progressPhoto: result.progressPhoto,
        message: "Photo added successfully.",
      };
    } else {
      return {
        ...state,
        success: false,
        errors: result?.errors,
        error: result?.message || "Failed to add progress photo",
      } as any;
    }
  };

  const [addPhotoState, addPhotoAction] = useFormState<ActionState, FormData>(
    addPhotoActionWrapper,
    initialActionState,
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    const originalPhotos = progressPhotos;
    setIsDeleting(true);
    setProgressPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.id !== photoId),
    );
    
    try {
      const result = await deleteProgressPhoto({}, photoId);
      if (!result?.success) {
        if (isMounted.current) {
          setProgressPhotos(originalPhotos);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete photo failed:", error);
      if (isMounted.current) {
        setProgressPhotos(originalPhotos);
      }
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  return {
    progressPhotos,
    selectedImage,
    addPhotoState,
    addPhotoAction,
    handleImageChange,
    handleDelete,
    isDeleting,
  };
};
```
### src/hooks/useSessionLogManager.ts
```
import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import {
  addSessionLog,
  deleteSessionLog,
  updateSessionLog,
} from "@/app/[locale]/clients/actions";
import type { ClientSessionLog } from "@/app/[locale]/clients/actions";

interface ActionState {
  errors?: {
    sessionDate?: string[];
    durationMinutes?: string[];
    activitySummary?: string[];
    sessionNotes?: string[];
    clientId?: string[];
    sessionLogId?: string[];
  };
  message?: string;
  success: boolean;
  sessionLog?: ClientSessionLog;
}

const initialActionState: ActionState = { success: false };

interface UseSessionLogManagerProps {
  initialSessionLogs: ClientSessionLog[];
  clientId: string;
}

/**
 * Custom hook for managing client session logs.
 * Handles state for logs, editing, deleting, and server action integration.
 * @param {UseSessionLogManagerProps} props - The initial logs and client ID.
 * @returns An object with state and handlers for the session log management UI.
 */
export const useSessionLogManager = ({
  initialSessionLogs,
}: UseSessionLogManagerProps) => {
  const [sessionLogs, setSessionLogs] =
    useState<ClientSessionLog[]>(initialSessionLogs);
  const [editingSessionLogId, setEditingSessionLogId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [addState, addAction] = useFormState(
    addSessionLog,
    initialActionState,
  );
  const [updateState, updateAction] = useFormState(
    updateSessionLog,
    initialActionState,
  );

  const isEditing = !!editingSessionLogId;

  useEffect(() => {
    if (addState.success && addState.sessionLog) {
      setSessionLogs((prev) =>
        [addState.sessionLog!, ...prev].sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() -
            new Date(a.sessionDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.sessionLog) {
      setSessionLogs((prev) =>
        prev.map((log) =>
          log.id === updateState.sessionLog!.id ? updateState.sessionLog! : log,
        ),
      );
    }
  }, [updateState]);

  const handleDelete = async (sessionLogId: string) => {
    const originalLogs = sessionLogs;
    setDeletingId(sessionLogId);
    setSessionLogs((prev) => prev.filter((log) => log.id !== sessionLogId));
    
    try {
      const result = await deleteSessionLog(sessionLogId);
      if (!result?.success) {
        if (isMounted.current) {
          setSessionLogs(originalLogs);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete session log failed:", error);
      if (isMounted.current) {
        setSessionLogs(originalLogs);
      }
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (log: ClientSessionLog) => {
    setEditingSessionLogId(log.id);
  };

  const handleCancelEdit = () => {
    setEditingSessionLogId(null);
  };

  const currentEditingLog = isEditing
    ? sessionLogs.find((l) => l.id === editingSessionLogId)
    : null;

  return {
    sessionLogs,
    editingSessionLogId,
    deletingId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingLog,
    handleDelete,
    handleEdit,
    handleCancelEdit,
  };
};
```