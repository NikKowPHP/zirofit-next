Of course. Here is the updated, more detailed plan that incorporates the request for a comprehensive, production-ready list of exercises.

# ZIRO.FIT Feature Enhancement Plan (V2)

This plan outlines the necessary steps to implement UI/UX refinements and add a new, comprehensive exercise performance logging feature.

## Phase 1: Standardize Back Navigation

**Goal:** Ensure all secondary pages within the trainer dashboard use the consistent `BackLink` component for navigation.

-   [ ] **Task 1.1: Update Create Client Page**
    -   **File:** `src/app/clients/create/page.tsx`
    -   **Action:** Replace the existing `<Link>` component with the `<BackLink>` component.
    -   **Details:** Change `<Link href="/clients" ...>Back to Client List</Link>` to `<BackLink href="/clients" text="← Back to Client List" />`. Import `BackLink` from `@/components/ui/BackLink`.

-   [ ] **Task 1.2: Update Edit Client Page**
    -   **File:** `src/app/clients/[clientId]/edit/page.tsx`
    -   **Action:** Replace the existing `<Link>` component with the `<BackLink>` component.
    -   **Details:** Change `<Link href="/clients" ...>Back to Client List</Link>` to `<BackLink href="/clients" text="← Back to Client List" />`. Import `BackLink` from `@/components/ui/BackLink`.

## Phase 2: Refine Chart Empty States

**Goal:** Provide clear, user-friendly messages on charts when there is no data to display.

-   [ ] **Task 2.1: Enhance Dashboard's Client Progress Chart**
    -   **File:** `src/app/dashboard/_components/ClientProgressChart.tsx`
    -   **Action:** Add a condition to render an `EmptyState` component if the `data` prop is an empty array.
    -   **Details:** Before the `<Card>` return, add `if (!data || data.length === 0) { ... }` to return an `<EmptyState>` with a title of "No Progress Data" and a description prompting the user to add client measurements.

-   [ ] **Task 2.2: Enhance Dashboard's Monthly Activity Chart**
    -   **File:** `src/app/dashboard/_components/MonthlyActivityChart.tsx`
    -   **Action:** Add a similar empty state check for the `data` prop.
    -   **Details:** If `data` is empty, render an `<EmptyState>` component with a title like "No Activity Data" and a description like "Log client sessions to see your monthly activity."

-   [ ] **Task 2.3: Enhance Client-Specific Statistics Charts**
    -   **File:** `src/components/clients/modules/ClientStatistics.tsx`
    -   **Action:** For each chart (Weight and Body Fat), check if there's valid data to display. If not, show an `<EmptyState>`.
    -   **Details:** Inside the component, filter the data to only include valid points. For each chart's container `div`, use a ternary expression: if the filtered data array is empty, render an `<EmptyState>` with a message like "No weight data logged.". Otherwise, render the `<Line>` chart component.

## Phase 3: Implement Advanced Exercise Performance Logging

**Goal:** Build a comprehensive system for trainers to log and track client performance on specific exercises.

### Sub-Phase 3.1: Database & Seeding

-   [ ] **Task 3.1.1: Update Database Schema**
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

-   [ ] **Task 3.1.2: Create and Apply Migration**
    -   **Action:** Run the Prisma migration command to apply schema changes to the database.
    -   **Command:** `npx prisma migrate dev --name add_exercise_logging`

-   [ ] **Task 3.1.3: Create Comprehensive Exercise Seed Data**
    -   **File:** `prisma/data/exercises.json` (New file)
    -   **Action:** Create a **production-ready, comprehensive JSON file** containing a large, categorized list of exercises.
    -   **Requirements:**
        1.  **Size:** The list must contain at least **200 exercises** to be considered comprehensive.
        2.  **Categorization:** Exercises must be categorized by `muscleGroup` and `equipment`.
        3.  **Coverage:** Ensure all major muscle groups are covered (e.g., Chest, Back, Shoulders, Biceps, Triceps, Quadriceps, Hamstrings, Glutes, Calves, Abs).
        4.  **Equipment Variety:** Include exercises for various equipment types (e.g., Barbell, Dumbbell, Kettlebell, Machine, Cable, Bands, Bodyweight).
        5.  **Structure:** Each entry must be a JSON object with `name` (string), `muscleGroup` (string), and `equipment` (string).

-   [ ] **Task 3.1.4: Create Seeding Script**
    -   **File:** `prisma/seed-exercises.ts` (New file)
    -   **Action:** Write a script to read `prisma/data/exercises.json` and populate the `Exercise` table, avoiding duplicates.
    -   **Details:** The script will connect to Prisma, iterate through the JSON data, and use `prisma.exercise.upsert` with the `name` field as the unique identifier to add each exercise. Log the number of exercises added or updated.

-   [ ] **Task 3.1.5: Add Seeder Script to `package.json`**
    -   **File:** `package.json`
    -   **Action:** Add a new script to the `"scripts"` section to easily run the seeder.
    -   **Details:** `"db:seed-exercises": "npx ts-node --project tsconfig-seed.json prisma/seed-exercises.ts"`

### Sub-Phase 3.2: Backend Logic

-   [ ] **Task 3.2.1: Extend Client Service**
    -   **File:** `src/lib/services/clientService.ts`
    -   **Action:** Add new functions for `Exercise` and `ClientExerciseLog` CRUD, and update the client details payload.
    -   **Details:**
        -   Create `searchExercises(query: string)`.
        -   Create `createExerciseLog(...)`, `updateExerciseLog(...)`, `deleteExerciseLog(...)`.
        -   Update `getClientDetailsForTrainer` to `include` `exerciseLogs`, ordered by `logDate`.

-   [ ] **Task 3.2.2: Create Exercise Log Server Actions**
    -   **File:** `src/app/clients/actions/exercise-log-actions.ts` (New file)
    -   **Action:** Create server actions that wrap the new service functions.
    -   **Details:** Implement `searchExercises`, `addExerciseLog`, `updateExerciseLog`, and `deleteExerciseLog` actions. Use Zod for validation, especially for the `sets` JSON data which should be an array of objects with `reps` and `weight`.

-   [ ] **Task 3.2.3: Export New Actions**
    -   **File:** `src/app/clients/actions.ts`
    -   **Action:** Export all functions from the new `exercise-log-actions.ts` file.

### Sub-Phase 3.3: Frontend UI & Integration

-   [ ] **Task 3.3.1: Create Exercise Progress Chart Component**
    -   **File:** `src/components/clients/modules/ExerciseProgressChart.tsx` (New file)
    -   **Action:** Build a reusable line chart component to visualize performance for a single exercise over time.
    -   **Details:** The chart should be able to display total volume (`sets * reps * weight`) or 1-rep max estimates. It must handle empty states gracefully.

-   [ ] **Task 3.3.2: Create Exercise Log Management Hook**
    -   **File:** `src/hooks/useExerciseLogManager.ts` (New file)
    -   **Action:** Create a custom hook to encapsulate the logic for managing exercise logs on the client.
    -   **Details:** This hook will manage state for the logs list, the dynamic "sets" form, searching exercises (debounced), and handling form submissions via server actions.

-   [ ] **Task 3.3.3: Create Exercise Log Management UI**
    -   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx` (New file)
    -   **Action:** Build the main component for the new "Exercise Performance" tab.
    -   **Details:**
        -   Use the `useExerciseLogManager` hook.
        -   Implement a form for adding new logs. This form must include:
            -   A date picker.
            -   A searchable input that calls the `searchExercises` action to find an exercise.
            -   A dynamic section where the user can click "Add Set" to add new rows for `reps` and `weight`.
        -   Display a list of historical logs, grouped by exercise.
        -   Integrate the `ExerciseProgressChart`, allowing a user to click an exercise to see its historical performance chart.

-   [ ] **Task 3.3.4: Integrate New Tab in Client Detail View**
    -   **File:** `src/components/clients/ClientDetailView.tsx`
    -   **Action:** Add "Exercise Performance" to the `tabs` array and `tabContent` object.
    -   **Details:** Use `React.lazy` to dynamically import the new `ManageClientExerciseLogs` component for better performance. Pass the client ID and initial exercise logs as props.


