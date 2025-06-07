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
  const supabase = createClient();
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
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };
  
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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