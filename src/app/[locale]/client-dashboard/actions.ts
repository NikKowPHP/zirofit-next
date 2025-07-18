
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

export async function getClientDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const client = await prisma.client.findUnique({
        where: { userId: user.id },
        include: {
            trainer: { 
                select: { name: true, username: true, email: true }
            },
            exerciseLogs: {
                include: { exercise: true },
                orderBy: { logDate: "desc" }
            },
            measurements: {
                orderBy: { measurementDate: "desc" }
            }
        }
    });

    return client;
}

export async function shareDataWithTrainer(trainerUsername: string) {
    const supabase = await createClient();
    const { data: { user: clientUser } } = await supabase.auth.getUser();

    if (!clientUser || clientUser.email === null) {
        return { success: false, error: "Authentication error." };
    }

    const trainer = await prisma.user.findUnique({ where: { username: trainerUsername } });
    if (!trainer) {
        return { success: false, error: "Trainer not found." };
    }

    const selfManagedClient = await getSelfManagedClient(clientUser.id);
    if (!selfManagedClient) {
        return { success: false, error: "Could not find your client profile." };
    }
    
    try {
        await prisma.$transaction(async (tx) => {
            const trainerCreatedClientRecord = await tx.client.findFirst({
                where: { trainerId: trainer.id, email: clientUser.email! }
            });
            
            if (trainerCreatedClientRecord) { // Merge logic
                await tx.clientExerciseLog.updateMany({ where: { clientId: selfManagedClient.id }, data: { clientId: trainerCreatedClientRecord.id } });
                await tx.clientMeasurement.updateMany({ where: { clientId: selfManagedClient.id }, data: { clientId: trainerCreatedClientRecord.id } });
                await tx.clientProgressPhoto.updateMany({ where: { clientId: selfManagedClient.id }, data: { clientId: trainerCreatedClientRecord.id } });
                await tx.clientSessionLog.updateMany({ where: { clientId: selfManagedClient.id }, data: { clientId: trainerCreatedClientRecord.id } });

                await tx.client.update({ where: { id: trainerCreatedClientRecord.id }, data: { userId: clientUser.id } });
                await tx.client.delete({ where: { id: selfManagedClient.id } });
            } else { // Fresh link logic
                await tx.client.update({ where: { id: selfManagedClient.id }, data: { trainerId: trainer.id } });
            }

            await tx.notification.create({
                data: {
                    userId: trainer.id,
                    message: `${clientUser.user_metadata.full_name || clientUser.email} has linked their account with you.`,
                    type: "client_link"
                }
            });
        });

        revalidatePath("/client-dashboard");
        revalidatePath(`/trainer/${trainerUsername}`);
        return { success: true, message: "Successfully linked with trainer." };

    } catch (error) {
        console.error("Failed to share data with trainer:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function unlinkFromTrainer() {
    const supabase = await createClient();
    const { data: { user: clientUser } } = await supabase.auth.getUser();

    if (!clientUser) {
        return { success: false, error: "Authentication error." };
    }

    try {
        const clientRecord = await prisma.client.findUnique({
            where: { userId: clientUser.id }
        });

        if (!clientRecord || !clientRecord.trainerId) {
            return { success: false, error: "You are not currently linked to a trainer." };
        }

        const trainerId = clientRecord.trainerId;

        await prisma.client.update({
            where: { id: clientRecord.id },
            data: { trainerId: null }
        });

        await prisma.notification.create({
            data: {
                userId: trainerId,
                message: `${clientUser.user_metadata.full_name || clientUser.email} has unlinked their account.`,
                type: "client_unlink"
            }
        });
        
        revalidatePath("/client-dashboard");
        return { success: true, message: "Successfully unlinked from trainer." };

    } catch (error) {
        console.error("Failed to unlink from trainer:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}