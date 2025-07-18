
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import * as clientService from "@/lib/services/clientService";
import type { Prisma } from "@prisma/client";

export type Exercise = Prisma.ExerciseGetPayload<{}>;
export type ClientExerciseLog = Prisma.ClientExerciseLogGetPayload<{
  include: { exercise: true };
}>;

async function getSelfManagedClient(authUserId: string) {
    return await prisma.client.findUnique({
        where: { userId: authUserId },
        select: { id: true }
    });
}

const setSchema = z.object({
  reps: z.number().min(0),
  weight: z.number().min(0).optional(),
});

const exerciseLogSchema = z.object({
  exerciseId: z.string().min(1, "Please select an exercise."),
  logDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
  sets: z
    .string()
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        const validated = z.array(setSchema).safeParse(parsed);
        if (!validated.success || validated.data.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one valid set is required.",
          });
          return z.NEVER;
        }
        return validated.data;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid sets format.",
        });
        return z.NEVER;
      }
    }),
});

const updateExerciseLogSchema = exerciseLogSchema.extend({
  logId: z.string(),
});

export interface ExerciseLogFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLog?: ClientExerciseLog;
  updatedLog?: ClientExerciseLog;
}

export async function searchExercisesAction(
  query: string,
): Promise<{ exercises: Exercise[] }> {
  if (!query) return { exercises: [] };
  const exercises = await clientService.searchExercises(query);
  return { exercises };
}

export async function addMyExerciseLog(
  prevState: ExerciseLogFormState | undefined,
  formData: FormData,
): Promise<ExerciseLogFormState> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated." };

  const selfManagedClient = await getSelfManagedClient(authUser.id);
  if (!selfManagedClient) {
    return { error: "Client profile not found for this user." };
  }

  const validatedFields = exerciseLogSchema.safeParse({
    exerciseId: formData.get("exerciseId"),
    logDate: formData.get("logDate"),
    sets: formData.get("sets"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues,
      error: "Validation failed.",
      success: false,
    };
  }

  const { exerciseId, logDate, sets } = validatedFields.data;

  try {
    const newLog = await clientService.createExerciseLog({
      clientId: selfManagedClient.id,
      exerciseId,
      logDate: new Date(logDate),
      sets,
    });
    revalidatePath(`/client-dashboard`);
    return { success: true, message: "Exercise log added.", newLog };
  } catch (e: any) {
    return {
      error: "Failed to add exercise log: " + e.message,
      success: false,
    };
  }
}

export async function updateMyExerciseLog(
  prevState: ExerciseLogFormState | undefined,
  formData: FormData,
): Promise<ExerciseLogFormState> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated." };

  const selfManagedClient = await getSelfManagedClient(authUser.id);
  if (!selfManagedClient) {
    return { error: "Client profile not found for this user." };
  }

  const validatedFields = updateExerciseLogSchema.safeParse({
    logId: formData.get("logId"),
    exerciseId: formData.get("exerciseId"),
    logDate: formData.get("logDate"),
    sets: formData.get("sets"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues,
      error: "Validation failed.",
      success: false,
    };
  }

  const { logId, ...dataToUpdate } = validatedFields.data;

  const log = await clientService.findExerciseLogById(logId);
  if (!log || log.clientId !== selfManagedClient.id) {
    return {
      error: "Unauthorized to update this log.",
      success: false,
    };
  }

  try {
    const updatedLog = await clientService.updateExerciseLog(logId, {
      ...dataToUpdate,
      logDate: new Date(dataToUpdate.logDate),
    });
    revalidatePath(`/client-dashboard`);
    return { success: true, message: "Exercise log updated.", updatedLog };
  } catch (e: any) {
    return {
      error: "Failed to update exercise log: " + e.message,
      success: false,
    };
  }
}

export async function deleteMyExerciseLog(
  logId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const selfManagedClient = await getSelfManagedClient(authUser.id);
  if (!selfManagedClient) {
    return { error: "Client profile not found.", success: false };
  }

  try {
    const log = await clientService.findExerciseLogById(logId);
    if (!log || log.clientId !== selfManagedClient.id) {
      return {
        error: "Unauthorized to delete this log.",
        success: false,
      };
    }

    await clientService.deleteExerciseLog(logId);
    revalidatePath(`/client-dashboard`);
    return { success: true, deletedId: logId };
  } catch (e: any) {
    return {
      error: "Failed to delete exercise log: " + e.message,
      success: false,
    };
  }
}