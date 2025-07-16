
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { ExternalLink } from "./_utils";

const ExternalLinkSchema = z.object({
  label: z.string().min(1, "Label is required."),
  linkUrl: z.string().url("Must be a valid URL."),
});

export interface ExternalLinkFormState {
  messageKey?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: ExternalLink;
  updatedLink?: ExternalLink;
  deletedId?: string;
}

export async function addExternalLink(
  _prevState: ExternalLinkFormState | undefined,
  formData: FormData,
): Promise<ExternalLinkFormState> {
  const { profile } = await getUserAndProfile();
  const validated = ExternalLinkSchema.safeParse({
    label: formData.get("label"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const { label, linkUrl } = validated.data;
    const newLink = await profileService.createExternalLink({
      label,
      linkUrl,
      profileId: profile.id,
    });
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "linkAdded", newLink };
  } catch (e: unknown) {
    return { error: "Failed to add link." };
  }
}

export async function updateExternalLink(
  _prevState: ExternalLinkFormState | undefined,
  formData: FormData,
): Promise<ExternalLinkFormState> {
  const { profile } = await getUserAndProfile();
  const linkId = formData.get("linkId") as string;
  const validated = ExternalLinkSchema.safeParse({
    label: formData.get("label"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedLink = await profileService.updateExternalLink(
      linkId,
      profile.id,
      validated.data,
    );
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "linkUpdated", updatedLink };
  } catch (e: unknown) {
    return { error: "Failed to update link." };
  }
}

export async function deleteExternalLink(
  linkId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string; messageKey?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.deleteExternalLink(linkId, profile.id);
    revalidatePath("/profile/edit");
    return { success: true, deletedId: linkId, messageKey: "linkDeleted" };
  } catch (e: unknown) {
    return { success: false, error: "Failed to delete link." };
  }
}