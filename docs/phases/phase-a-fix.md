# Plan: UI/UX Overhaul to Apple HIG Standard

This plan details the necessary steps to refactor the entire application's UI and UX to align with Apple's Human Interface Guidelines (HIG). The goal is a sleek, minimalist, and intuitive interface.

- **Desktop Experience:** Will emulate the clean, spacious, and functional aesthetic of macOS.
- **Mobile Experience:** Will be heavily inspired by iOS, focusing on touch-friendliness, clarity, and native-feeling navigation patterns.

---

## Phase A: Design System & Core UI Kit Foundation

This phase establishes the fundamental visual and interactive language for the entire application.

-   [ ] **1. Define Color Palette & Typography**
    -   [ ] 1.1. Update `tailwind.config.ts` with a new, Apple-inspired color palette. Include neutral grays (e.g., `zinc` or `slate`), a refined primary accent color (e.g., `blue` instead of `indigo`), and functional colors (green, red, yellow).
    -   [ ] 1.2. Update `src/app/globals.css` to use the new color variables for `--background` and `--foreground` for both light and dark modes, reflecting macOS/iOS system colors.
    -   [ ] 1.3. Define a new typographic scale in `tailwind.config.ts` using `fontSize` utilities to match Apple's HIG for clarity and readability.
-   [ ] **2. Redesign Core UI Components (`src/components/ui`)**
    -   [ ] 2.1. Refactor `Button.tsx`: Implement new variants: `default` (filled accent color), `gray` (macOS-style secondary), and `borderless`. Ensure rounded corners and font weights match HIG.
    -   [ ] 2.2. Refactor `Input.tsx` & `Textarea.tsx`: Remove heavy shadows, use a subtle border that highlights on focus. Ensure padding and font size provide a clean, modern feel.
    -   [ ] 2.3. Refactor `Label.tsx`: Adjust font size and color to complement the new input styles.
    -   [ ] 2.4. Refactor `RichTextEditor.tsx`: Restyle the toolbar with borderless icons and a clean container to match the new aesthetic. Update editor area styling.
    -   [ ] 2.5. Refactor `Skeleton.tsx`: Adjust the pulse animation and background color to be more subtle.

---

## Phase B: Public-Facing Pages Overhaul

Apply the new design system to all unauthenticated user journeys to create a stunning first impression.

-   [ ] **1. Homepage (`src/app/page.tsx`)**
    -   [ ] 1.1. Redesign `TrainerSearch.tsx`: Implement a "frosted glass" (vibrant material) effect for the search container, making it float over the hero image.
    -   [ ] 1.2. Update the hero section's typography to be more impactful and clean.
    -   [ ] 1.3. Restyle the "For Trainers" section with the new UI kit components and improved spacing.
-   [ ] **2. Trainers Search Page (`src/app/trainers/page.tsx`)**
    -   [ ] 2.1. Redesign `TrainerResultCard.tsx`: Increase padding and white space, use the new typography, and implement a subtle hover effect. Use a cleaner layout for trainer details.
    -   [ ] 2.2. Replace the placeholder "Map View" with a functional, beautifully styled map component (future task, for now, style the placeholder).
    -   [ ] 2.3. Restyle pagination controls to be cleaner and more touch-friendly.
-   [ ] **3. Public Trainer Profile (`src/app/trainer/[username]/page.tsx`)**
    -   [ ] 3.1. Overhaul the Hero section: Ensure the `ProfileImage` and `BannerImage` components create a visually stunning, balanced header.
    -   [ ] 3.2. Restructure content sections (About, Services, Testimonials) into cleanly separated cards or views, improving information hierarchy.
    -   [ ] 3.3. Redesign `PublicCalendar.tsx`: Style it to look and feel like a native macOS/iOS calendar view, with clear date selection and time slot presentation.
    -   [ ] 3.4. Restyle all content sections (Benefits, Services, Photos, Testimonials) to use the new design system's components and spacing.
-   [ ] **4. Authentication Pages (`src/app/auth/`)**
    -   [ ] 4.1. Redesign `login/page.client.tsx` to feature a centered, minimalist form with the new UI components.
    -   [ ] 4.2. Redesign `register/page.client.tsx` with the same clean, minimalist aesthetic.

---

## Phase C: Authenticated Experience (macOS Style)

Refactor the trainer's dashboard and management tools to feel like a native macOS application.

-   [ ] **1. Core Dashboard Layout**
    -   [ ] 1.1. Update `TrainerDashboardLayout.tsx`: Implement a fixed sidebar with a subtle background. Adjust the main content area's background color to be slightly off-white/off-black for depth.
    -   [ ] 1.2. Refine the header to be cleaner, with well-spaced icons and title.
-   [ ] **2. Dashboard Content (`src/app/dashboard/DashboardContent.tsx`)**
    -   [ ] 2.1. Redesign all dashboard components (`AtAGlanceStats`, `QuickActions`, `ActivityFeed`, etc.) as clean "widgets" or cards with generous padding and clear typography.
    -   [ ] 2.2. Update `ClientProgressChart.tsx` and `MonthlyActivityChart.tsx` to use the new color palette and ensure text/labels are sharp and legible in both light and dark modes.
-   [ ] **3. Profile Editor (`src/app/profile/edit/page.tsx`)**
    -   [ ] 3.1. Redesign `ProfileEditorSidebar.tsx` to mimic the macOS "System Settings" sidebar, with clear iconography and selection states.
    -   [ ] 3.2. Redesign all editor sections (`CoreInfoEditor`, `BrandingEditor`, etc.) to use clean, organized forms within card-like containers.
-   [ ] **4. Client Management (`src/app/clients/`)**
    -   [ ] 4.1. Overhaul the client list (`/clients/page.tsx`) to use a cleaner card or table layout.
    -   [ ] 4.2. In `ClientDetailView.tsx`, restyle the tab navigation to look like a native "Segmented Control" from iOS/macOS.
    -   [ ] 4.3. Redesign the client management modules (`ManageClientMeasurements`, `ManageClientSessionLogs`, etc.) with the new, cleaner form styles.

---

## Phase D: Mobile-Specific UX Overhaul (iOS Style)

Fine-tune the mobile experience to feel like a native iOS application.

-   [ ] **1. Navigation**
    -   [ ] 1.1. Redesign `BottomNavBar.tsx` to perfectly mimic the iOS Tab Bar, including a translucent (frosted glass) background, and correctly styled icons and labels.
    -   [ ] 1.2. Ensure the mobile header in `PublicLayout.tsx` and `TrainerDashboardLayout.tsx` is clean, compact, and provides a clear back navigation affordance where necessary.
-   [ ] **2. Layout and Interaction**
    -   [ ] 2.1. Review every page on a mobile viewport and ensure layouts are optimized for one-handed use.
    -   [ ] 2.2. Increase the size of touch targets on all interactive elements (buttons, links, tabs) to meet Apple's HIG recommendations (minimum 44x44 points).
    -   [ ] 2.3. Adjust font sizes and spacing on mobile for optimal readability on smaller screens.
-   [ ] **3. Component Behavior**
    -   [ ] 3.1. When implementing modals or pop-ups, prefer the "sheet" presentation style (sliding up from the bottom) on mobile.
    -   [ ] 3.2. Ensure `PublicCalendar.tsx` is highly usable on a touch device, with easy-to-tap dates and times.

---

## Phase E: Animation, Polish, and Accessibility

Add the final layer of refinement that defines the Apple experience.

-   [ ] **1. Transitions & Animations**
    -   [ ] 1.1. Apply smooth CSS transitions to all interactive elements for `color`, `background-color`, and `border-color` on hover and focus states.
    -   [ ] 1.2. Implement subtle animations for UI elements appearing on screen (e.g., fade-in, slide-up).
-   [ ] **2. Micro-interactions**
    -   [ ] 2.1. Add a subtle "press" effect (scale down slightly) to buttons when they are clicked.
    -   [ ] 2.2. Animate the progress bar in `ProfileChecklist.tsx` when the value changes.
-   [ ] **3. Accessibility (A11y)**
    -   [ ] 3.1. Perform a full accessibility audit.
    -   [ ] 3.2. Ensure all new color combinations meet WCAG AA contrast ratios.
    -   [ ] 3.3. Verify all interactive elements are fully keyboard-navigable and have clear focus states.
    -   [ ] 3.4. Ensure all icons have proper `aria-label` attributes for screen readers.

