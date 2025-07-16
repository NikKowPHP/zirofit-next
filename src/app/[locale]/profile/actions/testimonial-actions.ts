
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { Testimonial } from "./_utils";

const TestimonialSchema = z.object({
  clientName: z.string().min(2, "Client Name is required."),
  testimonialText: z.string().min(10, "Testimonial text is required."),
});

export interface TestimonialFormState {
  messageKey?: string | null;
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
  const validated = TestimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    testimonialText: formData.get("testimonialText"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed" };
  try {
    const newTestimonial = await profileService.createTestimonial({
      clientName: validated.data.clientName,
      testimonialText: validated.data.testimonialText,
      profileId: profile.id,
    });
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "testimonialAdded", newTestimonial };
  } catch (e: unknown) {
    return { error: "Failed to add testimonial." };
  }
}

export async function updateTestimonial(
  id: string,
  prevState: TestimonialFormState | undefined,
  formData: FormData,
): Promise<TestimonialFormState> {
  const { profile } = await getUserAndProfile();
  const validated = TestimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    testimonialText: formData.get("testimonialText"),
  });
  if (!validated.success)
    return { errors: validated.error.issues, error: "Validation failed" };
  try {
    const updatedTestimonial = await profileService.updateTestimonial(
      id,
      profile.id,
      {
        clientName: validated.data.clientName,
        testimonialText: validated.data.testimonialText,
      },
    );
    revalidatePath("/profile/edit");
    return {
      success: true,
      messageKey: "testimonialUpdated",
      updatedTestimonial,
    };
  } catch (e: unknown) {
    return { error: `Failed to update testimonial: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function deleteTestimonial(
  id: string,
  _prevState?: TestimonialFormState | undefined,
): Promise<TestimonialFormState> {
  const { profile } = await getUserAndProfile();
  try {
    await profileService.deleteTestimonial(id, profile.id);
    revalidatePath("/profile/edit");
    return { success: true, messageKey: "testimonialDeleted", deletedId: id };
  } catch (e: unknown) {
    return { error: `Failed to delete testimonial: ${e instanceof Error ? e.message : String(e)}` };
  }
}