"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { transformImagePath } from "@/lib/utils";
import type { AuthUser } from "@supabase/supabase-js";

// Export types for client components to consume, avoiding direct imports that can fail in some build contexts.
export type User = Prisma.UserGetPayload<{}>;
export type Profile = Prisma.ProfileGetPayload<{}>;
export type Service = Prisma.ServiceGetPayload<{}>;
export type Testimonial = Prisma.TestimonialGetPayload<{}>;
export type TransformationPhoto = Prisma.TransformationPhotoGetPayload<{}>;
export type ExternalLink = Prisma.ExternalLinkGetPayload<{}>;
export type Benefit = Prisma.BenefitGetPayload<{}>;
export type SocialLink = Prisma.SocialLinkGetPayload<{}>;

export type TransformationPhotoWithPublicUrl = TransformationPhoto & {
  publicUrl: string;
};

// Helper function to get user and profile, creating profile if it doesn't exist.
async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("User not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw new Error("User not found in database.");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: user.id },
    });
  }

  return { user, profile, authUser }; // Return authUser as well
}

// 1. Get current user profile data
export async function getCurrentUserProfileData() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    let userWithProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: "asc" } },
            testimonials: { orderBy: { createdAt: "desc" } },
            transformationPhotos: { orderBy: { createdAt: "desc" } },
            externalLinks: { orderBy: { createdAt: "asc" } },
            benefits: { orderBy: { orderColumn: "asc" } },
            socialLinks: { orderBy: { createdAt: "asc" } }, // Added socialLinks
          },
        },
      },
    });

    if (userWithProfile && !userWithProfile.profile) {
      await prisma.profile.create({ data: { userId: userWithProfile.id } });
      // Re-fetch to get the new profile and its relations (which will be empty)
      userWithProfile = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: {
          profile: {
            include: {
              services: { orderBy: { createdAt: "asc" } },
              testimonials: { orderBy: { createdAt: "desc" } },
              transformationPhotos: { orderBy: { createdAt: "desc" } },
              externalLinks: { orderBy: { createdAt: "asc" } },
              benefits: { orderBy: { orderColumn: "asc" } },
              socialLinks: { orderBy: { createdAt: "asc" } }, // Added socialLinks
            },
          },
        },
      });
    }

    if (!userWithProfile) return null;

    if (userWithProfile.profile) {
      userWithProfile.profile.bannerImagePath = transformImagePath(
        userWithProfile.profile.bannerImagePath,
      );
      userWithProfile.profile.profilePhotoPath = transformImagePath(
        userWithProfile.profile.profilePhotoPath,
      );
      userWithProfile.profile.transformationPhotos.forEach((photo) => {
        (photo as any).imagePath = transformImagePath(photo.imagePath);
      });
    }

    return userWithProfile;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
}

// 2. Core Info Actions
const CoreInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Username can only contain lowercase letters, numbers, and hyphens.",
    ),
  certifications: z.string().max(255).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});

interface CoreInfoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  updatedFields?: Partial<User & Profile>;
}

export async function updateCoreInfo(
  prevState: CoreInfoFormState | undefined,
  formData: FormData,
): Promise<CoreInfoFormState> {
  const { user } = await getUserAndProfile();

  const validatedFields = CoreInfoSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues,
      error: "Validation failed.",
    };
  }

  const { name, username, ...profileData } = validatedFields.data;

  try {
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return {
          error: "Username is already taken.",
          errors: [
            {
              code: "custom",
              path: ["username"],
              message: "Username is already taken.",
            },
          ],
        };
      }
    }

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, username } }),
      prisma.profile.update({ where: { userId: user.id }, data: profileData }),
    ]);

    revalidatePath("/profile/edit");
    return {
      success: true,
      message: "Core info updated successfully!",
      updatedFields: {
        name: updatedUser.name,
        username: updatedUser.username,
        ...updatedProfile,
      },
    };
  } catch (e: any) {
    if (e.code === "P2002" && e.meta?.target.includes("username")) {
      return {
        error: "Username is already taken.",
        errors: [
          {
            code: "custom",
            path: ["username"],
            message: "Username is already taken.",
          },
        ],
      };
    }
    return { error: "Failed to update core info: " + e.message };
  }
}

// 3. Text Content Actions (About, Philosophy, Methodology)
interface TextContentFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
  updatedContent?: string | null;
}

async function updateProfileTextField(
  fieldName: "aboutMe" | "philosophy" | "methodology",
  prevState: TextContentFormState | undefined,
  formData: FormData,
): Promise<TextContentFormState> {
  const { profile } = await getUserAndProfile();
  const content = formData.get(`${fieldName}Content`) as string;

  try {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { [fieldName]: content },
    });
    revalidatePath("/profile/edit");
    return {
      success: true,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`,
      updatedContent: content,
    };
  } catch (e: any) {
    return { error: `Failed to update ${fieldName}: ` + e.message };
  }
}
export async function updateAboutMe(
  prevState: TextContentFormState | undefined,
  formData: FormData,
) {
  return updateProfileTextField("aboutMe", prevState, formData);
}
export async function updatePhilosophy(
  prevState: TextContentFormState | undefined,
  formData: FormData,
) {
  return updateProfileTextField("philosophy", prevState, formData);
}
export async function updateMethodology(
  prevState: TextContentFormState | undefined,
  formData: FormData,
) {
  return updateProfileTextField("methodology", prevState, formData);
}

// 4. Branding Actions
interface BrandingFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}
export async function updateBrandingImages(
  prevState: BrandingFormState | undefined,
  formData: FormData,
): Promise<BrandingFormState> {
  const { user, profile, authUser } = await getUserAndProfile(); // authUser is the Supabase authenticated user
  const bannerImage = formData.get("bannerImage") as File;
  const profilePhoto = formData.get("profilePhoto") as File;

  const updates: { bannerImagePath?: string; profilePhotoPath?: string } = {};
  const supabaseStorage = await createClient();

  try {
    if (bannerImage?.size > 0) {
      // Use authUser.id (Supabase Auth UUID) for the path
      const path = `profile-assets/${authUser.id}/banner-${uuidv4()}`;

      console.log(`[AUTHN DEBUG] Uploading to path: ${path}`);
      console.log(`[AUTHN DEBUG] authUser.id for path: ${authUser.id}`);

      const { error } = await supabaseStorage.storage
        .from("zirofit")
        .upload(path, bannerImage, { upsert: true });
      if (error) throw new Error(`Banner upload failed: ${error.message}`);
      updates.bannerImagePath = path;
    }

    if (profilePhoto?.size > 0) {
      // Use authUser.id (Supabase Auth UUID) for the path
      const path = `profile-assets/${authUser.id}/profile-photo-${uuidv4()}`;
      const { error } = await supabaseStorage.storage
        .from("zirofit")
        .upload(path, profilePhoto, { upsert: true });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      updates.profilePhotoPath = path;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.profile.update({ where: { id: profile.id }, data: updates });
    }

    revalidatePath("/profile/edit");
    return { success: true, message: "Branding updated successfully!" };
  } catch (e: any) {
    return { error: "Failed to update branding: " + e.message };
  }
}

// 5. Benefit Actions
interface BenefitFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}
const BenefitSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  iconName: z.string().optional(),
  iconStyle: z.string().optional(),
});
export async function addBenefit(
  prevState: BenefitFormState | undefined,
  formData: FormData,
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  const validated = BenefitSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success) return { error: "Validation failed." };
  try {
    const maxOrder = await prisma.benefit.aggregate({
      _max: { orderColumn: true },
      where: { profileId: profile.id },
    });
    await prisma.benefit.create({
      data: {
        ...validated.data,
        profileId: profile.id,
        orderColumn: (maxOrder._max.orderColumn ?? 0) + 1,
      },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Benefit added." };
  } catch (e: any) {
    return { error: "Failed to add benefit." };
  }
}
export async function updateBenefit(
  id: string,
  prevState: BenefitFormState | undefined,
  formData: FormData,
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  const validated = BenefitSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success) return { error: "Validation failed." };
  try {
    await prisma.benefit.update({
      where: { id, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Benefit updated." };
  } catch (e) {
    return { error: "Failed to update benefit." };
  }
}
export async function deleteBenefit(id: string): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.benefit.delete({ where: { id, profileId: profile.id } });
    revalidatePath("/profile/edit");
    return { success: true, message: "Benefit deleted." };
  } catch (e) {
    return { error: "Failed to delete benefit." };
  }
}
export async function updateBenefitOrder(
  ids: string[],
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  try {
    const updates = ids.map((id, index) =>
      prisma.benefit.update({
        where: { id, profileId: profile.id },
        data: { orderColumn: index + 1 },
      }),
    );
    await prisma.$transaction(updates);
    revalidatePath("/profile/edit");
    return { success: true, message: "Order updated." };
  } catch (e) {
    return { error: "Failed to update order." };
  }
}

// 6. Service Actions
const ServiceSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});
interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: Service;
  updatedService?: Service;
  deletedId?: string;
}
export async function addService(
  prevState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const { profile } = await getUserAndProfile();
  const validated = ServiceSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const newService = await prisma.service.create({
      data: { ...validated.data, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Service added.", newService };
  } catch (e) {
    return { error: "Failed to add service." };
  }
}
export async function updateService(
  prevState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const { profile } = await getUserAndProfile();
  const serviceId = formData.get("serviceId") as string;
  const validated = ServiceSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedService = await prisma.service.update({
      where: { id: serviceId, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Service updated.", updatedService };
  } catch (e) {
    return { error: "Failed to update service." };
  }
}
export async function deleteService(
  serviceId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.service.delete({
      where: { id: serviceId, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, deletedId: serviceId };
  } catch (e) {
    return { success: false, error: "Failed to delete service." };
  }
}

// 7. Social Link Actions
const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required."),
  username: z.string().min(1, "Username is required."),
  profileUrl: z.string().url("Must be a valid URL."),
});

interface SocialLinkFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: SocialLink;
  updatedLink?: SocialLink;
  deletedId?: string;
}

export async function addSocialLink(
  prevState: SocialLinkFormState | undefined,
  formData: FormData,
): Promise<SocialLinkFormState> {
  const { profile } = await getUserAndProfile();
  const validated = SocialLinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const newLink = await prisma.socialLink.create({
      data: { ...validated.data, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Social link added.", newLink };
  } catch (e) {
    return { error: "Failed to add social link." };
  }
}

export async function updateSocialLink(
  prevState: SocialLinkFormState | undefined,
  formData: FormData,
): Promise<SocialLinkFormState> {
  const { profile } = await getUserAndProfile();
  const linkId = formData.get("linkId") as string;
  const validated = SocialLinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedLink = await prisma.socialLink.update({
      where: { id: linkId, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Social link updated.", updatedLink };
  } catch (e) {
    return { error: "Failed to update social link." };
  }
}

export async function deleteSocialLink(
  linkId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.socialLink.delete({
      where: { id: linkId, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, deletedId: linkId };
  } catch (e) {
    return { success: false, error: "Failed to delete social link." };
  }
}

// 8. External Link Actions
const ExternalLinkSchema = z.object({
  label: z.string().min(1, "Label is required."),
  linkUrl: z.string().url("Must be a valid URL."),
});
interface ExternalLinkFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: ExternalLink;
  updatedLink?: ExternalLink;
  deletedId?: string;
}
export async function addExternalLink(
  prevState: ExternalLinkFormState | undefined,
  formData: FormData,
): Promise<ExternalLinkFormState> {
  const { profile } = await getUserAndProfile();
  const validated = ExternalLinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const newLink = await prisma.externalLink.create({
      data: { ...validated.data, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Link added.", newLink };
  } catch (e) {
    return { error: "Failed to add link." };
  }
}
export async function updateExternalLink(
  prevState: ExternalLinkFormState | undefined,
  formData: FormData,
): Promise<ExternalLinkFormState> {
  const { profile } = await getUserAndProfile();
  const linkId = formData.get("linkId") as string;
  const validated = ExternalLinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedLink = await prisma.externalLink.update({
      where: { id: linkId, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Link updated.", updatedLink };
  } catch (e) {
    return { error: "Failed to update link." };
  }
}
export async function deleteExternalLink(
  linkId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.externalLink.delete({
      where: { id: linkId, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, deletedId: linkId };
  } catch (e) {
    return { success: false, error: "Failed to delete link." };
  }
}

// 8. Transformation Photo Actions
const TransformationPhotoSchema = z.object({
  caption: z.string().max(255).optional(),
  photoFile: z
    .any()
    .refine((file) => file?.size > 0, "Photo file is required.")
    .refine((file) => file?.size <= 2 * 1024 * 1024, `Max file size is 2MB.`),
});
interface TransformationPhotoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newPhoto?: TransformationPhoto & { publicUrl: string };
  deletedId?: string;
}
export async function addTransformationPhoto(
  prevState: TransformationPhotoFormState | undefined,
  formData: FormData,
): Promise<TransformationPhotoFormState> {
  const { user, profile, authUser } = await getUserAndProfile(); // Use authUser for path consistency if RLS is based on auth.uid()
  const validated = TransformationPhotoSchema.safeParse({
    caption: formData.get("caption"),
    photoFile: formData.get("photoFile"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };

  const { caption, photoFile } = validated.data;
  // Using authUser.id for the path, similar to branding and client progress photos.
  const filePath = `transformation-photos/${authUser.id}/${uuidv4()}`;
  const supabaseStorage = await createClient();
  const { error: uploadError } = await supabaseStorage.storage
    .from("zirofit")
    .upload(filePath, photoFile);
  if (uploadError) return { error: `Storage error: ${uploadError.message}` };

  try {
    const {
      data: { publicUrl },
    } = supabaseStorage.storage.from("zirofit").getPublicUrl(filePath);
    const newPhoto = await prisma.transformationPhoto.create({
      data: { profileId: profile.id, imagePath: filePath, caption },
    });
    revalidatePath("/profile/edit");
    return {
      success: true,
      message: "Photo uploaded.",
      newPhoto: { ...newPhoto, publicUrl },
    };
  } catch (e: any) {
    await supabaseStorage.storage.from("zirofit").remove([filePath]);
    return { error: "Failed to save photo details." };
  }
}
export async function deleteTransformationPhoto(
  photoId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    const photo = await prisma.transformationPhoto.findFirstOrThrow({
      where: { id: photoId, profileId: profile.id },
    });
    const supabase = await createClient();
    await supabase.storage.from("zirofit").remove([photo.imagePath]);
    await prisma.transformationPhoto.delete({ where: { id: photoId } });
    revalidatePath("/profile/edit");
    return { success: true, deletedId: photoId };
  } catch (e: any) {
    return { success: false, error: "Failed to delete photo." };
  }
}

// 9. Testimonial Actions
const TestimonialSchema = z.object({
  clientName: z.string().min(2, "Client Name is required."),
  testimonialText: z.string().min(10, "Testimonial text is required."),
});
interface TestimonialFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newTestimonial?: Testimonial;
  updatedTestimonial?: Testimonial;
  deletedId?: string;
}
export async function addTestimonial(
  prevState: TestimonialFormState | undefined,
  formData: FormData,
): Promise<TestimonialFormState> {
  const { profile } = await getUserAndProfile();
  const validated = TestimonialSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed" };
  try {
    const newTestimonial = await prisma.testimonial.create({
      data: { ...validated.data, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Testimonial added.", newTestimonial };
  } catch (e) {
    return { error: "Failed to add testimonial." };
  }
}
export async function updateTestimonial(
  id: string,
  prevState: TestimonialFormState | undefined,
  formData: FormData,
): Promise<TestimonialFormState> {
  const { profile } = await getUserAndProfile();
  const validated = TestimonialSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed" };
  try {
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return {
      success: true,
      message: "Testimonial updated.",
      updatedTestimonial,
    };
  } catch (e) {
    return { error: "Failed to update testimonial." };
  }
}
export async function deleteTestimonial(
  id: string,
  prevState?: TestimonialFormState | undefined,
): Promise<TestimonialFormState> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.testimonial.delete({ where: { id, profileId: profile.id } });
    revalidatePath("/profile/edit");
    return { success: true, message: "Testimonial deleted.", deletedId: id };
  } catch (e) {
    return { error: "Failed to delete testimonial." };
  }
}
