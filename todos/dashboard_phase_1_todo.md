# Dashboard Phase 1 Implementation Plan

## Task 1: Establish Dashboard Foundation

1. **Modify `src/app/dashboard/page.tsx`**:
   - Refactor into server component with grid layout
   - Add `async function getDashboardData(trainerId: string)`
   - Implement grid layout: `className="grid grid-cols-1 lg:grid-cols-3 gap-6"`
   - Verification: Page renders grid layout without errors

2. **Create directory `src/app/dashboard/_components`**:
   - Verification: Directory exists with proper structure

## Task 2: "At a Glance" Statistics Widget

1. **Create `src/app/dashboard/_components/AtAGlanceStats.tsx`**:
   - Accepts props: `{ activeClients: number, sessionsThisMonth: number, pendingClients: number }`
   - Verification: Component exports React component with proper prop types

2. **Update `getDashboardData` in page.tsx**:
   - Add Prisma queries for:
     - Active clients count
     - Sessions this month count
     - Pending clients count
   - Verification: Data is passed correctly to AtAGlanceStats component

## Task 3: Profile Completion Checklist

1. **Create `src/app/dashboard/_components/ProfileChecklist.tsx`**:
   - Calculate completion percentage based on profile fields
   - Include progress bar and checklist items
   - Verification: Progress bar displays correct percentage

## Task 4: Quick Actions Widget

1. **Create `src/app/dashboard/_components/QuickActions.tsx`**:
   - Add buttons for:
     - "Add New Client" (links to `/clients/create`)
     - "Log Session" (links to `/clients`)
     - "Add Measurement" (links to `/clients`)
   - Verification: Buttons navigate to correct pages