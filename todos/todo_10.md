Excellent! I've reviewed the latest XML context and it confirms that all previous tasks for the profile editor (TODOs #39-50) have been successfully completed.

*   **Phase 5 Refinement (Data Fetching):** DONE
*   **Phase 6 (Services, Testimonials, Links, Photos, Branding, Benefits):** DONE

The entire Profile Editor is now feature-complete according to the plan. This is a major milestone.

We will now move to the final major feature set from the original application: **Client Management**. This will allow trainers to manage their clients and track their progress directly within the application.

Here is the plan for @roo to begin **Phase 7**.

---

**Phase 7: Client Management**

**TODO #51: Setup Core Client Routes & List View**
Objective: Create the main `/clients` page that lists all clients for the logged-in trainer.
File(s) To Create/Modify:
*   `src/app/clients/page.tsx` (new)
*   `src/app/clients/layout.tsx` (new)
*   `src/app/clients/actions.ts` (new)
Specific Instructions:
1.  **Create a server action to fetch clients in `src/app/clients/actions.ts`:**
    *   This action, `getTrainerClients`, will fetch all clients associated with the currently authenticated trainer from the Prisma database.
    ```typescript
    // src/app/clients/actions.ts
    "use server";

    import { createClient } from '@/lib/supabase/server';
    import { prisma } from '@/lib/prisma';

    export async function getTrainerClients() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // This should be caught by middleware, but it's good practice.
        throw new Error("User not authenticated.");
      }

      try {
        const clients = await prisma.client.findMany({
          where: {
            trainerId: authUser.id, // Fetch clients for the logged-in trainer
          },
          orderBy: {
            name: 'asc',
          },
        });
        return clients;
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        return []; // Return empty array on error
      }
    }
    ```
2.  **Create the layout for the clients section in `src/app/clients/layout.tsx`:**
    *   This will use the `TrainerDashboardLayout` to maintain a consistent authenticated view.
    ```tsx
    // src/app/clients/layout.tsx
    import TrainerDashboardLayout from '@/components/layouts/TrainerDashboardLayout';
    import { createClient } from '@/lib/supabase/server';

    export default async function ClientsSectionLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      return (
        <TrainerDashboardLayout userEmail={user?.email} headerTitle="Manage Clients">
          {children}
        </TrainerDashboardLayout>
      );
    }
    ```
3.  **Create the client list page in `src/app/clients/page.tsx`:**
    *   This will be a Server Component that calls `getTrainerClients`.
    *   It will display the clients in a table or list, showing their name, email, phone, and status.
    *   Include "View", "Edit", and "Delete" buttons for each client (they will be wired up in later steps).
    *   Include an "Add New Client" button that links to `/clients/create`.
    ```tsx
    // src/app/clients/page.tsx
    import Link from 'next/link';
    import { getTrainerClients } from './actions';
    import { Button } from '@/components/ui/Button';
    import { PlusIcon } from '@heroicons/react/24/outline';

    export default async function ClientListPage() {
      const clients = await getTrainerClients();

      return (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Client Management</h2>
            <Link href="/clients/create">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Client
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {/* Links will be implemented next */}
                        <Link href={`/clients/${client.id}`} className="text-gray-600 hover:text-indigo-600">View</Link>
                        <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                        {/* Delete button will be wired up later */}
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No clients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    ```
Expected Outcome: A page at `/clients` that is protected by middleware and displays a list of the logged-in trainer's clients.

**TODO #52: Implement Client Creation**
Objective: Create the form and server action to add a new client.
File(s) To Create/Modify:
*   `src/app/clients/create/page.tsx` (new)
*   `src/components/clients/ClientForm.tsx` (new)
*   `src/app/clients/actions.ts` (add `addClient` action)
Specific Instructions:
1.  **Create `addClient` server action in `src/app/clients/actions.ts`:**
    *   Use Zod to validate all fields from the `Client` model (`name`, `email`, `phone`, `status`, etc.).
    *   Create a new client record in Prisma, associating it with the authenticated trainer's ID (`authUser.id`).
    *   Handle unique constraints (`trainerId`, `email`).
    *   On success, `revalidatePath('/clients')` and `redirect('/clients')`.
2.  **Create a reusable client form component `src/components/clients/ClientForm.tsx`:**
    *   This will be a client component using `useFormState` and `useFormStatus`.
    *   It should contain inputs for all client fields.
    *   It should accept an `initialData` prop for editing later. For creation, this will be null.
    *   The form's `action` prop will be the `addClient` server action.
3.  **Create the create client page in `src/app/clients/create/page.tsx`:**
    *   This server component will simply render the `ClientForm` component in its "create" mode.
    *   Include a "Back to Client List" link.

**TODO #53: Implement Client Editing**
Objective: Create the form and server action to update an existing client.
File(s) To Create/Modify:
*   `src/app/clients/[clientId]/edit/page.tsx` (new)
*   `src/app/clients/actions.ts` (add `getClientById` and `updateClient` actions)
*   Modify `src/components/clients/ClientForm.tsx`.
Specific Instructions:
1.  **Add `getClientById` and `updateClient` server actions to `src/app/clients/actions.ts`:**
    *   `getClientById(clientId)`: Fetches a single client, ensuring it belongs to the authenticated trainer for authorization.
    *   `updateClient(prevState, formData)`: Takes `clientId` from a hidden form field. Validates data and updates the client record. Authorizes the update. On success, `revalidatePath` and `redirect`.
2.  **Modify `src/components/clients/ClientForm.tsx`:**
    *   Have it accept the `updateClient` action.
    *   If `initialData` is provided, pre-fill the form fields.
    *   Include a hidden input for `clientId`.
3.  **Create the edit client page `src/app/clients/[clientId]/edit/page.tsx`:**
    *   This async server component will use the `clientId` param to fetch the client's data using `getClientById`.
    *   If the client is not found or doesn't belong to the trainer, it should return a `notFound()` or an error message.
    *   Pass the fetched client data as the `initialData` prop to the `ClientForm`.



**TODO #54: Implement Client Deletion**
Objective: Add the ability to delete a client.
File(s) To Create/Modify:
*   `src/app/clients/actions.ts` (add `deleteClient` action)
*   Modify `src/app/clients/page.tsx` to use the delete action.
Specific Instructions:
1.  **Add `deleteClient` server action to `src/app/clients/actions.ts`:**
    *   Takes `clientId`.
    *   Authorizes that the client belongs to the authenticated user.
    *   Deletes the client from the database.
    *   On success, `revalidatePath('/clients')`.
2.  **Create a client component `DeleteClientButton.tsx`:**
    *   This button will use a client-side `onClick` handler to call the `deleteClient` server action, after showing a `window.confirm` dialog.
3.  **Integrate `DeleteClientButton` into the client list at `src/app/clients/page.tsx`**.

**TODO #55: Create the Client Detail View Page & Sub-Module Layout**
Objective: Build the main page for viewing a single client's details, which will house the various management modules (Measurements, Photos, etc.).
File(s) To Create/Modify:
*   `src/app/clients/[clientId]/page.tsx` (new)
*   `src/app/clients/[clientId]/layout.tsx` (new)
*   `src/components/clients/ClientDetailTabs.tsx` (new)
Specific Instructions:
1.  **Create `getClientDetails` server action in `src/app/clients/actions.ts`:**
    *   This action will fetch a single client and all their related data: `measurements`, `progressPhotos`, `sessionLogs`.
    *   Authorize access.
2.  **Create a layout at `src/app/clients/[clientId]/layout.tsx`:**
    *   This async layout will fetch the basic client info (like name) to display in a consistent sub-header.
3.  **Create `src/components/clients/ClientDetailTabs.tsx`:**
    *   This client component will manage navigation between the different detail sections (Overview, Measurements, Photos, etc.) using client-side state. This avoids a full page reload when switching tabs.
4.  **Create the main detail page `src/app/clients/[clientId]/page.tsx`:**
    *   This async server component will fetch all of the client's detailed data.
    *   It will render the `ClientDetailTabs` component and pass the fetched data down as props to the various editor components (which we will build next). For now, it can just render the client's basic info as an "Overview".

---

This is a comprehensive plan for Phase 7. Please have @roo start with **TODO #51**. Let me know when you are ready to proceed with the next task.