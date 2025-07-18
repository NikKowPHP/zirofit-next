### [BASH_COMMANDS]
```bash
mkdir -p "src/app/[locale]/client-dashboard/log-workout"
mkdir -p "src/app/[locale]/client-dashboard/my-progress"
mkdir -p "src/app/[locale]/client-dashboard/my-trainer"
mkdir -p "src/components/clients/dashboard"
touch "src/app/[locale]/client-dashboard/log-workout/page.tsx"

touch "src/app/[locale]/client-dashboard/my-progress/page.tsx"

touch "src/app/[locale]/client-dashboard/my-trainer/page.tsx"
touch "src/app/[locale]/client-dashboard/layout.tsx"
touch "src/app/[locale]/client-dashboard/page.tsx"

touch "src/components/clients/dashboard/ClientDashboardLayout.tsx"
touch "src/components/clients/dashboard/LogWorkout.tsx"
touch "src/components/clients/dashboard/MyProgress.tsx"
touch "src/components/clients/dashboard/MyTrainer.tsx"
touch "src/hooks/useMyExerciseLogManager.ts"
```
### src/app/[locale]/auth/actions.ts
```typescript
```
### src/app/[locale]/client-dashboard/actions.ts
```typescript
```
### src/app/[locale]/client-dashboard/layout.tsx
```typescript
```
### src/app/[locale]/client-dashboard/log-workout/page.tsx
```typescript
```
### src/app/[locale]/client-dashboard/my-progress/page.tsx
```typescript
```
### src/app/[locale]/client-dashboard/my-trainer/page.tsx
```typescript
```
### src/app/[locale]/client-dashboard/page.tsx
```typescript
```
### src/components/clients/dashboard/ClientDashboardLayout.tsx
```typescript
```
### src/components/clients/dashboard/LogWorkout.tsx
```typescript
```
### src/components/clients/dashboard/MyProgress.tsx
```typescript
```
### src/components/clients/dashboard/MyTrainer.tsx
```typescript
```
### src/hooks/useMyExerciseLogManager.ts
```typescript
```
### docs/phases/phase-a-fix.md
```markdown
Of course. Here is the final, consolidated, and complete step-by-step plan. It integrates all the refinements and edge cases discussed, providing a robust roadmap for implementation.

---

### **Final Plan: Client Role & Self-Service Workout Logging**

**Goal:** Enable users to sign up as "Clients", log their own workout data, view progress, and securely share/unshare this data with trainers, ensuring a seamless experience and data integrity for all parties.

---

### Part 1: Backend Foundation & Authentication

- [x] **1.1. Enhance Database Schema (`prisma/schema.prisma`)**
    - [x] Modify the `User` model: Change the `role` field to be required without a default value.
    - [x] Modify the `Client` model:
        - [x] Add a new nullable, unique field: `userId String? @unique`.
        - [x] Add the corresponding relation: `user User? @relation("ClientUser", fields: [userId], references: [id], onDelete: SetNull)`.
        - [x] Make the `trainerId` field nullable: `trainerId String?`.
        - [x] Update the `trainer` relation with a name to disambiguate: `trainer User? @relation("TrainerClients", fields: [trainerId], references: [id], onDelete: Cascade)`.
        - [x] Add the new relations to the `User` model: `clients Client[] @relation("TrainerClients")` and `selfManagedClient Client? @relation("ClientUser")`.
- [x] **1.2. Update Database**
    - [x] Run `npx prisma migrate dev --name add_client_role_and_linking` and approve the migration.
- [x] **1.3. Modify User Registration Flow (`src/app/[locale]/auth/actions.ts`)**
    - [x] Update the Zod schema (`getRegisterSchema`) to require a `role` field (must be `'client'` or `'trainer'`).
    - [x] Modify the `registerUser` server action to accept and use the `role` from `formData` when creating the new `User`.
- [x] **1.4. Update Registration UI (`src/app/[locale]/auth/register/page.client.tsx`)**
    - [x] Add a clear, two-option radio button group for role selection ("I am a Client" / "I am a Trainer").
- [x] **1.5. Implement Role-Based Logic**
    - [x] **Middleware (`src/middleware.ts`):**
        - [x] After auth, check user's role.
        - [x] Redirect `trainer` roles to `/dashboard`.
        - [x] Redirect `client` roles to `/client-dashboard`.
        - [x] Define and protect client-only routes (e.g., `/client-dashboard/*`).
    - [x] **Page-Level (`/client-dashboard/page.tsx`, etc.):**
        - [x] Add a server-side check on protected pages to re-verify the user's role for defense-in-depth security.
- [x] **1.6. Update Trainer's "Add Client" Flow (`src/app/[locale]/clients/actions/client-actions.ts`)**
    - [x] In the `addClient` server action, before creating a new `Client`, check if a `User` with the provided email already exists.
    - [x] If a `User` exists, return a specific error message.
- [x] **1.7. Implement "Request Access" Flow**
    - [x] **Backend (`src/app/[locale]/client-dashboard/actions.ts`):**
        - [x] Create a new server action `requestClientLink(clientEmail: string)`.
        - [x] This action finds the client `User` by email and creates a new `Notification` for them with a special type (e.g., `link_request`) and payload containing the trainer's ID.
    - [x] **UI (`src/components/clients/ClientForm.tsx`):**
        - [x] When the "user already exists" error is returned, hide the standard error message and instead display a "Request Access" button.
        - [x] Wire this button to call the `requestClientLink` action.

### Part 2: Client Account Creation & Data Scaffolding

- [x] **2.1. Create Self-Managed Client Record (`src/app/[locale]/auth/actions.ts`)**
    - [x] In `registerUser`, if the role is `'client'`, immediately create a corresponding `Client` record with `userId` set and `trainerId` as `null`.
- [x] **2.2. Create New Server Actions for Client Self-Logging (`src/app/[locale]/client-dashboard/actions.ts`)**
    - [x] Implement `addMyExerciseLog`, `updateMyExerciseLog`, and `deleteMyExerciseLog`.
    - [x] Ensure all actions securely resolve the logged-in `User.id` to their self-managed `Client.id` before performing any database operations.

### Part 3: Client Dashboard Implementation

- [x] **3.1. Create Client Dashboard Routes and Layout**
    - [x] Create directory: `src/app/[locale]/client-dashboard/`.
    - [x] Create `layout.tsx` with client-specific navigation (e.g., Dashboard, Log Workout, My Trainer).
    - [x] Create `page.tsx` for the main dashboard view.
- [x] **3.2. Implement Client-Side Exercise Logging UI**
    - [x] Create a `LogWorkout.tsx` component, reusing UI patterns from `ManageClientExerciseLogs.tsx`.
    - [x] Create a `useMyExerciseLogManager` hook adapted for the new self-service actions.
- [x] **3.3. Implement Client Statistics and Progress View**
    - [x] Create a `MyProgress.tsx` component, reusing `ClientStatistics.tsx` and `ExerciseProgressChart.tsx`.
- [x] **3.4. Implement "My Trainer" / "Sharing" Section in Client Dashboard**
    - [x] Create a component that displays the linked trainer's info if `trainerId` is not null.
    - [x] This component will contain the "Unlink from Trainer" button.
- [x] **3.5. Design and Implement Empty States**
    - [x] Create a welcoming empty state for the client dashboard that guides new users on what to do next (log a workout or find a trainer).

### Part 4: Trainer Discovery & Data Sharing Flow

- [ ] **4.1. Create the `shareDataWithTrainer(trainerUsername: string)` Server Action (`src/app/[locale]/client-dashboard/actions.ts`)**
    - [ ] The entire action's database logic **must be wrapped in `prisma.$transaction`** to ensure atomicity.
    - [ ] Implement merge logic: If a trainer-created `Client` record exists for the user's email, consolidate data.
        - [ ] **Consolidation Strategy:** Use `prisma.clientExerciseLog.updateMany` (and similar for other data types) to re-assign the `clientId` of self-logged data to the trainer's `Client` record ID.
        - [ ] Update the trainer's `Client` record to set its `userId`.
        - [ ] Delete the now-empty self-managed `Client` record.
    - [ ] Implement fresh link logic: If no pre-existing record, update the self-managed `Client` record's `trainerId`.
    - [ ] Create an in-app notification for the trainer.
- [ ] **4.2. Create the `unlinkFromTrainer()` Server Action (`src/app/[locale]/client-dashboard/actions.ts`)**
    - [ ] Get the current client's `User` and linked `Client` records.
    - [ ] Set the `trainerId` on the `Client` record back to `null`.
    - [ ] **Crucially, also set the `userId` field to `null` on the trainer's former `Client` record** to break the active link while preserving historical data for the trainer.
    - [ ] Create a notification for the trainer about the unlink event.
- [ ] **4.3. Add "Share Data" Button to Trainer Profile (`src/app/[locale]/trainer/[username]/page.tsx`)**
    - [ ] Add a server-side check to display the "Share My Data" button only for logged-in users with the `client` role.
- [ ] **4.4. Create Sharing Confirmation UI**
    - [ ] Build the client component with the confirmation modal that calls the `shareDataWithTrainer` action.

### Part 5: Trainer-Side Integration

- [ ] **5.1. Update Trainer's Client List UI (`src/components/clients/ClientGrid.tsx`)**
    - [ ] Fetch the `userId` field when calling `getTrainerClients`.
    - [ ] Add a visual "Linked Account" indicator for clients with a non-null `userId`.
- [ ] **5.2. Verify Data Display in `ClientDetailView`**
    - [ ] Manually confirm that after a client links, all their historical and newly logged data appears correctly in the trainer's view.

### Part 6: Testing & Finalization

- [ ] **6.1. Unit & Component Tests**
    - [ ] Test `shareDataWithTrainer`, specifically mocking `prisma.$transaction` and verifying the data merge logic.
    - [ ] Test the `unlinkFromTrainer` action, ensuring foreign keys are correctly nulled.
    - [ ] Test the updated `addClient` action to confirm it returns the correct error for an existing user.
- [ ] **6.2. End-to-End (E2E) Testing**
    - [ ] **Scenario 1:** New Client -> Log Data -> Share -> Unlink -> Verify states for both client and trainer at each step.
    - [ ] **Scenario 2:** Trainer Adds Client -> Client Registers -> Client Logs Data -> Client Links Account -> Verify data is merged correctly.
    - [ ] **Scenario 3:** Trainer attempts to add an existing client -> Verify "Request Access" UI appears and the notification flow works.
- [ ] **6.3. Documentation & Cleanup**
    - [ ] Update `docs/app_description.md` to reflect the new client role, self-service features, and sharing flow.
    - [ ] Remove any temporary or unused code.

This final plan is comprehensive, addressing the feature from the database schema up to the user experience, including critical edge cases and security considerations. You can now proceed with implementation.
```