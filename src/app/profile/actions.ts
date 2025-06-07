// src/app/profile/actions.ts
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

interface CoreInfoFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

export async function updateCoreInfo(prevState: CoreInfoFormState | undefined, formData: FormData): Promise<CoreInfoFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = z.object({
    firstName: z.string().min(2, { message: "First Name must be at least 2 characters." }).max(50),
    lastName: z.string().min(2, { message: "Last Name must be at least 2 characters." }).max(50),
    title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(50),
    location: z.string().min(2, { message: "Location must be at least 2 characters." }).max(50),
  }).safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    title: formData.get('title'),
    location: formData.get('location'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.toString(),
      success: false
    };
  }

  try {
    await prisma.profile.update({
      where: { userId: authUser.id },
      data: validatedFields.data
    });

    revalidatePath('/profile/edit');
    return { success: true, message: "Core info updated successfully!" };
  } catch (e: any) {
    return { error: "Failed to update core info: " + e.message, success: false };
  }
}

interface TestimonialFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
  newTestimonial?: {
    id: string;
    clientName: string;
    testimonialText: string;
    createdAt: Date;
  };
  updatedTestimonial?: {
    id: string;
    clientName: string;
    testimonialText: string;
    createdAt: Date;
  };
  deletedId?: string;
}

export async function addTestimonial(prevState: TestimonialFormState | undefined, formData: FormData): Promise<TestimonialFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const schema = z.object({
    clientName: z.string().min(2, { message: "Client Name must be at least 2 characters." }),
    testimonialText: z.string().min(2, { message: "Testimonial must be at least 2 characters." })
  });

  const validatedFields = schema.safeParse({
    clientName: formData.get('clientName'),
    testimonialText: formData.get('testimonialText')
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.toString(),
      success: false
    };
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: authUser.id } });
    if (!profile) return { error: "Profile not found.", success: false };

    const newTestimonial = await prisma.testimonial.create({
      data: {
        profileId: profile.id,
        clientName: validatedFields.data.clientName,
        testimonialText: validatedFields.data.testimonialText
      }
    });

    revalidatePath('/profile/edit');
    return {
      success: true,
      message: "Testimonial added successfully!",
      newTestimonial
    };
  } catch (e: any) {
    return { error: "Failed to add testimonial: " + e.message, success: false };
  }
}

export async function updateTestimonial(id: string, prevState: TestimonialFormState | undefined, formData: FormData): Promise<TestimonialFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const schema = z.object({
    clientName: z.string().min(2, { message: "Client Name must be at least 2 characters." }),
    testimonialText: z.string().min(2, { message: "Testimonial must be at least 2 characters." })
  });

  const validatedFields = schema.safeParse({
    clientName: formData.get('clientName'),
    testimonialText: formData.get('testimonialText')
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.toString(),
      success: false
    };
  }

  try {
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: validatedFields.data.clientName,
        testimonialText: validatedFields.data.testimonialText
      }
    });

    revalidatePath('/profile/edit');
    return {
      success: true,
      message: "Testimonial updated successfully!",
      updatedTestimonial
    };
  } catch (e: any) {
    return { error: "Failed to update testimonial: " + e.message, success: false };
  }
}

export async function deleteTestimonial(id: string, prevState: TestimonialFormState | undefined): Promise<TestimonialFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    await prisma.testimonial.delete({ where: { id } });

    revalidatePath('/profile/edit');
    return {
      success: true,
      message: "Testimonial deleted successfully!",
      deletedId: id
    };
  } catch (e: any) {
    return { error: "Failed to delete testimonial: " + e.message, success: false };
  }
}
