
"use server";
import { revalidatePath } from "next/cache";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";

export interface TextContentFormState {
  messageKey?: string | null;
  error?: string | null;
  success?: boolean;
  updatedContent?: string | null;
}

type FieldName = "aboutMe" | "philosophy" | "methodology";

async function updateProfileTextField(
  fieldName: FieldName,
  _prevState: TextContentFormState | undefined,
  formData: FormData,
): Promise<TextContentFormState> {
  const { profile } = await getUserAndProfile();
  const content = formData.get(`${fieldName}Content`) as string;

  try {
    await profileService.updateProfileTextField(profile.id, fieldName, content);
    revalidatePath("/profile/edit");
    const messageKey = `${fieldName.charAt(0).toLowerCase() + fieldName.slice(1)}Updated` as const;
    
    return {
      success: true,
      messageKey: messageKey,
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