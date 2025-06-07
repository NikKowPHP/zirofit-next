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

const MeasurementSchema = z.object({
  clientId: z.string(),
  measurementDate: z.string(),
  weightKg: z.string().optional(),
  bodyFatPercentage: z.string().optional(),
  notes: z.string().optional(),
  customMetrics: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
});

export async function addMeasurement(prevState: any, formData: FormData) {
  const validatedFields = MeasurementSchema.safeParse({
    clientId: formData.get('clientId'),
    measurementDate: formData.get('measurementDate'),
    weightKg: formData.get('weightKg'),
    bodyFatPercentage: formData.get('bodyFatPercentage'),
    notes: formData.get('notes'),
    customMetrics: JSON.parse(formData.get('customMetrics') as string || '[]'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create measurement.',
    };
  }

  const { clientId, measurementDate, weightKg, bodyFatPercentage, notes, customMetrics } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        trainerId: authUser.id,
      },
    });

    if (!client) {
      return { message: "Client not found or unauthorized." };
    }

    const measurement = await prisma.clientMeasurement.create({
      data: {
        clientId,
        measurementDate: new Date(measurementDate),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
        notes,
        customMetrics: customMetrics ? JSON.stringify(customMetrics) : null,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, measurement };
  } catch (error: any) {
    console.error("Failed to create measurement:", error);
    return { message: "Failed to create measurement." };
  }
}

const UpdateMeasurementSchema = z.object({
  measurementId: z.string(),
  clientId: z.string(),
  measurementDate: z.string(),
  weightKg: z.string().optional(),
  bodyFatPercentage: z.string().optional(),
  notes: z.string().optional(),
  customMetrics: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
});

export async function updateMeasurement(prevState: any, formData: FormData) {
  const validatedFields = UpdateMeasurementSchema.safeParse({
    measurementId: formData.get('measurementId'),
    clientId: formData.get('clientId'),
    measurementDate: formData.get('measurementDate'),
    weightKg: formData.get('weightKg'),
    bodyFatPercentage: formData.get('bodyFatPercentage'),
    notes: formData.get('notes'),
    customMetrics: JSON.parse(formData.get('customMetrics') as string || '[]'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update measurement.',
    };
  }

  const { measurementId, clientId, measurementDate, weightKg, bodyFatPercentage, notes, customMetrics } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        trainerId: authUser.id,
      },
    });

    if (!client) {
      return { message: "Client not found or unauthorized." };
    }

    const measurement = await prisma.clientMeasurement.update({
      where: {
        id: measurementId,
      },
      data: {
        measurementDate: new Date(measurementDate),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
        notes,
        customMetrics: customMetrics ? JSON.stringify(customMetrics) : null,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, measurement };
  } catch (error: any) {
    console.error("Failed to update measurement:", error);
    return { message: "Failed to update measurement." };
  }
}

export async function deleteMeasurement(prevState: any, measurementId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const measurement = await prisma.clientMeasurement.findUnique({
      where: {
        id: measurementId,
      },
    });

    if (!measurement) {
      return { message: "Measurement not found." };
    }

    const client = await prisma.client.findUnique({
      where: {
        id: measurement.clientId,
        trainerId: authUser.id,
      },
    });

    if (!client) {
      return { message: "Client not found or unauthorized." };
    }

    await prisma.clientMeasurement.delete({
      where: {
        id: measurementId,
      },
    });

    revalidatePath(`/clients/${client.id}`);
    return { success: true, message: "Measurement deleted." };
  } catch (error: any) {
    console.error("Failed to delete measurement:", error);
    return { message: "Failed to delete measurement." };
  }
}

const ProgressPhotoSchema = z.object({
  clientId: z.string(),
  trainerId: z.string(),
  photoDate: z.string(),
  caption: z.string().optional(),
  photo: z.any(), // File type
});

export async function addProgressPhoto(prevState: any, formData: FormData) {
  const validatedFields = ProgressPhotoSchema.safeParse({
    clientId: formData.get('clientId'),
    trainerId: formData.get('trainerId'),
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

  const { clientId, trainerId, photoDate, caption, photo } = validatedFields.data;

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        trainerId: authUser.id,
      },
    });

    if (!client) {
      return { message: "Client not found or unauthorized." };
    }

    const file = photo as File;
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}-${Date.now()}.${fileExt}`;
    const filePath = `client_progress_photos/${trainerId}/${clientId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('zirofit-storage')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { message: "Failed to upload photo." };
    }

    const imageUrl = `https://supabasestorageurl/${filePath}`; // Replace with your Supabase URL

    const progressPhoto = await prisma.clientProgressPhoto.create({
      data: {
        clientId,
        trainerId,
        photoDate: new Date(photoDate),
        caption,
        url: imageUrl,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, progressPhoto };
  } catch (error: any) {
    console.error("Failed to create progress photo:", error);
    return { message: "Failed to create progress photo." };
  }
}

export async function deleteProgressPhoto(photoId: string) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { message: "User not authenticated." };
  }

  try {
    const photo = await prisma.clientProgressPhoto.findUnique({
      where: {
        id: photoId,
      },
    });

    if (!photo) {
      return { message: "Photo not found." };
    }

    const client = await prisma.client.findUnique({
      where: {
        id: photo.clientId,
        trainerId: authUser.id,
      },
    });

    if (!client) {
      return { message: "Client not found or unauthorized." };
    }

    // Extract file path from URL
    const filePath = photo.url.replace('https://supabasestorageurl/', ''); // Replace with your Supabase URL

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('zirofit-storage')
      .remove([filePath]);

    if (storageError) {
      console.error("Supabase storage delete error:", storageError);
      return { message: "Failed to delete photo from storage." };
    }

    // Delete from Prisma
    await prisma.clientProgressPhoto.delete({
      where: {
        id: photoId,
      },
    });

    revalidatePath(`/clients/${client.id}`);
    return { success: true, message: "Progress photo deleted." };
  } catch (error: any) {
    console.error("Failed to delete progress photo:", error);
    return { message: "Failed to delete progress photo." };
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