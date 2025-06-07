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
    console.log(validatedFields.error.flatten().fieldErrors);
    return { error: validatedFields.error.flatten().fieldErrors.firstName?.toString() || validatedFields.error.flatten().fieldErrors.lastName?.toString() || validatedFields.error.flatten().fieldErrors.title?.toString() || validatedFields.error.flatten().fieldErrors.location?.toString(), success: false };
  }

  try {
    await prisma.profile.update({
      where: { userId: authUser.id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        title: validatedFields.data.title,
        location: validatedFields.data.location,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Core info updated successfully!" };

  } catch (e: any) {
    return { error: "Failed to update core info: " + e.message, success: false };
  }
}

interface RichTextFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

export async function updateRichTextSection(prevState: RichTextFormState | undefined, formData: FormData, section: 'aboutMe' | 'methodology' | 'philosophy'): Promise<RichTextFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const content = formData.get('content') as string;

  try {
    await prisma.profile.update({
      where: { userId: authUser.id },
      data: {
        [section]: content,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!` };

  } catch (e: any) {
    return { error: "Failed to update " + section + ": " + e.message, success: false };
  }
}

interface ExternalLinkFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

const linkSchema = z.object({
  label: z.string().min(2, { message: "Label must be at least 2 characters." }).max(50),
  url: z.string().url({ message: "Invalid URL" }),
});

export async function addExternalLink(prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = linkSchema.safeParse({
    label: formData.get('label'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
  }

  try {
    await prisma.externalLink.create({
      data: {
        profileId: (await prisma.profile.findUnique({ where: { userId: authUser.id } }))?.id as string,
        label: validatedFields.data.label,
        url: validatedFields.data.url,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "External link added successfully!" };

  } catch (e: any) {
    return { error: "Failed to add external link: " + e.message, success: false };
  }
}

export async function updateExternalLink(id: string, prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = linkSchema.safeParse({
    label: formData.get('label'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
  }

  try {
    await prisma.externalLink.update({
      where: { id: id },
      data: {
        label: validatedFields.data.label,
        url: validatedFields.data.url,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "External link updated successfully!" };

  } catch (e: any) {
    return { error: "Failed to update external link: " + e.message, success: false };
  }
}

export async function deleteExternalLink(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    await prisma.externalLink.delete({
      where: { id: id },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

  } catch (e: any) {
    throw new Error("Failed to delete external link: " + e.message);
  }
}

interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

const serviceSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(50),
  description: z.string().min(2, { message: "Description must be at least 2 characters." }).max(200),
});

const brandingImageSchema = z.object({
  bannerImage: z.instanceof(File).optional()
    .refine(file => !file || file.size <= 2 * 1024 * 1024, `Banner image must be less than 2MB.`)
    .refine(file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Invalid banner image type."),
  profilePhoto: z.instanceof(File).optional()
    .refine(file => !file || file.size <= 1 * 1024 * 1024, `Profile photo must be less than 1MB.`)
    .refine(file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Invalid profile photo type."),
});

interface BrandingFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

export async function updateBrandingImages(prevState: BrandingFormState | undefined, formData: FormData): Promise<BrandingFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const bannerFile = formData.get('bannerImage') as File | null;
  const profilePhotoFile = formData.get('profilePhoto') as File | null;
  
  const validatedFields = brandingImageSchema.safeParse({
    bannerImage: bannerFile?.size ? bannerFile : undefined,
    profilePhoto: profilePhotoFile?.size ? profilePhotoFile : undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: authUser.id } });
    if (!profile) return { error: "Profile not found.", success: false };
    
    let bannerImagePath = profile.bannerImagePath;
    let profilePhotoPath = profile.profilePhotoPath;

    // Handle Banner Image Upload
    if (bannerFile?.size) {
      if (profile.bannerImagePath) await supabase.storage.from('profile-assets').remove([profile.bannerImagePath]);
      const newPath = `profile_banners/${authUser.id}/${uuidv4()}.${bannerFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('profile-assets').upload(newPath, bannerFile);
      if (error) throw new Error(`Banner upload failed: ${error.message}`);
      bannerImagePath = newPath;
    }

    // Handle Profile Photo Upload
    if (profilePhotoFile?.size) {
      if (profile.profilePhotoPath) await supabase.storage.from('profile-assets').remove([profile.profilePhotoPath]);
      const newPath = `profile_photos/${authUser.id}/${uuidv4()}.${profilePhotoFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('profile-assets').upload(newPath, profilePhotoFile);
      if (error) throw new Error(`Profile photo upload failed: ${error.message}`);
      profilePhotoPath = newPath;
    }

    // Update Prisma
    await prisma.profile.update({
      where: { userId: authUser.id },
      data: { bannerImagePath, profilePhotoPath },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Branding updated successfully!" };

  } catch (e: any) {
    return { error: "Failed to update branding: " + e.message, success: false };
  }
}

export async function getCurrentUserProfileData(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      include: {
        externalLinks: true,
        services: true,
        testimonials: true,
        transformationPhotos: true,
        benefits: { orderBy: { orderColumn: 'asc' } },
      },
    });

    return profile;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}

interface BenefitFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

const benefitSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(50),
  description: z.string().min(2, { message: "Description must be at least 2 characters." }).max(200),
  iconName: z.string().min(2, { message: "Icon name must be at least 2 characters." }).max(50),
  iconStyle: z.string().min(2, { message: "Icon style must be at least 2 characters." }).max(50),
});

export async function addBenefit(prevState: BenefitFormState | undefined, formData: FormData): Promise<BenefitFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = benefitSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    iconName: formData.get('iconName'),
    iconStyle: formData.get('iconStyle'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: authUser.id } });
    if (!profile) return { error: "Profile not found.", success: false };

    const lastBenefit = await prisma.benefit.findFirst({
      where: { profileId: profile.id },
      orderBy: { orderColumn: 'desc' },
    });

    const orderColumn = lastBenefit ? lastBenefit.orderColumn + 1 : 1;

    await prisma.benefit.create({
      data: {
        profileId: profile.id,
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        iconName: validatedFields.data.iconName,
        iconStyle: validatedFields.data.iconStyle,
        orderColumn: orderColumn,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Benefit added successfully!" };

  } catch (e: any) {
    return { error: "Failed to add benefit: " + e.message, success: false };
  }
}

export async function updateBenefit(id: string, prevState: BenefitFormState | undefined, formData: FormData): Promise<BenefitFormState> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: "User not authenticated.", success: false };

  const validatedFields = benefitSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    iconName: formData.get('iconName'),
    iconStyle: formData.get('iconStyle'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
  }

  try {
    await prisma.benefit.update({
      where: { id: id },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        iconName: validatedFields.data.iconName,
        iconStyle: validatedFields.data.iconStyle,
      },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
    return { success: true, message: "Benefit updated successfully!" };

  } catch (e: any) {
    return { error: "Failed to update benefit: " + e.message, success: false };
  }
}

export async function deleteBenefit(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    await prisma.benefit.delete({
      where: { id: id },
    });

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

  } catch (e: any) {
    throw new Error("Failed to delete benefit: " + e.message);
  }
}

export async function updateBenefitOrder(benefitIds: string[]): Promise<void> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("User not authenticated.");

  try {
    await Promise.all(
      benefitIds.map(async (id, index) => {
        await prisma.benefit.update({
          where: { id: id },
          data: { orderColumn: index + 1 },
        });
      })
    );

    revalidatePath('/profile/edit');
    revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

  } catch (e: any) {
    throw new Error("Failed to update benefit order: " + e.message);
  }
}
