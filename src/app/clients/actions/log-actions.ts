"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "./_utils";
import type { Prisma } from "@prisma/client";

type ClientSessionLog = Prisma.ClientSessionLogGetPayload<{}>;

export interface LogActionState {
  errors?: {
    sessionDate?: string[];
    durationMinutes?: string[];
    activitySummary?: string[];
    sessionNotes?: string[];
    clientId?: string[];
    sessionLogId?: string[];
  };
  message?: string;
  success: boolean;
  sessionLog?: ClientSessionLog;
}

const SessionLogSchema = z.object({
  clientId: z.string(),
  sessionDate: z.string(),
  durationMinutes: z.string(),
  activitySummary: z.string(),
  sessionNotes: z.string().optional(),
});

const UpdateSessionLogSchema = SessionLogSchema.extend({
  sessionLogId: z.string(),
});

export async function addSessionLog(
  prevState: LogActionState,
  formData: FormData,
): Promise<LogActionState> {
  const validatedFields = SessionLogSchema.safeParse({
    clientId: formData.get("clientId"),
    sessionDate: formData.get("sessionDate"),
    durationMinutes: formData.get("durationMinutes"),
    activitySummary: formData.get("activitySummary"),
    sessionNotes: formData.get("sessionNotes"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to add session log.",
      success: false,
    };
  }

  const { clientId, ...data } = validatedFields.data;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || !(await authorizeClientAccess(clientId, authUser.id))) {
    return { message: "Unauthorized.", success: false };
  }

  try {
    const sessionLog = await prisma.clientSessionLog.create({
      data: {
        clientId,
        sessionDate: new Date(data.sessionDate),
        durationMinutes: parseInt(data.durationMinutes),
        activitySummary: data.activitySummary,
        sessionNotes: data.sessionNotes,
      },
    });

    // Check for milestone
    const sessionCount = await prisma.clientSessionLog.count({
      where: { clientId },
    });

    const milestones = [5, 10, 20, 50, 100];
    if (milestones.includes(sessionCount)) {
      await prisma.notification.create({
        data: {
          userId: authUser.id,
          message: `🎉 Milestone reached! Client has completed ${sessionCount} sessions.`,
          type: "milestone",
        },
      });
    }

    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog, message: "Session log added." };
  } catch (error: any) {
    return { message: "Failed to add session log.", success: false };
  }
}

export async function updateSessionLog(
  prevState: LogActionState,
  formData: FormData,
): Promise<LogActionState> {
  const validatedFields = UpdateSessionLogSchema.safeParse({
    sessionLogId: formData.get("sessionLogId"),
    clientId: formData.get("clientId"),
    sessionDate: formData.get("sessionDate"),
    durationMinutes: formData.get("durationMinutes"),
    activitySummary: formData.get("activitySummary"),
    sessionNotes: formData.get("sessionNotes"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update session log.",
      success: false,
    };
  }

  const { sessionLogId, clientId, ...data } = validatedFields.data;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || !(await authorizeClientAccess(clientId, authUser.id))) {
    return { message: "Unauthorized.", success: false };
  }

  try {
    const sessionLog = await prisma.clientSessionLog.update({
      where: { id: sessionLogId },
      data: {
        sessionDate: new Date(data.sessionDate),
        durationMinutes: parseInt(data.durationMinutes),
        activitySummary: data.activitySummary,
        sessionNotes: data.sessionNotes,
      },
    });
    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog, message: "Session log updated." };
  } catch (error: any) {
    return { message: "Failed to update session log.", success: false };
  }
}

export async function deleteSessionLog(sessionLogId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser)
    return { message: "User not authenticated.", success: false };

  try {
    const log = await prisma.clientSessionLog.findUnique({
      where: { id: sessionLogId },
    });
    if (!log || !(await authorizeClientAccess(log.clientId, authUser.id))) {
      return { message: "Unauthorized.", success: false };
    }

    await prisma.clientSessionLog.delete({ where: { id: sessionLogId } });
    revalidatePath(`/clients/${log.clientId}`);
    return { success: true, message: "Session log deleted." };
  } catch (error: any) {
    return { message: "Failed to delete session log.", success: false };
  }
}