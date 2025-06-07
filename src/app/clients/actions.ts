"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '../../lib/supabase/server';
import { prisma } from '../../lib/prisma';
import type { ClientMeasurement } from '@/generated/prisma';

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone must be at least 1 character." }),
  status: z.enum(["active", "inactive", "pending"]),
});

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

export async function addClient(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create client.',
    };
  }

  const { name, email, phone, status } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.create({
      data: {
        trainerId: authUser.id,
        name,
        email,
        phone,
        status,
      },
    });
    revalidatePath('/clients');
    redirect('/clients');
  } catch (e: any) {
    if (e.code === 'P2002') {
      return {
        message: "Client with this email already exists.",
      };
    }
    return {
      message: 'Failed to create client.',
    };
  }
}

export async function getClientById(clientId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("User not authenticated.");
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        trainerId: authUser.id, // Ensure the client belongs to the logged-in trainer
      },
    });

    if (!client) {
      return null; // Client not found or doesn't belong to the trainer
    }

    return client;
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return null; // Return null on error
  }
}

const UpdateFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone must be at least 1 character." }),
  status: z.enum(["active", "inactive", "pending"]),
});

export async function updateClient(prevState: any, formData: FormData) {
  const validatedFields = UpdateFormSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update client.',
    };
  }

  const { id, name, email, phone, status } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: id,
      },
    });

    if (!client) {
      return { message: "Client not found." };
    }

    if (client.trainerId !== authUser.id) {
      return { message: "Unauthorized." };
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
        phone,
        status,
      },
    });
    revalidatePath('/clients');
    redirect('/clients');
  } catch (e: any) {
    if (e.code === 'P2002') {
      return {
        message: "Client with this email already exists.",
      };
    }
    return {
      message: 'Failed to update client.',
    };
  }
}

export async function deleteClient(clientId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!client) {
      return { message: "Client not found." };
    }

    if (client.trainerId !== authUser.id) {
      return { message: "Unauthorized." };
    }

    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });
    revalidatePath('/clients');
    return { message: "Client deleted." };
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    return { message: "Failed to delete client." };
  }
}

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
  measurement?: ClientMeasurement;
}

// Helper to authorize if client belongs to trainer
async function authorizeClientAccess(clientId: string, authUserId: string): Promise<boolean> {
    const client = await prisma.client.findFirst({
        where: { id: clientId, trainerId: authUserId }
    });
    return !!client;
}

export async function addMeasurement(prevState: MeasurementFormState | undefined, formData: FormData): Promise<MeasurementFormState> {
    const supabase = createClient();
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
    const supabase = createClient();
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

export async function deleteMeasurement(prevState: any, measurementId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = createClient();
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

const ProgressPhotoSchema = z.object({
  clientId: z.string(),
  photoDate: z.string(),
  caption: z.string().optional(),
  photo: z.any(), // File type
});

export async function addProgressPhoto(prevState: any, formData: FormData) {
  const validatedFields = ProgressPhotoSchema.safeParse({
    clientId: formData.get('clientId'),
    photoDate: formData.get('photoDate'),
    caption: formData.get('caption'),
    photo: formData.get('photo'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add progress photo.',
    };
  }

  const { clientId, photoDate, caption, photo } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    if (!(await authorizeClientAccess(clientId, authUser.id))) {
        return { message: "Client not found or unauthorized." };
    }

    const file = photo as File;
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}-${Date.now()}.${fileExt}`;
    const filePath = `client_progress_photos/${authUser.id}/${clientId}/${fileName}`;

    const { error } = await supabase.storage
      .from('zirofit-storage')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { message: "Failed to upload photo." };
    }

    const progressPhoto = await prisma.clientProgressPhoto.create({
      data: {
        clientId,
        photoDate: new Date(photoDate),
        caption,
        imagePath: filePath, // Store the path, not the full URL
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, progressPhoto };
  } catch (error: any) {
    console.error("Failed to create progress photo:", error);
    return { message: "Failed to create progress photo." };
  }
}

export async function deleteProgressPhoto(prevState: any, photoId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const photo = await prisma.clientProgressPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return { message: "Photo not found." };
    }

    if (!(await authorizeClientAccess(photo.clientId, authUser.id))) {
      return { message: "Client not found or unauthorized." };
    }

    const filePath = photo.imagePath;

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('zirofit-storage')
      .remove([filePath]);

    if (storageError) {
      console.error("Supabase storage delete error:", storageError);
      // Don't block DB deletion if storage fails, but log it.
    }

    // Delete from Prisma
    await prisma.clientProgressPhoto.delete({
      where: {
        id: photoId,
      },
    });

    revalidatePath(`/clients/${photo.clientId}`);
    return { success: true, message: "Progress photo deleted." };
  } catch (error: any) {
    console.error("Failed to delete progress photo:", error);
    return { message: "Failed to delete progress photo." };
  }
}

const SessionLogSchema = z.object({
  clientId: z.string(),
  sessionDate: z.string(),
  durationMinutes: z.string(),
  activitySummary: z.string(),
  notes: z.string().optional(),
});

export async function addSessionLog(prevState: any, formData: FormData) {
  const validatedFields = SessionLogSchema.safeParse({
    clientId: formData.get('clientId'),
    sessionDate: formData.get('sessionDate'),
    durationMinutes: formData.get('durationMinutes'),
    activitySummary: formData.get('activitySummary'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add session log.',
    };
  }

  const { clientId, sessionDate, durationMinutes, activitySummary, notes } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
     if (!(await authorizeClientAccess(clientId, authUser.id))) {
      return { message: "Client not found or unauthorized." };
    }

    const sessionLog = await prisma.clientSessionLog.create({
      data: {
        clientId,
        sessionDate: new Date(sessionDate),
        durationMinutes: parseInt(durationMinutes),
        activitySummary,
        notes,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog };
  } catch (error: any) {
    console.error("Failed to add session log:", error);
    return { message: "Failed to add session log." };
  }
}

const UpdateSessionLogSchema = z.object({
  sessionLogId: z.string(),
  clientId: z.string(),
  sessionDate: z.string(),
  durationMinutes: z.string(),
  activitySummary: z.string(),
  notes: z.string().optional(),
});

export async function updateSessionLog(prevState: any, formData: FormData) {
  const validatedFields = UpdateSessionLogSchema.safeParse({
    sessionLogId: formData.get('sessionLogId'),
    clientId: formData.get('clientId'),
    sessionDate: formData.get('sessionDate'),
    durationMinutes: formData.get('durationMinutes'),
    activitySummary: formData.get('activitySummary'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update session log.',
    };
  }

  const { sessionLogId, clientId, sessionDate, durationMinutes, activitySummary, notes } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    if (!(await authorizeClientAccess(clientId, authUser.id))) {
      return { message: "Client not found or unauthorized." };
    }

    const sessionLog = await prisma.clientSessionLog.update({
      where: {
        id: sessionLogId,
      },
      data: {
        sessionDate: new Date(sessionDate),
        durationMinutes: parseInt(durationMinutes),
        activitySummary,
        notes,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, sessionLog };
  } catch (error: any) {
    console.error("Failed to update session log:", error);
    return { message: "Failed to update session log." };
  }
}

export async function deleteSessionLog(sessionLogId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const sessionLog = await prisma.clientSessionLog.findUnique({
      where: {
        id: sessionLogId,
      },
    });

    if (!sessionLog) {
      return { message: "Session log not found." };
    }

    if (!(await authorizeClientAccess(sessionLog.clientId, authUser.id))) {
      return { message: "Client not found or unauthorized." };
    }

    await prisma.clientSessionLog.delete({
      where: {
        id: sessionLogId,
      },
    });

    revalidatePath(`/clients/${sessionLog.clientId}`);
    return { success: true, message: "Session log deleted." };
  } catch (error: any) {
    console.error("Failed to delete session log:", error);
    return { message: "Failed to delete session log." };
  }
}

export async function getClientDetails(clientId: string) {
  const supabase = createClient();
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