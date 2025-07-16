### docs/phases/phase-a-fix.md
```
*   [x] **Task 3.5: Update All Dashboard-Related Unit/Component Tests**
    *   **Action:** Create a `tests/test-utils.tsx` file with a `renderWithIntl` helper function. Update all Jest tests for the components modified in this phase to use this helper and assert against translated text.

**Phase D - COMPLETE**

**Phase E: E2E Test Suite Migration**
*   [x] **Task 5.1: Add `data-testid` Attributes**
    *   **Action:** Go through all components that are targeted in E2E tests (e.g., login/register forms, search buttons, dashboard navigation) and add stable `data-testid` attributes.
*   [x] **Task 5.2: Update All E2E Tests**
    *   **Directory:** `tests/e2e/`
    *   **Action:** For every `.spec.ts` file, change `page.goto('/...')` to `page.goto('/en/...')`. Replace all text-based selectors (`getByText`, `getByRole`) with `getByTestId`. Run the full suite to ensure it passes for the `/en` locale.

**Phase F: Finalization and Polish**
*   [x] Task 6.1: Add Language Switcher
*   [ ] **Task 6.2: Update SEO Files**
    *   **File:** `src/app/sitemap.ts`
    *   **Action:** Refactor the sitemap generation to loop through all `locales` from `i18n.ts` and create language-specific alternate links for each page.
    *   **File:** `src/app/robots.ts`
    *   **Action:** Update `disallow` rules to use a wildcard for locales (e.g., change `disallow: /dashboard/` to `disallow: /*/dashboard/`).
*   [ ] **Task 6.3: Create Internationalized Error Pages**
    *   **File:** `src/app/[locale]/not-found.tsx` (Create)
    *   **Action:** Build a 404 page that uses `getTranslations` to display a translated "Page Not Found" message.
    *   **File:** `src/app/[locale]/error.tsx` (Create)
    *   **Action:** Build a generic error boundary component that uses `useTranslations` for its content.
*   [ ] **Task 6.4: Full QA and Review**
    *   **Action:** Perform a final, end-to-end manual test of the entire application in both English and Polish. Verify all UI text, dates, emails, and error states. Check the production build for any issues.
```
### src/app/[locale]/auth/login/page.client.tsx
```
```
### src/app/[locale]/auth/register/page.client.tsx
```
// src/app/auth/register/page.client.tsx

```
### src/app/[locale]/dashboard/bookings/page.tsx
```
```
### src/app/[locale]/trainers/page.tsx
```
```
### src/components/home/TrainerSearch.tsx
```
```
### src/components/layouts/PublicLayout.tsx
```
```
### src/components/trainer/PublicCalendar.tsx
```
```
### src/components/trainers/SortControl.tsx
```
```
### src/components/trainers/TrainerGrid.tsx
```
```
### src/components/trainers/TrainerResultCard.tsx
```
```
### src/components/trainers/TrainersMap.tsx
```
```
### tests/e2e/auth.spec.ts
```
```
### tests/e2e/booking.spec.ts
```
```
### tests/e2e/dashboard.spec.ts
```
```
### tests/e2e/trainers-search.spec.ts
```
```