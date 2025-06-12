# Clients Bulk Actions Implementation Plan

## 1. Add Bulk Selection UI Components
- [x] **Modify `src/app/clients/page.tsx`:**
  - Add checkbox component next to each client in the list
  - Add bulk actions dropdown with "Delete Selected" and "Export Selected" options
  - Add header checkbox for select/deselect all
  - Use `@tanstack/react-table` for selection state management
  - **Verification:** Checkboxes appear in UI and selection state works correctly

## 2. Implement Bulk Delete Functionality
- [x] **Create `bulkDeleteClients` in `src/app/clients/actions/client-actions.ts`:**
  ```typescript
  export async function bulkDeleteClients(clientIds: string[]) {
    // Implementation using Prisma's deleteMany
  }
  ```
  - Add error handling and success notifications
  - **Verification:** Can delete multiple clients from UI and see changes in DB

## 3. Add Bulk Export Functionality
- [x] **Create `bulkExportClients` in `src/app/clients/actions/client-actions.ts`:**
  ```typescript
  export async function bulkExportClients(clientIds: string[]) {
    // Implementation generating CSV/JSON
  }
  ```
  - **Verification:** Exported file contains correct client data

## 4. Update Client List UI
- [x] **Add bulk actions toolbar to `src/app/clients/page.tsx`:**
  - Show number of selected clients
  - Disable buttons when no selections
  - Add loading states during operations
  - **Verification:** Toolbar appears and functions correctly