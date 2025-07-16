
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";

export interface BenefitFormState {
  messageKey?: string | null;
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
  _prevState: BenefitFormState | undefined,
  formData: FormData,
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  const validated = BenefitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
    iconStyle: formData.get("iconStyle"),
  });
  if (!validated.success) return { error: "Validation failed." };
  try {
    const maxOrder = await profileService.getMaxBenefitOrder(profile.id);
    await profileService.createBenefit({
      title: validated.data.title,
      description: validated.data.description,
      iconName: validated.data.iconName,
      iconStyle: validated.data.iconStyle,
      profileId: profile.id,
      orderColumn: (maxOrder._max.orderColumn ?? 0) + 1,
    });
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "benefitAdded" };
  } catch (e: unknown) {
    return { error: "Failed to add benefit." };
  }
}

export async function updateBenefit(
  id: string,
  _prevState: BenefitFormState | undefined,
  formData: FormData,
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  const validated = BenefitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
    iconStyle: formData.get("iconStyle"),
  });
  if (!validated.success) return { error: "Validation failed." };
  try {
    await profileService.updateBenefit(id, profile.id, validated.data);
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "benefitUpdated" };
  } catch (e: unknown) {
    return { error: "Failed to update benefit." };
  }
}

export async function deleteBenefit(id: string): Promise<BenefitFormState & { deletedId?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.deleteBenefit(id, profile.id);
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "benefitDeleted", deletedId: id };
  } catch (e: unknown) {
    return { error: "Failed to delete benefit." };
  }
}

export async function updateBenefitOrder(
  ids: string[],
): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.updateBenefitOrder(profile.id, ids);
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "benefitOrderUpdated" };
  } catch (e: unknown) {
    return { error: "Failed to update order." };
  }
}