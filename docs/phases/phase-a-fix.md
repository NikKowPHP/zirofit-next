# TODO: Implement Native iOS/macOS UI/UX Overhaul

This plan outlines the necessary steps to refactor the ZIRO.FIT web application to adopt the design language of Apple's Human Interface Guidelines (HIG) for a more native look and feel on both mobile (iOS) and desktop (macOS).

## Phase 1: Foundation - Theming and Design System

This phase establishes the core colors, fonts, and styles that will be used across the entire application.

-   [ ] **1.1. Research and Define Apple HIG Color Palette:**
    -   [ ] Identify the standard colors from Apple's HIG for light and dark modes. This includes system grays, primary blue, semantic colors (red, green, yellow, orange), and fill colors (for backgrounds).
    -   [ ] Create a reference list of these colors and their intended uses (e.g., `systemGray6` for backgrounds, `systemBlue` for interactive elements).

-   [ ] **1.2. Update Tailwind Configuration (`tailwind.config.ts`):**
    -   [ ] Extend the `theme.colors` object in `tailwind.config.ts`.
    -   [ ] Add the new Apple-inspired colors, prefixing them for clarity (e.g., `ios-blue`, `macos-gray-1`, `ios-red`).
    -   [ ] Define color sets for both `light` and `dark` modes if not using CSS variables directly.

-   [ ] **1.3. Refactor Global Styles (`src/app/globals.css`):**
    -   [ ] Replace the existing `--background` and `--foreground` CSS variables with a more comprehensive set based on the HIG palette.
        ```css
        /* Example for light mode */
        :root {
          --background-primary: #ffffff; /* System Background */
          --background-secondary: #f2f2f7; /* System Gray 6 */
          --fill-primary: #e5e5ea; /* System Gray 3 */
          --text-primary: #000000;
          --text-secondary: #8a8a8e; /* System Gray */
          --accent-primary: #007aff; /* System Blue */
          --destructive: #ff3b30; /* System Red */
        }
        /* Example for dark mode */
        .dark {
          --background-primary: #000000;
          --background-secondary: #1c1c1e; /* System Gray 6 */
          --fill-primary: #3a3a3c; /* System Gray 3 */
          --text-primary: #ffffff;
          --text-secondary: #8d8d92; /* System Gray */
          --accent-primary: #0a84ff; /* System Blue */
          --destructive: #ff453a; /* System Red */
        }
        ```
    -   [ ] Update the `body` styles to use the new CSS variables for background and text colors.

-   [ ] **1.4. Update Font Stack (`src/app/layout.tsx`):**
    -   [ ] Modify the font loading to prioritize Apple's native San Francisco font. Remove `Geist` and use a system font stack for the most authentic feel.
        ```tsx
        // Before: const geistSans = Geist(...)
        // After: No font loader needed for system fonts. Update body className.
        <body className="font-sans antialiased">...</body>
        ```
    -   [ ] Add `font-sans` to the `body` tag and configure `fontFamily` in `tailwind.config.ts` to use a system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`.

-   [ ] **1.5. Define Native-like Animations (`tailwind.config.ts`):**
    -   [ ] Add new keyframes for common native animations:
        -   `slide-in-from-right`: For page transitions on desktop.
        -   `slide-in-from-bottom`: For modals on mobile.
        -   `subtle-press`: A transform for button clicks (`scale-98`).
        -   `subtle-fade-in`: A gentler version of the existing `fade-in-up`.
    -   [ ] Add these to the `animation` theme extension.

## Phase 2: Core UI Component Refactoring

Apply the new design system to the base components.

-   [ ] **2.1. Refactor `Button.tsx`:**
    -   [ ] Change `variant: 'primary'` to use the new `--accent-primary` color (`ios-blue`).
    -   [ ] Create styles that mimic iOS/macOS buttons: prominent filled, gray filled, and borderless/plain.
    -   [ ] Apply the `active:scale-[0.98]` (`subtle-press`) animation for click feedback.

-   [ ] **2.2. Refactor `Input.tsx`, `Textarea.tsx`, and `RichTextEditor.tsx`:**
    -   [ ] Update styles to match HIG form controls: minimal borders, slightly rounded corners, and a clear blue focus ring (`focus:ring-ios-blue`).
    -   [ ] Ensure background colors use the new `--background-secondary` or similar variables.
    -   [ ] Adjust the Quill editor styles in `RichTextEditor.tsx` to match the new dark/light theme colors for the toolbar and text area.

-   [ ] **2.3. Refactor `Card.tsx`:**
    -   [ ] Update background colors to use `--background-secondary`.
    -   [ ] Remove or significantly reduce `border` and `shadow`. Apple UI often relies on background contrast rather than borders.
    -   [ ] Ensure consistent corner rounding across all card-based components.

-   [ ] **2.4. Refactor `BottomNavBar.tsx` (iOS):**
    -   [ ] Enhance the "frosted glass" effect by adjusting `bg-opacity` and `backdrop-blur`.
    -   [ ] Update icon colors for active/inactive states to use `--accent-primary` for active and `--text-secondary` for inactive.
    -   [ ] Ensure the selected tab text is bold, a common iOS pattern.

## Phase 3: Layout and Navigation Overhaul

Update the main application layouts to reflect a native container look.

-   [ ] **3.1. Refactor `TrainerDashboardLayout.tsx` (macOS):**
    -   [ ] Restyle the sidebar to mimic a native macOS sidebar (e.g., Mail app). Use a translucent material effect (`bg-white/60 dark:bg-neutral-900/80`).
    -   [ ] Update the sidebar navigation links' active state to show a filled gray selection style, common in macOS.
    -   [ ] Style the header to be a clean, simple bar with the title and actions.

-   [ ] **3.2. Refactor `PublicLayout.tsx` (macOS/iOS Header):**
    -   [ ] Redesign the public-facing header to be a clean navigation bar.
    -   [ ] Ensure the backdrop blur effect is consistent with the dashboard header.
    -   [ ] Update button and link styles to use the new core components.

-   [ ] **3.3. Refactor `ProfileEditorSidebar.tsx`:**
    -   [ ] Update the component to match the style of a macOS preferences sidebar.
    -   [ ] Use the macOS-style selection for the active section (`bg-neutral-200/60 dark:bg-neutral-800`).
    -   [ ] Update icons to use appropriate HIG colors (`--text-secondary` for inactive, `--accent-primary` for active).

## Phase 4: Page-by-Page Redesign and Polish

Go through each page to ensure consistency and apply the new native design system.

-   [ ] **4.1. Homepage (`src/app/page.tsx`):**
    -   [ ] Review `TrainerSearch.tsx` and update its inputs and buttons to the new native style.
    -   [ ] Ensure the "For Trainers" section uses the new card and button styles.

-   [ ] **4.2. Auth Pages (`/auth/login` & `/auth/register`):**
    -   [ ] Update `page.client.tsx` files for both routes.
    -   [ ] Restyle the auth form card to have a simpler, cleaner look. Use `--background-secondary`.
    -   [ ] Apply the new `Input` and `Button` component styles.

-   [ ] **4.3. Dashboard (`/dashboard/DashboardContent.tsx`):**
    -   [ ] Review all dashboard components (`AtAGlanceStats`, `ProfileChecklist`, `QuickActions`, `ActivityFeed`, charts).
    -   [ ] Update all cards to use the new `Card` style.
    -   [ ] Ensure charts (`ClientProgressChart`, `MonthlyActivityChart`) use the new theme colors for text, grids, and data lines/bars.

-   [ ] **4.4. Trainer Public Profile (`/trainer/[username]/page.tsx`):**
    -   [ ] Redesign the hero section to have a cleaner, more modern feel.
    -   [ ] Re-style all subsections (About, Services, Testimonials, etc.) as distinct content blocks or cards using the new design system.
    -   [ ] Update the `PublicCalendar` component, ensuring its buttons and form elements are native-styled.

-   [ ] **4.5. Client Management (`/clients/**`):**
    -   [ ] Update the main client list page (`/clients/page.tsx`) to use the new `Card` and `Button` styles for each client entry.
    -   [ ] Redesign the client detail view (`/clients/[clientId]/page.tsx` & `ClientDetailView.tsx`). The tabbed interface is good, but it should be restyled to look like a native segmented control.
    -   [ ] Go through each management module (`ManageClientMeasurements`, `ManageClientProgressPhotos`, `ManageClientSessionLogs`) and update all forms, buttons, and display elements.

-   [ ] **4.6. Profile Editor (`/profile/edit/page.tsx`):**
    -   [ ] Examine each editor section (`CoreInfoEditor`, `BrandingEditor`, etc.).
    -   [ ] Ensure every form element, button, and layout container conforms to the new HIG-based design system. This is a critical area for consistency.

## Phase 5: Final Review and Animations

-   [ ] **5.1. Apply Animations:**
    -   [ ] Add the `animate-subtle-fade-in` class to main content containers within layouts to provide a smooth content loading effect.
    -   [ ] Ensure all buttons have the `active:scale-[0.98]` transition for tactile feedback.

-   [ ] **5.2. Cross-Browser and Device Testing:**
    -   [ ] Test the new UI on Safari (macOS/iOS) to ensure it looks and feels as intended.
    -   [ ] Verify appearance and functionality on Chrome and Firefox.
    -   [ ] Check responsiveness on mobile, tablet, and desktop viewports.

-   [ ] **5.3. Final Code Review:**
    -   [ ] Scan the entire project for any lingering old color classes (e.g., `bg-indigo-600`, `text-gray-500`) and replace them with the new system (`bg-ios-blue`, `text-text-secondary`).
    -   [ ] Ensure all components are using the refactored, centralized UI components (`Button`, `Input`, `Card`).