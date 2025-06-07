"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '../../lib/supabase/server';
import { prisma } from '../../lib/prisma';

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