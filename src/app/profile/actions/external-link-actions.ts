"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserAndProfile } from "./_utils";
import type { ExternalLink } from "./_utils";

const ExternalLinkSchema = z.object({
  label: z.string().min(1, "Label is required."),
  linkUrl: z.string().url("Must be a valid URL."),
});

export interface ExternalLinkFormState {
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
  const validated = ExternalLinkSchema.safeParse({
    label: formData.get("label"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const newLink = await prisma.externalLink.create({
      data: { ...validated.data, profileId: profile.id },
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Link added.", newLink };
  } catch (e: unknown) {
    return { error: "Failed to add link." };
  }
}

export async function updateExternalLink(
  prevState: ExternalLinkFormState | undefined,
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
    const updatedLink = await prisma.externalLink.update({
      where: { id: linkId, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Link updated.", updatedLink };
  } catch (e: unknown) {
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
  } catch (e: unknown) {
    return { success: false, error: "Failed to delete link." };
  }
}