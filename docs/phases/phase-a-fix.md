
### **Revised Feature Enhancement Plan**

#### Phase 1: Standardize Back Navigation (Still Required)

**Goal:** Ensure all secondary pages within the trainer dashboard use the consistent `BackLink` component for navigation. The `BackLink` component exists, but is not yet used everywhere.

-   [x] **Task 1.1: Update Create Client Page**
    -   **File:** `src/app/clients/create/page.tsx`
    -   **Action:** Replace the existing `<Link>` component with the `<BackLink>` component.
    -   **Details:** Change `<Link href="/clients" ...>Back to Client List</Link>` to `<BackLink href="/clients" text="← Back to Client List" />`. Import `BackLink` from `@/components/ui/BackLink`.

-   [x] **Task 1.2: Update Edit Client Page**
    -   **File:** `src/app/clients/[clientId]/edit/page.tsx`
    -   **Action:** Replace the existing `<Link>` component with the `<BackLink>` component.
    -   **Details:** Change `<Link href="/clients" ...>Back to Client List</Link>` to `<BackLink href="/clients" text="← Back to Client List" />`. Import `BackLink` from `@/components/ui/BackLink`.

#### Phase 2: Refine Chart Empty States (Partially Complete, Refinement Needed)

**Goal:** Provide clear, user-friendly messages on the client-specific statistics charts when there is no data to display. (The dashboard-level charts are already handled).

-   [x] **Task 2.1: Enhance Client-Specific Statistics Charts**
    -   **File:** `src/components/clients/modules/ClientStatistics.tsx`
    -   **Action:** For each chart (Weight and Body Fat), check if there is valid data to display. If not, render the `EmptyState` component.
    -   **Details:**
        1.  In the `ClientStatistics` component, filter the data for each chart to count valid data points (e.g., non-null `weightKg` or `bodyFatPercentage`).
        2.  For the "Weight Progress" chart container, use a ternary operator. If there are no valid weight data points, render `<EmptyState title="No Weight Data" description="Log your client's weight to see their progress here." />`. Otherwise, render the `<Line>` chart.
        3.  Repeat the same logic for the "Body Fat Progress" chart.

#### Phase 3: Implement Advanced Exercise Performance Logging (Still Required)

**Goal:** Build a comprehensive system for trainers to log and track client performance on specific exercises. This feature does not exist yet, so the original plan is fully valid.

##### Sub-Phase 3.1: Database & Seeding

-   [x] **Task 3.1.1: Update Database Schema**
    -   **File:** `prisma/schema.prisma`
    -   **Action:** Define two new models: `Exercise` and `ClientExerciseLog`.
    -   **Details:**
        ```prisma
        // Add to the bottom of the schema file

        model Exercise {
          id          String   @id @default(cuid())
          name        String   @unique
          muscleGroup String?
          equipment   String?
          description String?  @db.Text
          
          logs        ClientExerciseLog[]
          
          @@index([name])
        }

        model ClientExerciseLog {
          id          String   @id @default(cuid())
          clientId    String
          client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
          
          exerciseId  String
          exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
          
          logDate     DateTime @db.Date
          sets        Json     // Will store: { reps: number, weight: number }[]
          
          createdAt   DateTime @default(now())
          updatedAt   DateTime @updatedAt
          
          @@index([clientId, logDate])
        }
        ```

-   [x] **Task 3.1.2: Create and Apply Migration**
    -   **Action:** Run the Prisma migration command to apply schema changes to the database.
    -   **Command:** `npx prisma migrate dev --name add_exercise_logging`

-   [x] **Task 3.1.3: Create Comprehensive Exercise Seed Data**
    -   **File:** `prisma/data/exercises.json` (New file)
    -   **Action:** Create a **production-ready, comprehensive JSON file** containing a large, categorized list of exercises (at least 200).
    -   **Requirements:** Categorize by `muscleGroup` and `equipment`. Cover all major muscle groups (Chest, Back, Shoulders, Legs, Arms, Abs) and equipment types (Barbell, Dumbbell, Kettlebell, Machine, Cable, Bands, Bodyweight).

-   [x] **Task 3.1.4: Create Seeding Script**
    -   **File:** `prisma/seed-exercises.ts` (New file)
    -   **Action:** Write a script to read `prisma/data/exercises.json` and populate the `Exercise` table, using `prisma.exercise.upsert` to avoid duplicates.

-   [x] **Task 3.1.5: Add Seeder Script to `package.json`**
    -   **File:** `package.json`
    -   **Action:** Add a new script: `"db:seed-exercises": "npx ts-node --project tsconfig-seed.json prisma/seed-exercises.ts"`.

##### Sub-Phase 3.2: Backend Logic

-   [x] **Task 3.2.1: Extend Client Service**
    -   **File:** `src/lib/services/clientService.ts`
    -   **Action:** Add functions for `Exercise` and `ClientExerciseLog` CRUD, and update the client details payload.
    -   **Details:** Add `searchExercises(query: string)`, `createExerciseLog(...)`, `updateExerciseLog(...)`, `deleteExerciseLog(...)`. Update `getClientDetailsForTrainer` to `include` `exerciseLogs { orderBy: { logDate: 'desc' } }`.

-   [x] **Task 3.2.2: Create Exercise Log Server Actions**
    -   **File:** `src/app/clients/actions/exercise-log-actions.ts` (New file)
    -   **Action:** Create server actions that wrap the new service functions. Use Zod to validate input, especially the `sets` JSON.

-   [x] **Task 3.2.3: Export New Actions**
    -   **File:** `src/app/clients/actions.ts`
    -   **Action:** Export all functions from the new `exercise-log-actions.ts` file.

##### Sub-Phase 3.3: Frontend UI & Integration

-   [x] **Task 3.3.1: Create Exercise Progress Chart Component**
    -   **File:** `src/components/clients/modules/ExerciseProgressChart.tsx` (New file)
    -   **Action:** Build a reusable line chart component to visualize performance (e.g., total volume) for a single exercise over time. It must handle empty states.

-   [x] **Task 3.3.2: Create Exercise Log Management Hook**
    -   **File:** `src/hooks/useExerciseLogManager.ts` (New file)
    -   **Action:** Create a custom hook to manage state for the exercise logs list, the dynamic "sets" form, debounced exercise searching, and form submissions.

-   [x] **Task 3.3.3: Create Exercise Log Management UI**
    -   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx` (New file)
    -   **Action:** Build the main component for the new "Exercise Performance" tab.
    -   **Details:** Use the hook. Implement a form with a date picker, a searchable exercise input, and a dynamic "Add Set" section. Display historical logs grouped by exercise, and integrate the `ExerciseProgressChart`.

-   [x] **Task 3.3.4: Integrate New Tab in Client Detail View**
    -   **File:** `src/components/clients/ClientDetailView.tsx`
    -   **Action:** Add "Exercise Performance" to the `tabs` array and `tabContent` object, lazily importing the new component.
    -   **Details:** Add `{ name: "Exercise Performance", id: "exercise" }` to the `tabs` array. Add a new entry to `tabContent` for `exercise`, rendering the `ManageClientExerciseLogs` component. Update the `getClientDetails` call and type to include `exerciseLogs`.
```

I have analyzed the provided TypeScript errors and will now implement the necessary fixes. The errors stem from a missing returned function from a custom hook and unsafe type casting of Prisma's `JsonValue` type.

I will correct the `useExerciseLogManager` hook to return the `setSearchResults` function. Then, I will update the `ManageClientExerciseLogs` component to properly destructure and use this function. I will also correct the type assertions for the `sets` property, which is of type `JsonValue`, in both the `ManageClientExerciseLogs` and `ExerciseProgressChart` components to ensure type safety.

### src/hooks/useExerciseLogManager.ts
```ts
```

### src/components/clients/modules/ExerciseProgressChart.tsx
```tsx
```

### src/components/clients/modules/ManageClientExerciseLogs.tsx
```tsx

```