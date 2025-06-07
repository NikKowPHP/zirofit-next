"use server";

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const coreInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and hyphens."),
  certifications: z.string().max(255, "Certifications too long").optional().nullable(),
  location: z.string().max(255, "Location too long").optional().nullable(),
  phone: z.string().max(50, "Phone number too long").optional().nullable(),
});

interface CoreInfoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[]; // To hold Zod validation errors
  success?: boolean;
  updatedFields?: Partial<z.infer<typeof coreInfoSchema>>; // To send back updated fields
}

export async function updateCoreInfo(prevState: CoreInfoFormState | undefined, formData: FormData): Promise<CoreInfoFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "User not authenticated.", success: false };
  }

  const validatedFields = coreInfoSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    certifications: formData.get('certifications'),
    location: formData.get('location'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues,
      error: "Validation failed. Please check your input.",
      success: false,
    };
  }

  const { name, username, certifications, location, phone } = validatedFields.data;

  try {
    // Check if username is changing and if it's unique (excluding current user)
    const currentUser = await prisma.user.findUnique({
        where: { supabaseAuthUserId: authUser.id },
        select: { id: true, username: true }
    });

    if (!currentUser) {
        return { error: "User profile not found in database.", success: false };
    }

    if (username !== currentUser.username) {
        const existingUserWithUsername = await prisma.user.findUnique({
            where: { username: username },
        });
        if (existingUserWithUsername && existingUserWithUsername.id !== currentUser.id) {
            return { 
                errors: [{ code: 'custom', path: ['username'], message: 'Username is already taken.' }],
                error: "Validation failed.",
                success: false 
            };
        }
    }

    // Update Prisma User (name, username) and Profile (other fields)
    const updatedUser = await prisma.user.update({
      where: { supabaseAuthUserId: authUser.id },
      data: {
        name,
        username,
        profile: {
          upsert: { // Create profile if it doesn't exist, update if it does
            create: {
              certifications,
              location,
              phone,
            },
            update: {
              certifications,
              location,
              phone,
            },
          },
        },
      },
      select: { // Select fields to return for immediate UI update
        name: true,
        username: true,
        profile: {
            select: {
                certifications: true,
                location: true,
                phone: true
            }
        }
      }
    });
    
    revalidatePath('/profile/edit'); // Revalidate the edit page
    revalidatePath(`/trainer/${updatedUser.username}`); // Revalidate public profile
    return {
      success: true,
      message: "Core information updated successfully!",
      updatedFields: {
        name: updatedUser.name,
        username: updatedUser.username,
        certifications: updatedUser.profile?.certifications,
        location: updatedUser.profile?.location,
        phone: updatedUser.profile?.phone,
      }
    };

  } catch (e: any) {
    console.error("Error updating core info:", e);
    if (e.code === 'P2002' && e.meta?.target?.includes('username')) {
         return {
            errors: [{ code: 'custom', path: ['username'], message: 'Username is already taken.' }],
            error: "Validation failed.",
            success: false
        };
    }
    return { error: "Failed to update profile. " + (e.message || ""), success: false };
  }
}

const textContentSchema = z.string().max(65535, "Content is too long.").nullable().optional();

interface TextContentFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
  updatedContent?: string | null;
}

async function updateProfileTextField(
    fieldName: 'aboutMe' | 'philosophy' | 'methodology',
    content: string | null,
    successMessage: string
): Promise<TextContentFormState> {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        return { error: "User not authenticated.", success: false };
    }

    const validatedContent = textContentSchema.safeParse(content);
    if (!validatedContent.success) {
        return { error: validatedContent.error.issues.map(i => i.message).join(', '), success: false };
    }

    try {
        const updatedProfile = await prisma.profile.update({
            where: { userId: authUser.id }, // Assuming profile exists, or handle upsert
            data: {
                [fieldName]: validatedContent.data,
            },
            select: { [fieldName]: true }
        });

        revalidatePath('/profile/edit');
        // Also revalidate public profile if these fields are shown there
        // const dbUser = await prisma.user.findUnique({ where: { supabaseAuthUserId: authUser.id }, select: { username: true } });
        // if (dbUser?.username) revalidatePath(`/trainer/${dbUser.username}`);
        
        return { success: true, message: successMessage, updatedContent: updatedProfile[fieldName] as string | null };
    } catch (e: any) {
        console.error(`Error updating ${fieldName}:`, e);
        return { error: `Failed to update ${fieldName}. ` + (e.message || ""), success: false };
    }
}

export async function updateAboutMe(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
    return updateProfileTextField('aboutMe', formData.get('aboutMeContent') as string | null, 'About Me section updated successfully!');
}

export async function updatePhilosophy(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
    return updateProfileTextField('philosophy', formData.get('philosophyContent') as string | null, 'Philosophy section updated successfully!');
}

export async function updateMethodology(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
    return updateProfileTextField('methodology', formData.get('methodologyContent') as string | null, 'Methodology section updated successfully!');
}

export async function getCurrentUserProfileData() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    // This should ideally not be reached if middleware protects the route
    return null;
  }

  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { supabaseAuthUserId: authUser.id },
      select: {
        name: true,
        username: true,
        email: true, // For display, not editing here
        profile: {
          select: {
            id: true,
            certifications: true,
            location: true,
            phone: true,
            aboutMe: true,
            philosophy: true,
            methodology: true,
            bannerImagePath: true,
            profilePhotoPath: true,
            services: { // Add this
              orderBy: { createdAt: 'asc' }
            },
          },
        },
      },
    });

    if (!userWithProfile) {
      return null; // Or throw an error / return specific state
    }
    
    // Ensure profile is at least an empty object if it doesn't exist,
    // or handle its creation if User exists but Profile doesn't.
    // The upsert logic in updateCoreInfo handles profile creation.

    return {
      name: userWithProfile.name,
      username: userWithProfile.username,
      email: userWithProfile.email,
      profile: userWithProfile.profile ? {
          ...userWithProfile.profile,
          services: userWithProfile.profile.services || [], // Ensure services is an array
      } : { // Provide default structure if profile is null
          id: '', // This might need a proper default or handling if profile is truly null
          certifications: null,
          location: null,
          phone: null,
          aboutMe: null,
          philosophy: null,
          methodology: null,
          bannerImagePath: null,
          profilePhotoPath: null,
          services: [], // Ensure services is an array in default structure
      },
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null; // Or return an error state
  }
}

const serviceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(255),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: { id: string; title: string; description: string; createdAt: Date };
}

export async function addService(prevState: ServiceFormState | undefined, formData: FormData): Promise<ServiceFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "User not authenticated.", success: false };
  }

  const validatedFields = serviceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }

  const { title, description } = validatedFields.data;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: authUser.id },
      select: { id: true }
    });

    if (!profile) {
      return { error: "Profile not found. Please complete core info first.", success: false };
    }

    const newService = await prisma.service.create({
      data: {
        profileId: profile.id,
        title,
        description,
      },
    });
    
    revalidatePath('/profile/edit'); // Revalidate to show the new service
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`); // Revalidate public profile

    return { success: true, message: "Service added successfully!", newService };

  } catch (e: any) {
    console.error("Error adding service:", e);
    return { error: "Failed to add service. " + (e.message || ""), success: false };
  }
}

interface DeleteFormState {
    message?: string | null;
    error?: string | null;
    success?: boolean;
    deletedId?: string;
}

export async function deleteService(serviceId: string): Promise<DeleteFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "User not authenticated.", success: false };
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { profile: { select: { userId: true } } }
    });

    if (!service || service.profile?.userId !== authUser.id) {
      return { error: "Service not found or you are not authorized to delete it.", success: false };
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });
    
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

    return { success: true, message: "Service deleted successfully!", deletedId: serviceId };
  } catch (e: any) {
    console.error("Error deleting service:", e);
    return { error: "Failed to delete service. " + (e.message || ""), success: false };
  }
}

interface UpdateServiceFormState extends ServiceFormState { // Can reuse or extend ServiceFormState
    updatedService?: { id: string; title: string; description: string; createdAt: Date };
}

export async function updateService(prevState: UpdateServiceFormState | undefined, formData: FormData): Promise<UpdateServiceFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "User not authenticated.", success: false };
  }
  
  const serviceId = formData.get('serviceId') as string; // Get serviceId from a hidden input
  if (!serviceId) {
    return { error: "Service ID is missing.", success: false };
  }

  const validatedFields = serviceSchema.safeParse({ // Reuse serviceSchema
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }

  const { title, description } = validatedFields.data;

  try {
    const serviceToUpdate = await prisma.service.findFirst({
      where: {
        id: serviceId,
        profile: { userId: authUser.id } // Authorization check
      },
    });

    if (!serviceToUpdate) {
      return { error: "Service not found or you are not authorized to update it.", success: false };
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { title, description },
    });
    
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

    return { success: true, message: "Service updated successfully!", updatedService };

  } catch (e: any) {
    console.error("Error updating service:", e);
    return { error: "Failed to update service. " + (e.message || ""), success: false };
  }
}