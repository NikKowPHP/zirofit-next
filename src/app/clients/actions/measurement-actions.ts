"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from "@prisma/client";

import { authorizeClientAccess } from './_utils';

// Define the ClientMeasurement type using Prisma's utility type. This is more robust
// for server-side modules where direct type imports can sometimes fail.
type ClientMeasurement = Awaited<ReturnType<typeof prisma.clientMeasurement.create>>;


const measurementSchema = z.object({
  clientId: z.string(),
  measurementDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
  weightKg: z.string().optional().nullable(),
  bodyFatPercentage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  customMetrics: z.string().optional().nullable(),
});

const updateMeasurementSchema = measurementSchema.extend({
  measurementId: z.string(),
});

export interface MeasurementFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  measurement?: ClientMeasurement;
}

export async function addMeasurement(prevState: MeasurementFormState | undefined, formData: FormData): Promise<MeasurementFormState> {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { error: "User not authenticated.", success: false };

    const validatedFields = measurementSchema.safeParse(Object.fromEntries(formData.entries()));
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

    const validatedFields = updateMeasurementSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
    }

    const { measurementId, clientId, ...dataToUpdate } = validatedFields.data;
    if (!(await authorizeClientAccess(clientId, authUser.id))) {
        return { error: "Unauthorized access to client.", success: false };
    }

    try {
        const measurement = await prisma.clientMeasurement.update({
            where: { id: measurementId },
            data: {
                measurementDate: new Date(dataToUpdate.measurementDate),
                weightKg: dataToUpdate.weightKg ? parseFloat(dataToUpdate.weightKg) : null,
                bodyFatPercentage: dataToUpdate.bodyFatPercentage ? parseFloat(dataToUpdate.bodyFatPercentage) : null,
                notes: dataToUpdate.notes,
                customMetrics: dataToUpdate.customMetrics ? JSON.parse(dataToUpdate.customMetrics) : undefined,
            },
        });
        revalidatePath(`/clients/${clientId}`);
        return { success: true, message: "Measurement updated.", measurement };
    } catch (e: any) {
        return { error: "Failed to update measurement: " + e.message, success: false };
    }
}

export async function deleteMeasurement(prevState: any, measurementId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    const measurement = await prisma.clientMeasurement.findUnique({ where: { id: measurementId }, select: { clientId: true } });
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
