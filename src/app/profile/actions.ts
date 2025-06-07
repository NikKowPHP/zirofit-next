"use server";

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

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

const textContentSchema = z.string().max(65535, "Content is too long.").nullable().optional();

interface TextContentFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
  updatedContent?: string | null;
}

interface DeleteFormState {
    message?: string | null;
    error?: string | null;
    success?: boolean;
    deletedId?: string;
}

interface TestimonialFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newTestimonial?: { id: string; clientName: string; testimonialText: string; createdAt: Date };
}

interface UpdateTestimonialFormState extends TestimonialFormState {
    updatedTestimonial?: { id: string; clientName: string; testimonialText: string; createdAt: Date };
}

interface ExternalLinkFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: { id: string; label: string; linkUrl: string; createdAt: Date };
  updatedLink?: { id: string; label: string; linkUrl: string; createdAt: Date }; // For update
}

interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: { id: string; title: string; description: string; createdAt: Date };
}

interface UpdateServiceFormState extends ServiceFormState { // Can reuse or extend ServiceFormState
    updatedService?: { id: string; title: string; description: string; createdAt: Date };
}

interface TransformationPhotoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newPhoto?: { id: string; imagePath: string; publicUrl: string; caption: string | null; createdAt: Date };
}

interface TransformationPhoto {
  id: string;
  imagePath: string; // This is the path within the bucket
  publicUrl: string; // This will be the full public URL from Supabase Storage
  caption: string | null;
  createdAt: Date;
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
            testimonials: { // Add this
              orderBy: { createdAt: 'desc' }
            },
            externalLinks: { // Add this
              orderBy: { createdAt: 'asc' }
            },
            transformationPhotos: { // Add this
              orderBy: { createdAt: 'desc' }
            },
          },
        },
      },
    });

    if (!userWithProfile) {
      return null; // Or return specific state
    }
    
    // Ensure profile is at least an empty object if it doesn't exist,
    // or handle its creation if User exists but Profile doesn't.
    // The upsert logic in updateCoreInfo handles profile creation.

    const transformationPhotosWithUrls = await Promise.all(
      (userWithProfile.profile?.transformationPhotos || []).map(async (photo: { id: string; imagePath: string; caption: string | null; createdAt: Date }): Promise<TransformationPhoto> => {
        const { data: publicUrlData } = await supabase.storage
          .from('profile-assets')
          .getPublicUrl(photo.imagePath);
        return {
          ...photo,
          publicUrl: publicUrlData.publicUrl,
        } as TransformationPhoto;
      })
    );

    return {
      name: userWithProfile.name,
      username: userWithProfile.username,
      email: userWithProfile.email,
      profile: userWithProfile.profile
        ? {
            ...userWithProfile.profile,
            services: userWithProfile.profile.services || [], // Ensure services is an array
            transformationPhotos: transformationPhotosWithUrls,
          }
        : {
            // Provide default structure if profile is null
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
            testimonials: [], // Ensure testimonials is an array in default structure
            transformationPhotos: [],
          },
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null; // Or return an error state
  }
}

const testimonialSchema = z.object({
  clientName: z.string().min(2, "Client name is required.").max(255),
  testimonialText: z.string().min(10, "Testimonial text must be at least 10 characters."),
});

export async function addTestimonial(prevState: TestimonialFormState | undefined, formData: FormData): Promise<TestimonialFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "User not authenticated.", success: false };
  }

  const validatedFields = testimonialSchema.safeParse({
    clientName: formData.get('clientName'),
    testimonialText: formData.get('testimonialText'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }

  const { clientName, testimonialText } = validatedFields.data;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: authUser.id },
      select: { id: true }
    });

    if (!profile) {
      return { error: "Profile not found. Please complete core info first.", success: false };
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        profileId: profile.id,
        clientName,
        testimonialText,
      },
    });
    
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

    return { success: true, message: "Testimonial added successfully!", newTestimonial };

  } catch (e: any) {
    console.error("Error adding testimonial:", e);
    return { error: "Failed to add testimonial. " + (e.message || ""), success: false };
  }
}

export async function updateTestimonial(prevState: UpdateTestimonialFormState | undefined, formData: FormData): Promise<UpdateTestimonialFormState> {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { error: "User not authenticated.", success: false };

    const testimonialId = formData.get('testimonialId') as string;
    if (!testimonialId) return { error: "Testimonial ID missing.", success: false };

    const validatedFields = testimonialSchema.safeParse({
        clientName: formData.get('clientName'),
        testimonialText: formData.get('testimonialText'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
    }
    const { clientName, testimonialText } = validatedFields.data;

    try {
        const testimonialToUpdate = await prisma.testimonial.findFirst({
            where: { id: testimonialId, profile: { userId: authUser.id } },
        });
        if (!testimonialToUpdate) return { error: "Testimonial not found or not authorized.", success: false };

        const updatedTestimonial = await prisma.testimonial.update({
            where: { id: testimonialId },
            data: { clientName, testimonialText },
        });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "Testimonial updated.", updatedTestimonial };
    } catch (e: any) {
        return { error: "Failed to update testimonial. " + e.message, success: false };
    }
}

export async function deleteTestimonial(testimonialId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    const testimonial = await prisma.testimonial.findFirst({
      where: { id: testimonialId, profile: { userId: authUser.id } },
    });
    if (!testimonial) return { error: "Testimonial not found or not authorized.", success: false };

    await prisma.testimonial.delete({ where: { id: testimonialId } });
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Testimonial deleted.", deletedId: testimonialId };
  } catch (e: any) {
    return { error: "Failed to delete testimonial. " + e.message, success: false };
  }
}

const externalLinkSchema = z.object({
  label: z.string().min(1, "Label is required.").max(255),
  linkUrl: z.string().url({ message: "Please enter a valid URL." }).max(2048),
});

export async function addExternalLink(prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = externalLinkSchema.safeParse({
    label: formData.get('label'),
    linkUrl: formData.get('linkUrl'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }
  const { label, linkUrl } = validatedFields.data;

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: authUser.id }, select: { id: true } });
    if (!profile) return { error: "Profile not found.", success: false };

    const newLink = await prisma.externalLink.create({
      data: { profileId: profile.id, label, linkUrl },
    });
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "External link added successfully!", newLink };
  } catch (e: any) {
    return { error: "Failed to add external link. " + e.message, success: false };
  }
}

// Update External Link
export async function updateExternalLink(prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const linkId = formData.get('linkId') as string;
  if (!linkId) return { error: "Link ID missing.", success: false };

  const validatedFields = externalLinkSchema.safeParse({
    label: formData.get('label'),
    linkUrl: formData.get('linkUrl'),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }
  const { label, linkUrl } = validatedFields.data;

  try {
    const linkToUpdate = await prisma.externalLink.findFirst({
        where: { id: linkId, profile: { userId: authUser.id } },
    });
    if (!linkToUpdate) return { error: "Link not found or not authorized.", success: false };

    const updatedLink = await prisma.externalLink.update({
        where: { id: linkId },
        data: { label, linkUrl },
    });
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "External link updated.", updatedLink };
  } catch (e: any) {
    return { error: "Failed to update external link. " + e.message, success: false };
  }
}

// Delete External Link
export async function deleteExternalLink(linkId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    const linkToDelete = await prisma.externalLink.findFirst({
        where: { id: linkId, profile: { userId: authUser.id } },
    });
    if (!linkToDelete) return { error: "Link not found or not authorized.", success: false };

    await prisma.externalLink.delete({ where: { id: linkId } });
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "External link deleted.", deletedId: linkId };
  } catch (e: any) {
    return { error: "Failed to delete external link. " + e.message, success: false };
  }
}

const transformationPhotoSchema = z.object({
  caption: z.string().max(1000).optional().nullable(),
  photoFile: z
    .instanceof(File, { message: "A photo file is required." })
    .refine(file => file.size > 0, "Photo file cannot be empty.")
    .refine(file => file.size <= 2 * 1024 * 1024, `Photo must be less than 2MB.`) // Max 2MB
    .refine(file => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Invalid file type. Only JPG, PNG, WEBP, GIF allowed."
    ),
});

export async function addTransformationPhoto(prevState: TransformationPhotoFormState | undefined, formData: FormData): Promise<TransformationPhotoFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = transformationPhotoSchema.safeParse({
    caption: formData.get('caption'),
    photoFile: formData.get('photoFile'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
  }
  const { caption, photoFile } = validatedFields.data;

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: authUser.id }, select: { id: true } });
    if (!profile) return { error: "Profile not found.", success: false };

    const fileExtension = photoFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `transformation_photos/${authUser.id}/${fileName}`; // Supabase User ID as part of path

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-assets') // Your bucket name
      .upload(filePath, photoFile, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Do not overwrite if file exists (uuid should prevent this)
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return { error: "Failed to upload photo to storage: " + uploadError.message, success: false };
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    const newPhotoRecord = await prisma.transformationPhoto.create({
      data: {
        profileId: profile.id,
        imagePath: filePath, // Store the path within the bucket
        caption,
      },
    });
    
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

    return {
      success: true,
      message: "Photo uploaded successfully!",
      newPhoto: { ...newPhotoRecord, publicUrl: publicUrlData.publicUrl }
    };

  } catch (e: any) {
    console.error("Error adding transformation photo:", e);
    return { error: "Failed to add photo. " + e.message, success: false };
  }
}

export async function deleteTransformationPhoto(photoId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  try {
    const photo = await prisma.transformationPhoto.findFirst({
      where: { id: photoId, profile: { userId: authUser.id } },
      select: { id: true, imagePath: true }
    });
    if (!photo) return { error: "Photo not found or not authorized.", success: false };

    // Delete from Supabase Storage
    if (photo.imagePath) {
      const { error: storageError } = await supabase.storage
        .from('profile-assets')
        .remove([photo.imagePath]);
      if (storageError) {
        console.error("Supabase Storage Delete Error:", storageError);
        // Decide if this is a hard failure or if DB record should still be deleted
        // For now, let's treat it as a failure.
        return { error: "Failed to delete photo from storage: " + storageError.message, success: false };
      }
    }

    await prisma.transformationPhoto.delete({ where: { id: photoId } });
    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Photo deleted successfully.", deletedId: photoId };
  } catch (e: any) {
    console.error("Error deleting transformation photo:", e);
    return { error: "Failed to delete photo. " + e.message, success: false };
  }
}
