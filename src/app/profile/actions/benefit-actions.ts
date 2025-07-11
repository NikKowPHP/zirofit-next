"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserAndProfile } from "./_utils";

export interface BenefitFormState {
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
  const validated = BenefitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
    iconStyle: formData.get("iconStyle"),
  });
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
  } catch (e: unknown) {
    return { error: "Failed to add benefit." };
  }
}

export async function updateBenefit(
  id: string,
  prevState: BenefitFormState | undefined,
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
    await prisma.benefit.update({
      where: { id, profileId: profile.id },
      data: validated.data,
    });
    revalidatePath("/profile/edit");
    return { success: true, message: "Benefit updated." };
  } catch (e: unknown) {
    return { error: "Failed to update benefit." };
  }
}

export async function deleteBenefit(id: string): Promise<BenefitFormState> {
  const { profile } = await getUserAndProfile();
  try {
    await prisma.benefit.delete({ where: { id, profileId: profile.id } });
    revalidatePath("/profile/edit");
    return { success: true, message: "Benefit deleted." };
  } catch (e: unknown) {
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
  } catch (e: unknown) {
    return { error: "Failed to update order." };
  }
}