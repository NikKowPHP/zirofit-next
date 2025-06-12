
# ZIRO.FIT Trainer Dashboard - Architecture & Implementation Plan

**TO:** Architect AI Agent
**FROM:** Solution Architect
**SUBJECT:** Task list for designing the new Trainer Dashboard

Your objective is to process the following feature specifications and create a comprehensive, granular, and ordered implementation plan for the Coder AI. The plan should include:

*   File creation/modification paths.
*   Component definitions (props, state management).
*   Server Action signatures and their required data logic (Prisma queries).
*   UI/UX considerations.

Prioritize the implementation into two phases as outlined below.

---

## Phase 1: Core Value & Onboarding

### Task 1: Establish the Dashboard Foundation

*   **Objective:** Refactor the existing placeholder dashboard page into a modular, grid-based layout and create a centralized data-fetching mechanism.
*   **Key Components:**
    *   `src/app/dashboard/page.tsx`: To be refactored into a server component that fetches all necessary data and orchestrates the layout.
    *   `src/app/dashboard/_components/`: New directory to house all dashboard-specific components.
*   **Data Requirements & Logic:**
    *   Create a single, consolidated data-fetching function within `src/app/dashboard/page.tsx`, e.g., `getDashboardData(trainerId: string)`.
    *   This function will initially fetch data required for all Phase 1 widgets. As more widgets are added, this function will be expanded.
*   **Acceptance Criteria:**
    *   The dashboard page (`/dashboard`) renders a new grid layout (e.g., `grid-cols-3`) without errors.
    *   The `_components` directory is created and ready for new widget components.
    *   A primary data-fetching function is defined and successfully retrieves initial data.

### Task 2: "At a Glance" Statistics Widget

*   **Objective:** Provide trainers with an immediate, high-level overview of their business activity.
*   **Key Components:**
    *   `src/app/dashboard/_components/AtAGlanceStats.tsx`: A client component that receives numerical data as props and displays it.
*   **Data Requirements & Logic:**
    *   The main `getDashboardData` function in `page.tsx` must perform the following Prisma queries:
        1.  **Active Clients:** `prisma.client.count({ where: { trainerId, status: 'active' } })`
        2.  **Sessions This Month:** `prisma.clientSessionLog.count({ where: { client: { trainerId }, sessionDate: { gte: startOfMonth, lte: endOfMonth } } })`
        3.  **Pending Clients/Leads:** `prisma.client.count({ where: { trainerId, status: 'pending' } })`
    *   The results of these queries should be passed as props to the `AtAGlanceStats` component.
*   **Acceptance Criteria:**
    *   A new component displays three key stats: Active Clients, Sessions This Month, and Pending Clients.
    *   The numbers displayed are accurate based on the trainer's database records.
    *   The widget is styled to be prominent at the top of the dashboard.

### Task 3: Profile Completion Checklist Widget

*   **Objective:** Gamify the profile setup process to encourage trainers to create a complete and attractive public profile.
*   **Key Components:**
    *   `src/app/dashboard/_components/ProfileChecklist.tsx`: A client component to display the progress bar and checklist.
*   **Data Requirements & Logic:**
    *   The `getDashboardData` function must fetch the trainer's `Profile` and its relations (`services`, `testimonials`, `transformationPhotos`, etc.).
    *   The `ProfileChecklist` component will contain the logic to calculate a completion percentage based on the presence of data in the following fields:
        *   `profilePhotoPath` (+20%)
        *   `bannerImagePath` (+10%)
        *   `aboutMe` (not null/empty) (+15%)
        *   `services.length > 0` (+15%)
        *   `testimonials.length > 0` (+15%)
        *   `benefits.length > 1` (+15%)
        *   `transformationPhotos.length > 0` (+10%)
    *   Each checklist item should be a `Link` to the relevant section of the profile editor (e.g., `/profile/edit` and handle client-side navigation to the section).
*   **Acceptance Criteria:**
    *   A progress bar visually represents the completion percentage.
    *   A checklist shows which sections are complete (checked) and incomplete (unchecked).
    *   Clicking an incomplete item navigates the user to the correct editing interface.

### Task 4: Quick Actions Widget

*   **Objective:** Provide low-friction access to the most common, high-frequency actions a trainer performs.
*   **Key Components:**
    *   `src/app/dashboard/_components/QuickActions.tsx`: A simple component with styled buttons.
*   **Data Requirements & Logic:**
    *   This component is primarily UI. It does not require special data fetching.
    *   It should contain `Link` components or buttons that navigate to:
        1.  **Add New Client:** `/clients/create`
        2.  **Log a Session:** `/clients` (initially; future phase will use a modal)
        3.  **Add Measurement:** `/clients` (initially; future phase will use a modal)
*   **Acceptance Criteria:**
    *   A widget with at least two buttons ("Add Client", "Log Session") is displayed on the dashboard.
    *   The buttons are clearly visible and link to the correct pages.

---

## Phase 2: Engagement & Insights

### Task 5: Upcoming & Recent Activity Feed

*   **Objective:** Make the dashboard feel dynamic and alive by showing a chronological feed of recent events and upcoming appointments.
*   **Key Components:**
    *   `src/app/dashboard/_components/ActivityFeed.tsx`: A server component that fetches and formats the feed data.
*   **Data Requirements & Logic:**
    *   This component will need a dedicated data-fetching function.
    *   **Fetch Upcoming Sessions:** `prisma.clientSessionLog.findMany({ where: { client: { trainerId }, sessionDate: { gte: new Date() } }, orderBy: { sessionDate: 'asc' }, take: 3, include: { client: { select: { name: true } } } })`
    *   **Fetch Recent Activities:** This requires a multi-table query. Fetch the latest 5 items from `ClientMeasurement`, `ClientSessionLog` (past sessions), and `ClientProgressPhoto`, all linked to the trainer.
    *   **Merge and Sort:** Combine the results from all queries into a single array, add a `type` field to each object (e.g., `'NEW_MEASUREMENT'`), and sort the final array by date in descending order.
    *   The component will render a different message format based on the `type` of each item.
*   **Acceptance Criteria:**
    *   A feed on the dashboard displays a mix of items like "Session with [Client] tomorrow" and "New weight measurement for [Client]".
    *   The feed is sorted chronologically.
    *   It gracefully handles the case where there is no activity.

### Task 6: Client Spotlight Widget

*   **Objective:** Celebrate client success by visualizing recent progress directly on the dashboard, reinforcing the value of the platform.
*   **Key Components:**
    *   `src/app/dashboard/_components/ClientSpotlight.tsx`: A component that includes a client-side chart.
*   **Data Requirements & Logic:**
    *   **Find a Relevant Client:** Create a server-side function to find a "spotlight" client. A good candidate is a client with at least 2 `ClientMeasurement` records in the last 45 days.
    *   **Fetch Measurement Data:** For the selected client, fetch their recent measurements.
    *   **Leverage Existing Code:** Pass the fetched measurement data to a modified version of the existing `ClientStatistics` component from `src/components/clients/modules/ClientStatistics.tsx`. This new version should be lean and focused on a single metric (e.g., weight).
*   **Acceptance Criteria:**
    *   A chart displaying a progress trend for a single client is shown on the dashboard.
    *   The widget includes the client's name.
    *   If no client has sufficient data, a placeholder message like "Log new measurements to see client progress here!" is displayed.

---

**Final Deliverable for Architect AI:** A structured TODO list for the Coder AI, breaking down each of these tasks into specific file changes, code blocks for new functions/components, and a logical implementation order starting with Phase 1.