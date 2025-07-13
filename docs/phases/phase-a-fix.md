

### Phase 1: Correct Foundational Color Definitions

The root of the problem is likely in the global CSS variables. By fixing the core text color here, we can correct the majority of the text across the site in a single step.

-   [ ] **Task 1.1: Adjust Core Text Colors in `globals.css`**
    -   **File:** `src/app/globals.css`
    -   **Action:** Locate the `:root` (light theme) CSS variables.
    -   **Change:** The `--foreground` variable is currently set to a very light gray, causing the issue. Update it to a high-contrast dark color. A near-black like `#1d1d1f` (Apple's standard text color) is ideal.
    -   **Verification:** Ensure the `--neutral-900` variable is also set to this dark color for consistency in headings.

    **Example (before):**
    ```css
    :root {
      --foreground: #f5f5f7; /* <-- PROBLEM: This is very light */
      /* ... */
    }
    ```
    **Example (after):**
    ```css
    :root {
      --foreground: #1d1d1f; /* <-- FIX: High-contrast dark text */
      --neutral-900: #1d1d1f; /* <-- FIX: Ensure heading color is also dark */
      /* ... */
    }
    ```

### Phase 2: Ensure Input and Textarea Readability

Even with the global fix, form elements can have their own specific styles. This phase ensures they are also corrected for high contrast.

-   [ ] **Task 2.1: Force High-Contrast Text in `Input.tsx`**
    -   **File:** `src/components/ui/Input.tsx`
    -   **Action:** In the `className` string for the component, explicitly add `text-neutral-900` (or `text-black`). This ensures that text typed into the input field has a dark color in light mode, overriding any incorrect inherited styles.
    -   **Change:** The class string should be updated to include this explicit text color for light mode.

-   [ ] **Task 2.2: Force High-Contrast Text in `Textarea.tsx`**
    -   **File:** `src/components/ui/Textarea.tsx`
    -   **Action:** Apply the exact same fix as in Task 2.1. Add `text-neutral-900` to the component's `className` string to guarantee readability for multi-line text fields.

### Phase 3: Comprehensive Verification

After applying these fixes, it is essential to verify that the problem is solved everywhere and that no new issues were introduced.

-   [ ] **Task 3.1: Test All Public Pages in Light Theme**
    -   **Action:** Systematically navigate to the following pages and confirm all text is now dark and easy to read:
        -   Homepage (`/`)
        -   Trainers search results (`/trainers`)
        -   A public trainer profile (`/trainer/[username]`)
        -   Login and Register pages (`/auth/login`, `/auth/register`)
    -   **Focus:** Pay special attention to typing inside all search bars, login forms, and contact forms.

-   [ ] **Task 3.2: Verify Dark Theme Integrity**
    -   **Action:** Switch to dark mode and repeat the navigation from Task 3.1.
    -   **Focus:** Confirm that all text has remained light (white or light-gray) against the dark backgrounds. The changes for the light theme should *not* have affected the dark theme's appearance.

This focused plan will resolve the readability issues effectively and safely.