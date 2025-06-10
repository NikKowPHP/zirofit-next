"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { authorizeClientAccess } from './_utils';

const SessionLogSchema = z.object({
  clientId: z.string(),
  sessionDate: z.string(),
  durationMinutes: z.string(),
  activitySummary: z.string(),
  notes: z.string().optional(),
});

const UpdateSessionLogSchema = SessionLogSchema.extend({
  sessionLogId: z.string(),
});

export async function addSessionLog(prevState: any, formData: FormData) {
  const validatedFields = SessionLogSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to add session log.' };
  }

  const { clientId, ...data } = validatedFields.data;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser || !(await authorizeClientAccess(clientId, authUser.id))) {
    return { message: "Unauthorized." };
  }

  try {
    const sessionLog = await prisma.clientSessionLog.create({
      data: {
        clientId,
        sessionDate: new Date(data.sessionDate),
        durationMinutes: parseInt(data.durationMinutes),
        activitySummary: data.activitySummary,
        // notes: data.notes, // Removed temporarily until Prisma schema is updated
      },
    });
    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog };
  } catch (error: any) {
    return { message: "Failed to add session log." };
  }
}

export async function updateSessionLog(prevState: any, formData: FormData) {
  const validatedFields = UpdateSessionLogSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update session log.' };
  }

  const { sessionLogId, clientId, ...data } = validatedFields.data;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser || !(await authorizeClientAccess(clientId, authUser.id))) {
    return { message: "Unauthorized." };
  }

  try {
    const sessionLog = await prisma.clientSessionLog.update({
      where: { id: sessionLogId },
      data: {
        sessionDate: new Date(data.sessionDate),
        durationMinutes: parseInt(data.durationMinutes),
        activitySummary: data.activitySummary,
        // notes: data.notes, // Temporarily removed until Prisma schema is updated
      },
    });
    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog };
  } catch (error: any) {
    return { message: "Failed to update session log." };
  }
}

export async function deleteSessionLog(sessionLogId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  try {
    const log = await prisma.clientSessionLog.findUnique({ where: { id: sessionLogId } });
    if (!log || !(await authorizeClientAccess(log.clientId, authUser.id))) {
      return { message: "Unauthorized." };
    }

    await prisma.clientSessionLog.delete({ where: { id: sessionLogId } });
    revalidatePath(`/clients/${log.clientId}`);
    return { success: true, message: "Session log deleted." };
  } catch (error: any) {
    return { message: "Failed to delete session log." };
  }
}