# Dashboard Phase 2 Implementation Plan

## Task 5: Upcoming & Recent Activity Feed

1. **Create `src/app/dashboard/_components/ActivityFeed.tsx`**:
   - Server component that fetches and formats feed data
   - Include queries for upcoming sessions and recent activities
   - Verification: Feed displays mixed items chronologically

2. **Add data fetching to `getDashboardData` in page.tsx**:
   - Query upcoming sessions: next 3 sessions
   - Query recent activities: latest 5 items from multiple tables
   - Verification: Data is merged and sorted correctly

## Task 6: Client Spotlight Widget

1. **Create `src/app/dashboard/_components/ClientSpotlight.tsx`**:
   - Display progress chart for selected client
   - Verification: Chart renders with client's measurement data

2. **Add spotlight client logic to `getDashboardData`**:
   - Find client with recent measurements
   - Fetch their measurement data
   - Verification: Correct client data is passed to component