Phase 7: Client Management - Final Implementation & Cleanup
TODO #56: Implement Server Actions for Client Measurements
Objective: Add the missing CRUD server actions for client measurements to make the ManageClientMeasurements component fully functional.
File(s) To Create/Modify:
src/app/clients/actions.ts (add new actions)
Specific Instructions:
Open src/app/clients/actions.ts.
Add the Zod schema for measurement validation. This should handle standard fields and the dynamic customMetrics array.
Implement addMeasurement: This server action will take form data, validate it, and create a new ClientMeasurement record associated with the correct client, ensuring the client belongs to the authenticated trainer.
Implement updateMeasurement: This action will take a measurementId and form data, validate, authorize, and update the corresponding record.
Implement deleteMeasurement: This action will take a measurementId, authorize, and delete the record.
Ensure all actions use revalidatePath to refresh the client detail page data.
// Add the following content to src/app/clients/actions.ts
// Ensure you keep all existing actions in the file.

const measurementSchema = z.object({
  clientId: z.string(),
  measurementDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
  weightKg: z.string().optional().nullable(),
  bodyFatPercentage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  customMetrics: z.string().optional().nullable(), // Will be a JSON string
});

const updateMeasurementSchema = measurementSchema.extend({
  measurementId: z.string(),
});

interface MeasurementFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  measurement?: import('@prisma/client').ClientMeasurement;
}

// Helper to authorize if client belongs to trainer
async function authorizeClientAccess(clientId: string, authUserId: string): Promise<boolean> {
    const client = await prisma.client.findFirst({
        where: { id: clientId, trainerId: authUser.id }
    });
    return !!client;
}

export async function addMeasurement(prevState: MeasurementFormState | undefined, formData: FormData): Promise<MeasurementFormState> {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { error: "User not authenticated.", success: false };

    const validatedFields = measurementSchema.safeParse({
        clientId: formData.get('clientId'),
        measurementDate: formData.get('measurementDate'),
        weightKg: formData.get('weightKg'),
        bodyFatPercentage: formData.get('bodyFatPercentage'),
        notes: formData.get('notes'),
        customMetrics: formData.get('customMetrics'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
    }
    
    const { clientId, measurementDate, weightKg, bodyFatPercentage, notes, customMetrics: customMetricsJson } = validatedFields.data;

    if (!(await authorizeClientAccess(clientId, authUser.id))) {
        return { error: "Unauthorized access to client.", success: false };
    }

    try {
        const measurement = await prisma.clientMeasurement.create({
            data: {
                clientId,
                measurementDate: new Date(measurementDate),
                weightKg: weightKg ? parseFloat(weightKg) : null,
                bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
                notes,
                customMetrics: customMetricsJson ? JSON.parse(customMetricsJson) : undefined,
            },
        });
        revalidatePath(`/clients/${clientId}`);
        return { success: true, message: "Measurement added.", measurement };
    } catch (e: any) {
        return { error: "Failed to add measurement: " + e.message, success: false };
    }
}

export async function updateMeasurement(prevState: MeasurementFormState | undefined, formData: FormData): Promise<MeasurementFormState> {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { error: "User not authenticated.", success: false };

    const validatedFields = updateMeasurementSchema.safeParse({
        measurementId: formData.get('measurementId'),
        clientId: formData.get('clientId'),
        measurementDate: formData.get('measurementDate'),
        weightKg: formData.get('weightKg'),
        bodyFatPercentage: formData.get('bodyFatPercentage'),
        notes: formData.get('notes'),
        customMetrics: formData.get('customMetrics'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
    }

    const { measurementId, clientId, measurementDate, weightKg, bodyFatPercentage, notes, customMetrics: customMetricsJson } = validatedFields.data;

    if (!(await authorizeClientAccess(clientId, authUser.id))) {
        return { error: "Unauthorized access to client.", success: false };
    }

    try {
        const measurement = await prisma.clientMeasurement.update({
            where: { id: measurementId },
            data: {
                measurementDate: new Date(measurementDate),
                weightKg: weightKg ? parseFloat(weightKg) : null,
                bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
                notes,
                customMetrics: customMetricsJson ? JSON.parse(customMetricsJson) : undefined,
            },
        });
        revalidatePath(`/clients/${clientId}`);
        return { success: true, message: "Measurement updated.", measurement };
    } catch (e: any) {
        return { error: "Failed to update measurement: " + e.message, success: false };
    }
}

export async function deleteMeasurement(measurementId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    const measurement = await prisma.clientMeasurement.findUnique({
      where: { id: measurementId },
      select: { clientId: true }
    });

    if (!measurement || !(await authorizeClientAccess(measurement.clientId, authUser.id))) {
      return { error: "Unauthorized to delete this measurement.", success: false };
    }

    await prisma.clientMeasurement.delete({ where: { id: measurementId } });

    revalidatePath(`/clients/${measurement.clientId}`);
    return { success: true, message: "Measurement deleted." };
  } catch (e: any) {
    return { error: "Failed to delete measurement: " + e.message, success: false };
  }
}
Use code with caution.
TypeScript
Expected Outcome: The ManageClientMeasurements component becomes fully functional, allowing trainers to add, update, and delete client measurement records.
TODO #57: Final Cleanup
Objective: Perform final code cleanup and organization.
File(s) To Create/Modify: DeleteClientButton.tsx (delete), src/components/clients/DeleteClientButton.tsx (verify path), package.json (verify).
Specific Instructions:
Move DeleteClientButton.tsx: The file DeleteClientButton.tsx is currently in the root directory.
Delete the DeleteClientButton.tsx file from the root.
Verify that the component already exists at src/components/clients/DeleteClientButton.tsx. The XML shows it does, which is correct.
Verify the import path in src/app/clients/page.tsx is correct: import DeleteClientButton from '@/components/clients/DeleteClientButton';.
Review package.json:
Open package.json.
Confirm that all necessary dependencies are listed: react-chartjs-2, chart.js, chartjs-adapter-date-fns, sortablejs, @types/sortablejs, uuid, @types/uuid. The XML shows these are correctly installed. No action is needed beyond verification.
Expected Outcome: The project structure is clean, with no misplaced files. All required dependencies for the implemented features are confirmed.
Please have @roo start with TODO #56. Once that is complete, proceed with the final cleanup in TODO #57.
After these tasks are done, the full migration from the Laravel application to the Next.js application will be complete. Congratulations on reaching the final stage