"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserAndProfile } from "./_utils";

export interface TextContentFormState {
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
  } catch (e: unknown) {
    return { error: `Failed to update ${fieldName}: ${e instanceof Error ? e.message : String(e)}` };
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