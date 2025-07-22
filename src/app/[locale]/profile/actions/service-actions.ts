
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { Service } from "./_utils";

const ServiceSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  price: z
    .preprocess(
      (val) => (String(val).trim() === "" ? null : val),
      z.coerce
        .number({ invalid_type_error: "Price must be a number." })
        .positive({ message: "Price must be a positive number." })
        .optional()
        .nullable(),
    ),
  currency: z.string().optional().nullable(),
  duration: z
    .preprocess(
      (val) => (String(val).trim() === "" ? null : val),
      z.coerce
        .number({ invalid_type_error: "Duration must be a number." })
        .int({ message: "Duration must be a whole number." })
        .positive({ message: "Duration must be a positive number." })
        .optional()
        .nullable(),
    ),
});

export interface ServiceFormState {
  messageKey?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: Service;
  updatedService?: Service;
  deletedId?: string;
}

export async function addService(
  _prevState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const { profile } = await getUserAndProfile();
  const validated = ServiceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    duration: formData.get("duration"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const { title, description, price, currency, duration } = validated.data;
    const newService = await profileService.createService({
      title,
      description,
      price,
      currency,
      duration,
      profileId: profile.id,
    });
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "serviceAdded", newService };
  } catch (e: unknown) {
    return { error: "Failed to add service." };
  }
}

export async function updateService(
  _prevState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const { profile } = await getUserAndProfile();
  const serviceId = formData.get("serviceId") as string;
  const validated = ServiceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    duration: formData.get("duration"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed." };
  try {
    const updatedService = await profileService.updateService(
      serviceId,
      profile.id,
      validated.data,
    );
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "serviceUpdated", updatedService };
  } catch (e: unknown) {
    return { error: "Failed to update service." };
  }
}

export async function deleteService(
  serviceId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string; messageKey?: string }> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.deleteService(serviceId, profile.id);
    revalidatePath("/profile/edit");
    return { success: true, deletedId: serviceId, messageKey: "serviceDeleted" };
  } catch (e: unknown) {
    return { success: false, error: "Failed to delete service." };
  }
}