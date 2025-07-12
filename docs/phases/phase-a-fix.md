### Phase 1: Foundation & Theming

This phase establishes the new Apple-like design language, color palette, and basic styles that will be used across the application.

-   [x] **Task 1.1: Define HIG Color Palette in `globals.css`**
    -   [x] In `src/app/globals.css`, update the `:root` and `.dark` variables to reflect an Apple-inspired color scheme.
    -   [x] **Light Mode (`:root`):** Use an off-white background (e.g., `#fbfbfd`), a dark gray for text, and a vibrant blue for interactive elements.
    -   [x] **Dark Mode (`.dark`):** Use a near-black background (e.g., `#000000`), an off-white for text, and a slightly lighter, vibrant blue for accents.

-   [x] **Task 1.2: Refine Core UI Component Styles**
    -   [x] Modify `src/components/ui/Button.tsx`: Update the `primary` variant to use the new HIG blue. Make the `secondary` variant a light gray with dark text (or dark gray with light text in dark mode).
    -   [x] Modify `src/components/ui/Input.tsx` and `src/components/ui/Textarea.tsx`: Ensure their default and focus states align with a clean, minimalist aesthetic (e.g., subtle borders, clean focus rings in the primary blue).
    -   [x] Modify `src/components/ui/Card.tsx`: Change the design from a "frosted glass" effect to a more standard HIG-style card with a solid background, subtle border, and soft shadow.

### Phase 2: Public Navigation & Layout Redesign

This phase focuses on creating a consistent and modern navigation experience for unauthenticated users, heavily inspired by Apple's mobile and desktop patterns.

-   [x] **Task 2.1: Overhaul the Public Navigation Bar**
    -   [x] In `src/components/layouts/PublicLayout.tsx`, redesign the header. It should be clean, with minimal elements: the site logo and primary navigation links.
    -   [x] Implement the new mobile menu:
        -   [x] Replace the existing mobile menu logic with a full-screen overlay that animates smoothly.
        -   [x] The menu should be triggered by a standard `Bars3Icon` (hamburger).
        -   [x] Navigation links within the mobile overlay should be large, bold, and centered for easy tapping.

-   [x] **Task 2.2: Refine Button Usage in Navigation**
    -   [x] In `src/components/layouts/PublicLayout.tsx`, update the "Trainer Login" and "Trainer Sign Up" calls to action to use the newly styled `Button` component, ensuring they are visually distinct.
### Phase 3: Homepage & Search Component Redesign

This phase transforms the main landing page to align with Apple's clean, product-focused design principles.

-   [x] **Task 3.1: Redesign the Homepage (`page.tsx`)**
    -   [x] In `src/app/page.tsx`, replace the hero section's background image and dark overlay with a simple, clean background (light gray or a subtle gradient).
    -   [x] Emphasize the headline with large, bold typography (e.g., "Find your expert.", "Book your session.").
    -   [x] Integrate the "For Trainers" call-to-action more elegantly into the page flow, rather than as a separate, blocky section.

-   [x] **Task 3.2: Redesign the `TrainerSearch` Component**
    -   [x] In `src/components/home/TrainerSearch.tsx`, remove the frosted glass background from the container.
    -   [x] Style the search form as a clean, central element.
    -   [x] Update the "In-Person" and "Online" tabs to be more subtle, using a font weight change or a simple underline for the active state instead of a colored background.

### Phase 4: Fix Search and Redesign Results Page

This phase addresses the critical search functionality bug and brings the trainer discovery experience in line with the new design system.

-   [x] **Task 4.1: Fix Location Search Logic**
    -   [x] In `src/lib/api/trainers.ts`, modify the `getPublishedTrainers` function.
    -   [x] The current logic overwrites the `AND` clause. Change it to correctly push the location filter into the `whereClause.AND` array.
    -   [x] This ensures that if a text `query` and a `location` are both provided, the search correctly filters by *both* criteria.

-   [x] **Task 4.2: Redesign Trainer Search Results Page**
    -   [x] In `src/app/trainers/page.tsx`, apply the new HIG-inspired styling.
    -   [x] Ensure the layout is clean, with ample white space. Refine the two-column layout to feel balanced.
    -   [x] Update the pagination controls to be more minimal and use the new button styles.

-   [x] **Task 4.3: Redesign the `TrainerResultCard` Component**
    -   [x] In `src/components/trainers/TrainerResultCard.tsx`, update the card to use the new clean, solid-background card style.
    -   [x] Make the trainer's name a clear, clickable link styled in the primary blue color.
    -   [x] Improve the typography hierarchy to clearly distinguish the name, certifications, and location.
### Phase 5: Trainer Public Profile Page Redesign

This phase overhauls the public-facing profile page for individual trainers to create a professional, polished, and easy-to-read layout.

-   [x] **Task 5.1: Redesign Profile Hero Section**
    -   [x] In `src/app/trainer/[username]/page.tsx`, simplify the hero section. Reduce the opacity of the banner image overlay or replace it with a clean gradient to improve text legibility.
    -   [x] Adjust the typography and spacing of the trainer's name, certifications, and location to be more aligned with HIG.

-   [x] **Task 5.2: Refactor Profile Content into Cards**
    -   [x] In `src/app/trainer/[username]/page.tsx`, wrap each distinct section (About Me, Services, Testimonials, etc.) in its own newly styled `Card` component.
    -   [x] Ensure consistent padding, margins, and headers for each card to create a rhythmic and organized layout.

-   [x] **Task 5.3: Style the Booking Calendar**
    -   [x] In `src/components/trainer/PublicCalendar.tsx`, update the internal styling to match the new HIG theme. This includes button colors, input styles, and the overall color scheme of the calendar grid.

### Phase 6: Auth Pages & Final Review

This final phase ensures that the login and registration pages are consistent with the new design and includes a final check of all changes.

-   [x] **Task 6.1: Redesign Authentication Pages**
    -   [x] Update `src/app/auth/login/page.client.tsx` and `src/app/auth/register/page.client.tsx`.
    -   [x] Wrap the forms in the new `Card` component style to provide a clean, centered container on the page.
    -   [x] Ensure all inputs and buttons use the newly defined HIG styles.

-   [x] **Task 6.2: Comprehensive Dark Mode and Responsiveness Review**
    -   [x] Manually test every modified page (`/`, `/trainers`, `/trainer/[username]`, `/auth/login`, `/auth/register`) in both light and dark modes.
    -   [x] Verify that all pages are fully responsive and function flawlessly on mobile, tablet, and desktop viewport sizes. Pay close attention to the new mobile navigation overlay.