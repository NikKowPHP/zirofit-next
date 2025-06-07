Phase 7: Client Management - Detail View & Sub-Modules (Final Implementation)
TODO #51 (Revised and Finalized): Implement the Client Measurements Module
Objective: Build the full CRUD component for managing a client's measurements.
File(s) To Create/Modify:
src/components/clients/modules/ManageClientMeasurements.tsx (new)
src/app/clients/actions.ts (add addMeasurement, updateMeasurement, deleteMeasurement actions)
Modify src/components/clients/ClientDetailView.tsx to use the new component.
Specific Instructions:
Add Server Actions to src/app/clients/actions.ts for Measurements:
addMeasurement(prevState, formData): Takes clientId, measurementDate, weightKg, bodyFatPercentage, notes, customMetrics. Creates a new ClientMeasurement.
updateMeasurement(prevState, formData): Takes measurementId and all other fields to update an existing record.
deleteMeasurement(measurementId): Deletes a specific measurement record.
All actions must authorize that the client belongs to the authenticated user.
Create the full implementation of src/components/clients/modules/ManageClientMeasurements.tsx:
This will be a client component managing state for adding, editing, and listing measurements.
It will receive initialMeasurements and clientId as props.
The form should support adding custom metrics dynamically (e.g., an array of {name: string, value: string} objects).
Use the server actions created in step 1 for all CRUD operations. revalidatePath should trigger data updates.
Update src/components/clients/ClientDetailView.tsx:
Replace the placeholder ManageClientMeasurements component with the real one.








TODO #52 (Revised and Finalized): Implement the Client Progress Photos Module
Objective: Build the full CRUD component for managing a client's progress photos, including file uploads.
File(s) To Create/Modify:
src/components/clients/modules/ManageClientProgressPhotos.tsx (new)
src/app/clients/actions.ts (add addProgressPhoto, deleteProgressPhoto actions)
Modify src/components/clients/ClientDetailView.tsx to use the new component.
Specific Instructions:
Add Server Actions to src/app/clients/actions.ts for Progress Photos:
addProgressPhoto(prevState, formData): Handles file upload to Supabase Storage in a path like client_progress_photos/{trainer_id}/{client_id}/{uuid}.jpg. Validates photoDate, caption, and the file. Creates a new ClientProgressPhoto record.
deleteProgressPhoto(photoId): Deletes the file from storage and the record from Prisma. Authorizes ownership.
Create src/components/clients/modules/ManageClientProgressPhotos.tsx:
Receives initialProgressPhotos and clientId as props.
Form for uploading a new photo with a date and caption, including a file preview.
Display existing photos in a gallery view. Each photo should have a delete button.
Use the server actions for adding and deleting.
Update src/components/clients/ClientDetailView.tsx:
Replace the placeholder ManageClientProgressPhotos component with the real one.
TODO #53 (Revised and Finalized): Implement the Client Session Logs Module
Objective: Build the full CRUD component for managing a client's session logs.
File(s) To Create/Modify:
src/components/clients/modules/ManageClientSessionLogs.tsx (new)
src/app/clients/actions.ts (add addSessionLog, updateSessionLog, deleteSessionLog actions)
Modify src/components/clients/ClientDetailView.tsx to use the new component.
Specific Instructions:
Add Server Actions to src/app/clients/actions.ts for Session Logs:
Create addSessionLog, updateSessionLog, and deleteSessionLog actions following the established pattern.
Validate all fields (sessionDate, durationMinutes, activitySummary, etc.).
Authorize all operations.
Create src/components/clients/modules/ManageClientSessionLogs.tsx:
Receives initialSessionLogs and clientId as props.
Implement full CRUD functionality similar to the ServicesEditor component, with a form for add/edit and a list displaying existing logs.
Update src/components/clients/ClientDetailView.tsx:
Replace the placeholder ManageClientSessionLogs component with the real one.
TODO #54 (Revised and Finalized): Implement the Client Statistics Module
Objective: Create the component to display client statistics charts.
File(s) To Create/Modify:
src/components/clients/modules/ClientStatistics.tsx (new)
src/lib/services/ClientStatisticsService.ts (new)
Modify src/components/clients/ClientDetailView.tsx to use the new component.
Specific Instructions:
Install Charting Libraries:
Run npm install chart.js react-chartjs-2 chartjs-adapter-date-fns.
Create src/lib/services/ClientStatisticsService.ts:
This service will contain functions to process measurement data and format it for Chart.js.
Create methods like getWeightProgress(measurements), getBodyFatProgress(measurements), getCustomMetricProgress(measurements, metricName). These functions will not fetch data but will transform the array of measurements passed to them.
Create src/components/clients/modules/ClientStatistics.tsx:
This client component will receive the client's measurements data as a prop.
Use the service functions from the previous step to process the data.
Use react-chartjs-2 to render line charts for weight, body fat, and any available custom metrics.
Update src/components/clients/ClientDetailView.tsx:
Replace the placeholder ClientStatistics component with the real one, passing the necessary props.
TODO #55: Final Review and Cleanup
Objective: Perform a final review of the application, clean up any stray files, and ensure all features are integrated correctly.
File(s) To Create/Modify: Various.
Specific Instructions:
Review the ProfileEditorLayout.tsx and ClientDetailView.tsx: Ensure all placeholder components have been replaced with their final implementations.
Check all navigation links: Verify that links in the TrainerDashboardLayout, public layouts, and within pages (e.g., "Back to list") work as expected.
Delete placeholder files: Remove DeleteClientButton.tsx from the root directory and any other temporary or test files that are no longer needed.
Confirm npm dependencies: Ensure package.json reflects all necessary dependencies (sortablejs, chart.js, etc.) and remove any that are unused.
This is the final push to complete the migration. Once these tasks are done, the application should be fully functional as per the original specification.
Please have @roo start with TODO #51 (Revised and Finalized). Let me know when this final phase is complete.