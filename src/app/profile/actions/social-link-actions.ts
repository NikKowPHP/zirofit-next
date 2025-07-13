"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { SocialLink } from "./_utils";

const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required."),
  username: z.string().min(1, "Username is required."),
  profileUrl: z.string().url("Must be a valid URL."),
});

export interface SocialLinkFormState {
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
  const validated = SocialLinkSchema.safeParse({
    platform: formData.get("platform"),
    username: formData.get("username"),
    profileUrl: formData.get("profileUrl"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const newLink = await profileService.createSocialLink({
      ...validated.data,
      profileId: profile.id,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Social link added.", newLink };
  } catch (e: unknown) {
    return { error: "Failed to add social link." };
  }
}

export async function updateSocialLink(
  prevState: SocialLinkFormState | undefined,
  formData: FormData,
): Promise<SocialLinkFormState> {
  const { profile } = await getUserAndProfile();
  const linkId = formData.get("linkId") as string;
  const validated = SocialLinkSchema.safeParse({
    platform: formData.get("platform"),
    username: formData.get("username"),
    profileUrl: formData.get("profileUrl"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedLink = await profileService.updateSocialLink(
      linkId,
      profile.id,
      validated.data,
    );
    revalidatePath("/profile/edit");
    return { success: true, message: "Social link updated.", updatedLink };
  } catch (e: unknown) {
    return { error: "Failed to update social link." };
  }
}

export async function deleteSocialLink(
  linkId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.deleteSocialLink(linkId, profile.id);
    revalidatePath("/profile/edit");
    return { success: true, deletedId: linkId };
  } catch (e: unknown) {
    return { success: false, error: "Failed to delete social link." };
  }
}