### [BASH_COMMANDS]
```bash
touch docs/phases/phase-a-fix.md
```
### docs/phases/phase-a-fix.md
```markdown
Of course. Here is a detailed, step-by-step plan to implement the requested features with full coverage, based on the provided codebase.

### **Feature Implementation Plan: Exercise Logging & Charting Enhancements**

This plan addresses three key user requests: fixing a bug in the exercise search, improving handling for bodyweight exercises, and enhancing progress charts for reps-based progression.

---

### **Phase 1: Fix Exercise Search Selection Loop**

**Goal:** Prevent the exercise search from re-triggering after a user selects an exercise from the dropdown list.

*   `[x]` **1.1. Update `selectedExercise` State Type**
    *   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx`
    *   **Action:** Modify the `useState` for `selectedExercise` to hold the full `Exercise` object, which includes the `equipment` property needed in Phase 2.
    *   **Change from:** `useState<{ id: string; name: string } | null>(null)`
    *   **Change to:** `useState<Exercise | null>(null)` (You may need to import `Exercise` type from the actions file).

*   `[x]` **1.2. Reset Selected Exercise on New Search**
    *   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx`
    *   **Action:** In the `onChange` handler of the search `Input`, add a line to clear the `selectedExercise` state. This ensures that when a user starts typing a new search, the previously selected exercise is cleared.
    *   **Code Snippet (`onChange` handler):**
        ```tsx
        (e) => {
          setSearchQuery(e.target.value);
          setSelectedExercise(null); // Add this line
        }
        ```

*   `[x]` **1.3. Test the Fix**
    *   **Action:** Manually test the "Add New Exercise Log" form.
    *   **Steps:**
        1.  Type a search query (e.g., "squat").
        2.  Verify the dropdown appears.
        3.  Click an exercise from the dropdown.
        4.  **Confirm:** The dropdown disappears, the input is populated with the exercise name, and no new search is triggered.
        5.  **Confirm:** Typing in the search box again clears the selection and initiates a new search correctly.

---

### **Phase 2: Implement Correct Handling for Bodyweight Exercises**

**Goal:** Make the "Weight" input optional and hidden for exercises where `equipment` is 'Bodyweight'.

*   `[x]` **2.1. Make Weight Optional in Backend Schema**
    *   **File:** `src/app/clients/actions/exercise-log-actions.ts`
    *   **Action:** Modify the `setSchema` Zod object to make the `weight` field optional.
    *   **Change from:** `weight: z.number().min(0)`
    *   **Change to:** `weight: z.number().min(0).optional()`

*   `[x]` **2.2. Conditionally Hide Weight Input in Form**
    *   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx`
    *   **Action:** Use the `selectedExercise` state to determine if the exercise is bodyweight and conditionally render the weight input fields.
    *   **Steps:**
        1.  Inside the component, define a boolean: `const isBodyweight = selectedExercise?.equipment === 'Bodyweight';`
        2.  Locate the `map` function that renders the sets (`sets.map((set, index) => ...)`).
        3.  Wrap the "Weight (kg)" `Input` and the "0 kg" `Button` inside a conditional block: `{!isBodyweight && ...}`.

*   `[x]` **2.3. Ensure Default Weight is Handled**
    *   **File:** `src/components/clients/modules/ManageClientExerciseLogs.tsx`
    *   **Action:** Verify that the hidden input for `sets` correctly processes an empty or missing weight. The current code `weight: Number(s.weight)` will correctly evaluate `Number("")` to `0`, so no changes are needed, but this confirms the logic.

*   `[x]` **2.4. Test Bodyweight Exercise Logging**
    *   **Action:** Manually test adding a log for a bodyweight exercise.
    *   **Steps:**
        1.  Search for and select "Push-up".
        2.  **Confirm:** The "Weight (kg)" input for each set is hidden.
        3.  Fill in "Reps" for one or more sets.
        4.  Submit the form.
        5.  **Confirm:** The log is added successfully to the "Exercise History" without any weight value displayed.

---

### **Phase 3: Enhance Progress Chart for Bodyweight Exercises**

**Goal:** Modify the exercise progress chart to show "Total Reps" for bodyweight exercises instead of "Total Volume".

*   `[x]` **3.1. Add Conditional Logic to Chart Data Calculation**
    *   **File:** `src/components/clients/modules/ExerciseProgressChart.tsx`
    *   **Action:** Modify the `useMemo` hook that calculates `chartData` to differentiate between exercise types.
    *   **Steps:**
        1.  Inside `useMemo`, determine the exercise type from the logs: `const isBodyweight = logs[0]?.exercise.equipment === 'Bodyweight';`.
        2.  Inside the `logs.map` function, calculate the `y` value based on this boolean.
        *   **Current `y` value calculation:** `totalVolume` (sum of `reps * weight`).
        *   **New logic:**
            ```tsx
            const yValue = isBodyweight
              ? setsArray.reduce((sum, set) => sum + (Number(set.reps) || 0), 0) // Total Reps
              : setsArray.reduce((sum, set) => sum + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0); // Total Volume

            return {
              x: new Date(log.logDate),
              y: yValue,
            };
            ```

*   `[x]` **3.2. Update Chart Labels and Titles Dynamically**
    *   **File:** `src/components/clients/modules/ExerciseProgressChart.tsx`
    *   **Action:** Make the dataset label and y-axis title dynamic.
    *   **Steps:**
        1.  Inside `useMemo` (or just before the return), define dynamic labels based on the `isBodyweight` flag.
            ```tsx
            const datasetLabel = isBodyweight ? "Total Reps" : "Total Volume (reps * weight)";
            ```
        2.  Update the returned `chartData` object to use this label: `label: datasetLabel`.
        3.  Inside the `chartOptions` object, update the y-axis title dynamically.
            ```tsx
            // You'll need to define isBodyweight outside the useMemo as well
            const isBodyweight = logs[0]?.exercise.equipment === 'Bodyweight';
            ...
            scales: {
              y: {
                title: {
                  display: true,
                  text: isBodyweight ? "Total Reps" : "Total Volume", // Update here
                  ...
                },
              ...
            },
            ```

*   `[x]` **3.3. Test Chart Behavior**
    *   **Action:** Manually test the chart rendering for both types of exercises.
    *   **Steps:**
        1.  Navigate to a client detail page with logged exercises.
        2.  Find a bodyweight exercise (e.g., "Push-up") with at least two logs.
        3.  **Confirm:** The chart title/label says "Total Reps" and the y-axis shows the sum of reps for each session.
        4.  Find a weighted exercise (e.g., "Barbell Bench Press") with at least two logs.
        5.  **Confirm:** The chart title/label says "Total Volume" and the y-axis shows the calculated volume.
```
### src/app/clients/actions/exercise-log-actions.ts
```typescript
```
### src/components/clients/modules/ExerciseProgressChart.tsx
```typescript
```
### src/components/clients/modules/ManageClientExerciseLogs.tsx
```typescript

```
### src/hooks/useExerciseLogManager.ts
```typescript
```