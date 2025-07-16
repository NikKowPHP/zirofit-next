You are absolutely right. That is a critical omission in the previous plan. Thank you for catching it.

Yes, all existing tests **must** be updated. Otherwise, the test suite will become completely broken and useless, giving false negatives and failing the build. The changes we've made to routing, component text, and server action responses will break almost every test.

Here’s a breakdown of *why* the tests will break and *how* we need to update them, followed by a revised, comprehensive to-do list that includes testing.

### Why Tests Must Be Updated

1.  **URL Changes:** All E2E tests that navigate using `page.goto('/dashboard')` will now fail because the correct path is `/en/dashboard` or `/pl/dashboard`.
2.  **Text-Based Selectors:** The majority of tests use text to find elements (e.g., `screen.getByText('Dashboard')` or `getByRole('button', { name: 'Log In' })`). Since all this text is being replaced by translation keys, these selectors will no longer find the elements.
3.  **Component Rendering:** Any component using `useTranslations` or other `next-intl` hooks now requires the `NextIntlClientProvider` in its render tree. Unit tests that render these components in isolation will fail without this provider.
4.  **Server Action Mocks:** Tests for server actions that used to assert `result.message` will now fail because the actions return `result.messageKey`.

### The Strategy for Updating Tests

We need to make our tests "i18n-aware" and more resilient to text changes.

**For Jest / React Testing Library (Unit/Component Tests):**

1.  **Create a Test Helper:** We'll create a custom `render` function that wraps components with the necessary `NextIntlClientProvider` and mock messages. This avoids boilerplate in every test file.
2.  **Test Against Keys, Not Values:** Instead of asserting `expect(screen.getByText('Dashboard')).toBeInTheDocument()`, we will provide mock translations to our test helper and assert against the translated value. This confirms the component is using the *correct translation key*.

**For Playwright (E2E Tests):**

1.  **Update Navigation:** All `page.goto()` calls must be updated to include the `/en/` or `/pl/` locale prefix.
2.  **Use Test IDs:** Relying on text for E2E tests is now brittle. The best practice is to add `data-testid` attributes to key interactive elements (buttons, inputs, etc.) and update Playwright selectors to use them (e.g., `page.getByTestId('login-submit-button')`). This decouples the test from the specific language.

---

### **Revised & Complete To-Do List (with Testing)**

Here is the final, comprehensive plan.

**Phase A: Core i18n Infrastructure**
*   [x] **Task 1.1 - 1.6:** All infrastructure tasks (installing `next-intl`, creating files, updating middleware and layouts) are complete.
*   [ ] **Task 1.7: Implement I18n for Zod Validation**
    *   Create a utility to provide translated error messages for Zod schemas.
    *   Refactor all server actions to use this utility for validation.

**Phase B: Translating Public-Facing UI & Updating Tests**
*   [ ] **Task 2.1: Create a Test Renderer Helper**
    *   Create a new file, e.g., `tests/test-utils.tsx`.
    *   Define a `renderWithIntl` function that wraps components in `<NextIntlClientProvider>` and accepts mock messages.
*   [ ] **Task 2.2: Translate `PublicLayout` and Update its Tests.**
*   [ ] **Task 2.3: Translate `HomePage`, `TrainerSearch` and Update Their Tests.**
*   [ ] **Task 2.4: Translate `TrainersPage`, `SortControl`, `TrainerResultCard` and Update Their Tests.**
*   [ ] **Task 2.5: Translate `TrainerProfilePage`, `PublicCalendar`, `ContactForm` and Update Their Tests.**

**Phase C: Translating Authenticated Views (Dashboard) & Updating Tests**
*   [ ] **Task 3.1: Translate Dashboard Layout & Navigation Components**
    *   Translate `TrainerDashboardLayout`, `LogoutButton`, `NotificationIndicator`, `NotificationList`.
    *   Update any associated Jest tests using the new `renderWithIntl` helper.
*   [ ] **Task 3.2: Translate Dashboard Pages & Components**
    *   Translate all components in `src/app/[locale]/dashboard/_components/`.
    *   Update the `DashboardContent.test.tsx` to work with the translated content.
*   [ ] **Task 3.3: Translate Client Management UI**
    *   Translate all components in `src/app/[locale]/clients/` and `src/components/clients/`.
    *   Update all Jest tests for these components.
*   [ ] **Task 3.4: Translate Profile Editor UI**
    *   Translate all components in `src/components/profile/sections/`.
    *   Update all Jest tests for these components.

**Phase D: Translating Backend Messages & Updating Tests**
*   [ ] **Task 4.1: Internationalize Server Action Responses & Update Tests**
    *   Refactor all server actions to return `messageKey`.
    *   Update all corresponding server action Jest tests (e.g., `auth/actions.test.ts`) to assert that the correct `messageKey` is returned, not a hardcoded string.
*   [ ] **Task 4.2: Internationalize Email Templates & Update Tests**
    *   Modify `notificationService.ts` to accept a `locale`.
    *   Update `notificationService.test.ts` to pass a mock `locale` and assert that `getTranslations` is called correctly.

**Phase E: E2E Test Suite Migration**
*   [ ] **Task 5.1: Add `data-testid` Attributes**
    *   Go through all interactive client components (buttons, inputs, links) that are targeted in E2E tests and add a `data-testid` attribute.
*   [ ] **Task 5.2: Update All E2E Tests**
    *   In `tests/e2e/`, update all `page.goto()` calls to use a locale prefix (e.g., `page.goto('/en/dashboard')`).
    *   Replace all text-based selectors (`getByText`, `getByRole` with a `name`) with `getByTestId`.
    *   Run the entire E2E suite to ensure it passes for the primary locale (`/en`).
*   [ ] **Task 5.3 (Optional but Recommended): Parameterize E2E Tests**
    *   Modify the Playwright configuration to run the entire test suite against both the `en` and `pl` locales to catch any language-specific bugs.

**Phase F: Finalization & QA**
*   [ ] **Task 6.1:** Internationalize all date/time formatting.
*   [ ] **Task 6.2:** Create and add the `LanguageSwitcher` component.
*   [ ] **Task 6.3:** Perform final, comprehensive manual testing across both languages, covering all UI, validation messages, and emails.

This revised plan is much more robust and ensures that your testing suite remains a valuable asset for maintaining application quality after this major refactoring.