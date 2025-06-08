Excellent. The verification of the latest XML context confirms that all assigned tasks (TODOs #39-50) are complete.

*   **Phase 5 Refinement (Data Fetching):** DONE
*   **Phase 6 (Profile Editor CRUD for Services, Testimonials, Links, Photos, Branding, Benefits):** DONE

I also see that significant progress has been made on the next phase, Client Management (TODOs #51-54 from my internal plan). The core CRUD functionality for clients is now in place.

We will now complete the **Client Management** feature set by building the Client Detail page. This page will act as a dashboard for a single client, containing sub-modules for managing their measurements, progress photos, session logs, and viewing their statistics.

Here is the next set of tasks for @roo to finalize the application's functionality.

---

**Phase 7: Client Management - Detail View & Sub-Modules**

**TODO #51 (Revised): Create the Client Detail View Page & Tabbed Layout**
Objective: Build the main page for viewing a single client's details, which will house the various management modules.
File(s) To Create/Modify:
*   `src/app/clients/[clientId]/page.tsx` (new)
*   `src/app/clients/[clientId]/layout.tsx` (new)
*   `src/components/clients/ClientDetailView.tsx` (new)
*   `src/app/clients/actions.ts` (add `getClientDetails` action)
Specific Instructions:
1.  **Add `getClientDetails` server action to `src/app/clients/actions.ts`:**
    *   This action will fetch a single client and all their related data: `measurements`, `progressPhotos`, and `sessionLogs`.
    *   Ensure authorization by checking if the client's `trainerId` matches the authenticated user's ID.
    ```typescript
    // src/app/clients/actions.ts
    // ... (existing client actions)

    export async function getClientDetails(clientId: string) {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("User not authenticated.");

      try {
        const client = await prisma.client.findFirst({
          where: {
            id: clientId,
            trainerId: authUser.id, // Authorization check
          },
          include: {
            measurements: { orderBy: { measurementDate: 'desc' } },
            progressPhotos: { orderBy: { photoDate: 'desc' } },
            sessionLogs: { orderBy: { sessionDate: 'desc' } },
          },
        });
        return client;
      } catch (error) {
        console.error("Failed to fetch client details:", error);
        return null;
      }
    }
    ```
2.  **Create a dedicated layout for the client detail view at `src/app/clients/[clientId]/layout.tsx`:**
    *   This server component will fetch the client's name to display in the sub-header. This prevents re-fetching the name on every sub-module navigation.
    *   It will render inside the main `ClientsSectionLayout`.
    ```tsx
    // src/app/clients/[clientId]/layout.tsx
    import { getClientById } from '../actions';
    import { notFound } from 'next/navigation';
    import Link from 'next/link';

    export default async function ClientDetailLayout({
      children,
      params,
    }: {
      children: React.ReactNode;
      params: { clientId: string };
    }) {
      const client = await getClientById(params.clientId);
      if (!client) {
        notFound();
      }

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <Link href="/clients" className="text-sm text-indigo-600 hover:underline mb-2 block">&larr; Back to Client List</Link>
              <h1 className="text-2xl font-bold text-gray-800">Client Details: {client.name}</h1>
            </div>
            <Link href={`/clients/${client.id}/edit`} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50">
                Edit Client Info
            </Link>
          </div>
          {children}
        </div>
      );
    }
    ```
3.  **Create the client detail view container at `src/components/clients/ClientDetailView.tsx`:**
    *   This will be a client component that manages the active tab state (`useState`).
    *   It will render the tab navigation and conditionally display the management components for Measurements, Photos, etc.
    *   It will receive all client details (including relations) as a prop.
    ```tsx
    // src/components/clients/ClientDetailView.tsx
    "use client";

    import { useState, Suspense } from 'react';
    import type { Client, ClientMeasurement, ClientProgressPhoto, ClientSessionLog } from '@prisma/client';

    // Prop type including relations
    type ClientWithDetails = Client & {
      measurements: ClientMeasurement[];
      progressPhotos: ClientProgressPhoto[];
      sessionLogs: ClientSessionLog[];
    };
    
    interface ClientDetailViewProps {
      client: ClientWithDetails;
    }

    // Placeholders for now - will be built in next TODOs
    const ManageClientMeasurements = ({ client }: { client: ClientWithDetails }) => <div className="bg-white p-6 rounded-lg shadow-sm">Measurements for {client.name} coming soon.</div>;
    const ManageClientProgressPhotos = ({ client }: { client: ClientWithDetails }) => <div className="bg-white p-6 rounded-lg shadow-sm">Progress Photos for {client.name} coming soon.</div>;
    const ManageClientSessionLogs = ({ client }: { client: ClientWithDetails }) => <div className="bg-white p-6 rounded-lg shadow-sm">Session Logs for {client.name} coming soon.</div>;
    const ClientStatistics = ({ client }: { client: ClientWithDetails }) => <div className="bg-white p-6 rounded-lg shadow-sm">Statistics for {client.name} coming soon.</div>;

    const tabs = [
      { name: 'Statistics', id: 'stats' },
      { name: 'Measurements', id: 'measurements' },
      { name: 'Progress Photos', id: 'photos' },
      { name: 'Session Logs', id: 'logs' },
    ];

    export default function ClientDetailView({ client }: ClientDetailViewProps) {
      const [activeTab, setActiveTab] = useState('stats');

      const renderContent = () => {
        switch (activeTab) {
          case 'measurements':
            return <ManageClientMeasurements client={client} />;
          case 'photos':
            return <ManageClientProgressPhotos client={client} />;
          case 'logs':
            return <ManageClientSessionLogs client={client} />;
          case 'stats':
          default:
            return <ClientStatistics client={client} />;
        }
      };

      return (
        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    tab.id === activeTab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-6">
            <Suspense fallback={<div>Loading...</div>}>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      );
    }
    ```
4.  **Create the main page at `src/app/clients/[clientId]/page.tsx`:**
    *   This Server Component fetches all the detailed client data and passes it to the `ClientDetailView`.
    ```tsx
    // src/app/clients/[clientId]/page.tsx
    import { getClientDetails } from '../actions';
    import { notFound } from 'next/navigation';
    import ClientDetailView from '@/components/clients/ClientDetailView';

    export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
      const client = await getClientDetails(params.clientId);

      if (!client) {
        notFound();
      }

      return <ClientDetailView client={client} />;
    }
    ```
Expected Outcome: A navigable client detail page exists at `/clients/[clientId]`. It has a consistent sub-header and tab navigation for different management modules. For now, the content of these tabs will be placeholder text.

**TODO #52: Implement Measurements Module**
Objective: Build the full CRUD component for managing a client's measurements.
File(s) To Create/Modify:
*   `src/components/clients/modules/ManageClientMeasurements.tsx` (new)
*   `src/app/clients/actions.ts` (add `addMeasurement`, `updateMeasurement`, `deleteMeasurement` actions)
*   Modify `src/components/clients/ClientDetailView.tsx` to use the new component.
Specific Instructions:
1.  **Add server actions to `src/app/clients/actions.ts`:**
    *   `addMeasurement(prevState, formData)`: Takes `clientId`, `measurementDate`, `weightKg`, `bodyFatPercentage`, `notes`, `customMetrics`. Creates a new `ClientMeasurement`.
    *   `updateMeasurement(prevState, formData)`: Takes `measurementId` and all other fields to update an existing record.
    *   `deleteMeasurement(measurementId)`: Deletes a specific measurement record.
    *   All actions must authorize that the client belongs to the authenticated user.
2.  **Create `src/components/clients/modules/ManageClientMeasurements.tsx`:**
    *   This client component will manage its own state for the list of measurements, the "add" form, and the "edit" form state.
    *   It will receive `initialMeasurements` and `clientId` as props.
    *   Implement a form for adding a new measurement, including dynamic fields for `custom_metrics` (an array of key-value pairs).
    *   List existing measurements in a table.
    *   Each measurement in the list should have "Edit" and "Delete" buttons. Clicking "Edit" should populate the form for updating.
    *   Use the server actions created in step 1. `revalidatePath` should trigger the parent page to re-fetch and pass new `initialMeasurements` down.

**TODO #53: Implement Progress Photos Module**
Objective: Build the full CRUD component for managing a client's progress photos, including file uploads.
File(s) To Create/Modify:
*   `src/components/clients/modules/ManageClientProgressPhotos.tsx` (new)
*   `src/app/clients/actions.ts` (add `addProgressPhoto`, `deleteProgressPhoto` actions)
*   Modify `src/components/clients/ClientDetailView.tsx` to use the new component.
Specific Instructions:
1.  **Add server actions to `src/app/clients/actions.ts`:**
    *   `addProgressPhoto(prevState, formData)`: Handles file upload to Supabase Storage (e.g., in a `client_progress_photos/{trainer_id}/{client_id}/` path), validates `photoDate`, `caption`, and the file itself. Creates a new `ClientProgressPhoto` record.
    *   `deleteProgressPhoto(photoId)`: Deletes the file from storage and the record from Prisma. Authorize ownership.
2.  **Create `src/components/clients/modules/ManageClientProgressPhotos.tsx`:**
    *   Receives `initialProgressPhotos` and `clientId` as props.
    *   Form for uploading a new photo with a date and caption.
    *   Display existing photos in a gallery view.
    *   Each photo should have a delete button.
    *   Use the server actions created in step 1.

**TODO #54: Implement Session Logs Module**
Objective: Build the full CRUD component for managing a client's session logs.
File(s) To Create/Modify:
*   `src/components/clients/modules/ManageClientSessionLogs.tsx` (new)
*   `src/app/clients/actions.ts` (add `addSessionLog`, `updateSessionLog`, `deleteSessionLog` actions)
*   Modify `src/components/clients/ClientDetailView.tsx` to use the new component.
Specific Instructions:
1.  **Add server actions to `src/app/clients/actions.ts`:**
    *   Create `addSessionLog`, `updateSessionLog`, and `deleteSessionLog` actions, following the established pattern for CRUD operations.
    *   Validate all fields (`sessionDate`, `durationMinutes`, `activitySummary`, etc.).
    *   Authorize all operations.
2.  **Create `src/components/clients/modules/ManageClientSessionLogs.tsx`:**
    *   Receives `initialSessionLogs` and `clientId` as props.
    *   Implement full CRUD functionality similar to the `ServicesEditor` component, with a form for add/edit and a list displaying existing logs with their respective controls.

**TODO #55: Implement Client Statistics Module (Placeholder)**
Objective: Create the placeholder component for client statistics.
File(s) To Create/Modify:
*   `src/components/clients/modules/ClientStatistics.tsx` (new)
*   `src/components/clients/ClientDetailView.tsx` (modify to use the new component).
Specific Instructions:
1.  **Create `src/components/clients/modules/ClientStatistics.tsx`:**
    *   This client component will receive the client's data, including measurements, as a prop.
    *   For now, simply display a message indicating "Charts and statistics will be displayed here."
    *   (Optional, if time permits) Add a library like `chart.js` and render a basic line chart of `weightKg` over `measurementDate`.

---

This completes the entire feature set of the application. Please have @roo begin with **TODO #51 (Revised)**. I'm providing the full set of remaining tasks so you can proceed through them efficiently. Let me know when this final phase is complete.