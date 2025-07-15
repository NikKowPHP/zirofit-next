### [BASH_COMMANDS]
```bash
mkdir -p src/messages
mkdir -p "src/app/[locale]"
mv src/app/auth "src/app/[locale]/auth"
mv src/app/clients "src/app/[locale]/clients"
mv src/app/dashboard "src/app/[locale]/dashboard"
mv src/app/profile "src/app/[locale]/profile"
mv src/app/trainer "src/app/[locale]/trainer"
mv src/app/trainers "src/app/[locale]/trainers"
mv src/app/layout.tsx "src/app/[locale]/layout.tsx"
mv src/app/page.tsx "src/app/[locale]/page.tsx"
touch src/i18n.ts
touch src/messages/en.json
touch src/messages/pl.json
```
### docs/phases/phase-a-fix.md
```markdown
Understood. That is a very practical and common approach for the initial phase of internationalization. We will focus exclusively on translating the application's UI and system-generated text, leaving all user-generated content (like trainer bios, service descriptions, testimonials, etc.) in its original language.

This simplifies the project significantly by removing the need for database schema changes. The plan is now leaner and focuses on the chrome of the application.

Here is the revised, step-by-step task plan based on this clear constraint.

---

### **Project: UI Internationalization (en/pl)**

**Goal:** Translate the application's user interface, system messages, validation errors, and emails into English and Polish. User-generated content from the database will remain untranslated.

---

### **Phase A: Core i18n Infrastructure**

*   [x] **Task 1.1: Install Dependencies**
    *   Add `next-intl` to `package.json`.
    *   Run `npm install`.

*   [x] **Task 1.2: Create Translation Files**
    *   Create the `src/messages` directory.
    *   Create `en.json` and `pl.json` inside it with some initial keys.

*   [x] **Task 1.3: Configure `next-intl`**
    *   Create `src/i18n.ts` to define locales and message loading logic.

*   [x] **Task 1.4: Implement Locale-based Routing**
    *   In `src/app`, create a `[locale]` directory and move all UI-related pages and layouts into it. The `api` directory remains outside.

*   [x] **Task 1.5: Update Middleware**
    *   Modify `src/middleware.ts` to integrate `next-intl/middleware` for automatic locale detection and routing, while preserving existing authentication rules.

*   [x] **Task 1.6: Update Root Layout**
    *   Modify `src/app/[locale]/layout.tsx` to:
        *   Wrap the `<body>` content with `<NextIntlClientProvider messages={useMessages()}>`.
        *   Set the `lang` attribute on the `<html>` tag to the current locale.
        *   Generate alternate `hreflang` link tags in the metadata for SEO.

*   [x] **Task 1.7: Implement I18n for Zod Validation**
    *   Create a utility (e.g., `src/lib/zod-i18n.ts`) to provide translated error messages for Zod schemas based on the current locale.
    *   Refactor all Zod schemas in server actions to use this new utility for user-facing validation messages.

### **Phase B: Translating Public-Facing UI**

*   [ ] **Task 2.1: Translate Shared Public Layout**
    *   In `PublicLayout` (`/src/components/layouts/PublicLayout.tsx`), translate all navigation links, button text, and footer content.

*   [ ] **Task 2.2: Translate Home Page**
    *   In `src/app/[locale]/page.tsx`, translate metadata and headings.
    *   In `TrainerSearch` (`/src/components/home/TrainerSearch.tsx`), translate tab names ("In-Person", "Online"), placeholders, and the "Search" button.

*   [ ] **Task 2.3: Translate Trainer Search Page**
    *   In `src/app/[locale]/trainers/page.tsx`, translate the "Meet Our Trainers" heading, pagination controls, and any `EmptyState` text.
    *   Translate options within `SortControl`.
    *   Translate the "View Profile" button in `TrainerResultCard`.

*   [ ] **Task 2.4: Translate Public Trainer Profile Page**
    *   In `src/app/[locale]/trainer/[username]/page.tsx`, translate all UI-chrome headings like "About Me", "Services Offered", "What Clients Say", and "Book a Session".
    *   In `PublicCalendar`, translate all calendar UI text, including month/day names, button labels, and form placeholders.
    *   In `ContactForm`, translate all form labels and the "Send Message" button.

### **Phase C: Translating Authenticated Views (Dashboard)**

*   [ ] **Task 3.1: Translate Main Dashboard Layout & Navigation**
    *   In `TrainerDashboardLayout` (`/src/components/layouts/TrainerDashboardLayout.tsx`), translate all sidebar navigation items and the "Logged in as" text.
    *   Translate button text in the `LogoutButton`.
    *   In `NotificationIndicator` and `NotificationList`, translate titles and any static text like "No notifications".

*   [ ] **Task 3.2: Translate Dashboard Content**
    *   In `DashboardContent` and its sub-components (`AtAGlanceStats`, `ProfileChecklist`, `QuickActions`, etc.), translate all card titles and static labels.

*   [ ] **Task 3.3: Translate Client Management UI**
    *   Translate all headings, buttons, tabs, and form elements in the entire client management flow, from the client list (`ClientGrid`) to the client detail view and all its modules (`ManageClientMeasurements`, `ManageClientSessionLogs`, etc.).

*   [ ] **Task 3.4: Translate Profile Editor UI**
    *   In `ProfileEditorSidebar`, translate all section names.
    *   In every editor component within `src/components/profile/sections/`, translate all card titles, form labels, button texts, and helper/description texts.

### **Phase D: Translating Backend Messages & Emails**

*   [ ] **Task 4.1: Internationalize Server Action Responses**
    *   Refactor all server actions to return message *keys* (e.g., `{ success: true, messageKey: "profileUpdated" }`) instead of hardcoded strings.
    *   Update client-side hooks like `useServerActionToast` to use `useTranslations` to display the correct message based on the returned key.

*   [ ] **Task 4.2: Internationalize Email Templates**
    *   Modify `sendBookingConfirmationEmail` in `notificationService.ts` to accept a `locale` parameter.
    *   Use `getTranslations` within the service to fetch the appropriate email subject and body text from the JSON message files.
    *   Update the `BookingConfirmation` React email component to receive all text content via props.

### **Phase E: Finalization & Testing**

*   [ ] **Task 5.1: Internationalize Date/Time Formatting**
    *   Ensure all instances of `date-fns` or `.toLocaleDateString()` use the current locale for correct formatting.

*   [ ] **Task 5.2: Add a Language Switcher Component**
    *   Create a simple component that allows users to manually switch between `/en` and `/pl` routes. Add it to the main layouts.

*   [ ] **Task 5.3: Comprehensive QA**
    *   Thoroughly test the application in both English and Polish.
    *   Verify that all UI text, validation errors, and success messages are translated.
    *   **Crucially, verify that user-generated content (trainer bios, service titles, etc.) correctly remains untranslated.**
    *   Check `hreflang` tags in the page source for correct SEO setup.
    *   Trigger and inspect the booking confirmation email for both languages.

---

### **Out of Scope (For This Iteration)**

*   **Database Content Translation:** The schema will **not** be modified. All data entered by trainers will be stored and displayed in a single language.
*   **Data Migration:** No data migration is needed as the schema is not changing.
```
### package.json
```json

```
### src/i18n.ts
```typescript

```
### src/messages/en.json
```json

```
### src/messages/pl.json
```json
```
### src/middleware.ts
```typescript
```
### src/app/[locale]/layout.tsx
```tsx
```
### src/app/[locale]/page.tsx
```tsx
```
### src/app/[locale]/auth/actions.ts
```typescript
```
### src/app/[locale]/auth/login/page.client.tsx
```tsx
```
### src/app/[locale]/auth/login/page.tsx
```tsx
```
### src/app/[locale]/auth/register/page.client.tsx
```tsx
```
### src/app/[locale]/auth/register/page.tsx
```tsx
```
### src/app/[locale]/clients/[clientId]/edit/page.tsx
```tsx
```
### src/app/[locale]/clients/[clientId]/layout.tsx
```tsx
```
### src/app/[locale]/clients/[clientId]/page.tsx
```tsx
```
### src/app/[locale]/clients/actions.ts
```typescript
```
### src/app/[locale]/clients/create/page.tsx
```tsx
```
### src/app/[locale]/clients/layout.tsx
```tsx
```
### src/app/[locale]/clients/page.tsx
```tsx
```
### src/app/[locale]/dashboard/DashboardContent.tsx
```tsx
```
### src/app/[locale]/dashboard/bookings/page.tsx
```tsx
```
### src/app/[locale]/dashboard/layout.tsx
```tsx
```
### src/app/[locale]/dashboard/page.tsx
```tsx
```
### src/app/[locale]/profile/actions.ts
```typescript
```
### src/app/[locale]/profile/edit/page.tsx
```tsx
```
### src/app/[locale]/profile/layout.tsx
```tsx
```
### src/app/[locale]/profile/revalidate.ts
```typescript
```
### src/app/[locale]/trainer/[username]/loading.tsx
```tsx

```
### src/app/[locale]/trainer/[username]/page.tsx
```tsx
```
### src/app/[locale]/trainer/actions.ts
```typescript
```
### src/app/[locale]/trainers/page.tsx
```tsx

```
### src/components/auth/LogoutButton.tsx
```tsx
```