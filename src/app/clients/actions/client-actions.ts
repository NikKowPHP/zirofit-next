"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

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
