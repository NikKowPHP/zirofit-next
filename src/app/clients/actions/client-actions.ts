"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone must be at least 1 character." }),
  status: z.enum(["active", "inactive", "pending"]),
});

const UpdateFormSchema = FormSchema.extend({
  id: z.string(),
});

export async function getTrainerClients() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    return await prisma.client.findMany({
      where: { trainerId: authUser.id },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export async function addClient(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  // Ensure the authenticated user exists in the Prisma User table, or create/update it
  let userInDb = await prisma.user.findUnique({ where: { id: authUser.id } });

  if (!userInDb) {
    // If user not found by ID, try finding by email
    userInDb = await prisma.user.findUnique({ where: { email: authUser.email || '' } });

    if (userInDb) {
      // If user found by email but not by ID, update their ID to match Supabase auth ID
      try {
        userInDb = await prisma.user.update({
          where: { id: userInDb.id },
          data: { id: authUser.id },
        });
      } catch (dbError: any) {
        console.error("Failed to update user ID in DB during client creation:", dbError);
        return { message: "Failed to link trainer account. Please contact support." };
      }
    } else {
      // If user doesn't exist in DB by ID or email, create them.
      try {
        const name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'New User';
        const email = authUser.email || '';

        let baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!baseSlug) {
            const emailParts = email.split('@');
            baseSlug = emailParts[0].toLowerCase().replace(/[^a-z0-9-]/g, '') || Math.random().toString(36).substring(2, 10);
        }
        let username = baseSlug;
        let count = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseSlug}-${count}`;
            count++;
        }

        userInDb = await prisma.user.create({
          data: {
            id: authUser.id,
            name: name,
            email: email,
            username: username,
            role: "trainer",
          },
        });
      } catch (dbError: any) {
        console.error("Failed to create user in DB during client creation:", dbError);
        if (dbError.code === 'P2002' && dbError.meta?.target?.includes('email')) {
          return { message: "Your trainer account email already exists in the system. Please use a different email or contact support." };
        }
        return { message: "Failed to ensure trainer account exists in database." };
      }
    }
  }
  
  const validatedFields = FormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create client.' };
  }
  
  const { name, email, phone, status } = validatedFields.data;

  try {
    await prisma.client.create({
      data: { trainerId: authUser.id, name, email, phone, status },
    });
  } catch (e: any) {
    return { message: e.code === 'P2002' ? "Client with this email already exists." : 'Failed to create client.' };
  }
  
  revalidatePath('/clients');
  redirect('/clients');
}

export async function getClientById(clientId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    return await prisma.client.findFirst({
      where: { id: clientId, trainerId: authUser.id },
    });
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return null;
  }
}

export async function updateClient(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };
  
  const validatedFields = UpdateFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update client.' };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  const client = await getClientById(id);
  if (!client || client.trainerId !== authUser.id) {
    return { message: "Unauthorized." };
  }

  try {
    await prisma.client.update({ where: { id }, data: dataToUpdate });
  } catch (e: any) {
    return { message: e.code === 'P2002' ? "Client with this email already exists." : 'Failed to update client.' };
  }
  
  revalidatePath('/clients');
  redirect('/clients');
}

export async function deleteClient(clientId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  const client = await getClientById(clientId);
  if (!client || client.trainerId !== authUser.id) {
    return { message: "Unauthorized." };
  }

  try {
    await prisma.client.delete({ where: { id: clientId } });
    revalidatePath('/clients');
    return { message: "Client deleted." };
  } catch (error: any) {
    return { message: "Failed to delete client." };
  }
}

export async function bulkDeleteClients(clientIds: string[]) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  try {
    const { count } = await prisma.client.deleteMany({
      where: {
        id: { in: clientIds },
        trainerId: authUser.id
      },
    });

    revalidatePath('/clients');
    return {
      message: count === clientIds.length
        ? "All selected clients deleted successfully."
        : `Only ${count} of ${clientIds.length} clients were deleted.`
    };
  } catch (error: any) {
    console.error("Bulk delete failed:", error);
    return { message: "Failed to delete clients." };
  }
}


export async function bulkExportClients(clientIds: string[]) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated." };

  try {
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        trainerId: authUser.id
      },
      include: {
        measurements: { orderBy: { measurementDate: 'desc' } },
        progressPhotos: { orderBy: { photoDate: 'desc' } },
        sessionLogs: { orderBy: { sessionDate: 'desc' } },
      },
    });

    if (clients.length === 0) {
      return { error: "No clients found for export." };
    }

    // Convert to CSV format
    const csvHeader = [
      'Name', 'Email', 'Phone', 'Status',
      'Last Measurement Date', 'Last Measurement Weight', 'Last Measurement Body Fat',
      'Last Progress Photo Date', 'Last Progress Photo URL',
      'Last Session Date', 'Last Session Notes'
    ].join(',');

    const csvRows = clients.map((client: {
      name: string;
      email: string | null;
      phone: string | null;
      status: string;
      measurements: Array<{ measurementDate: Date; weightKg: number | null; bodyFatPercentage: number | null; }>;
      progressPhotos: Array<{ photoDate: Date; imagePath: string }>;
      sessionLogs: Array<{ sessionDate: Date; sessionNotes: string | null }>;
    }) => {
      const lastMeasurement = client.measurements[0] || {};
      const lastPhoto = client.progressPhotos[0] || {};
      const lastSession = client.sessionLogs[0] || {};

      return [
        `"${client.name}"`,
        `"${client.email}"`,
        `"${client.phone}"`,
        `"${client.status}"`,
        lastMeasurement.measurementDate || '',
        lastMeasurement.weightKg || '',
        lastMeasurement.bodyFatPercentage || '',
        lastPhoto.photoDate || '',
        lastPhoto.imagePath || '',
        lastSession.sessionDate || '',
        `"${lastSession.sessionNotes?.replace(/"/g, '""') || ''}"`
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    return { data: csvContent };

  } catch (error: any) {
    console.error("Bulk export failed:", error);
    return { error: "Failed to export clients." };
  }
}

export async function getClientDetails(clientId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    return await prisma.client.findFirst({
      where: { id: clientId, trainerId: authUser.id },
      include: {
        measurements: { orderBy: { measurementDate: 'desc' } },
        progressPhotos: { orderBy: { photoDate: 'desc' } },
        sessionLogs: { orderBy: { sessionDate: 'desc' } },
      },
    });
  } catch (error) {
    console.error("Failed to fetch client details:", error);
    return null;
  }
}

// Exporting types for client components to consume, avoiding direct imports that can fail in some build contexts.
export type Client = Prisma.ClientGetPayload<{}>;
export type ClientSessionLog = Prisma.ClientSessionLogGetPayload<{}>;
export type ClientProgressPhoto = Prisma.ClientProgressPhotoGetPayload<{}>;
