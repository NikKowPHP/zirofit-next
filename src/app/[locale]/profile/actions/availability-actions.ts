
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";

export interface AvailabilityFormState {
    messageKey?: string | null;
    error?: string | null;
    success?: boolean;
}

const AvailabilitySchema = z.object({
    availability: z.string().transform((str, ctx) => {
        try {
            const parsed = JSON.parse(str);
            if (typeof parsed !== 'object' || parsed === null) {
                ctx.addIssue({ code: "custom", message: "Invalid availability format" });
                return z.NEVER;
            }
            return parsed;
        } catch (e) {
            ctx.addIssue({ code: "custom", message: "Invalid JSON format" });
            return z.NEVER;
        }
    }),
});

export async function updateAvailability(
    _prevState: AvailabilityFormState | undefined,
    formData: FormData
): Promise<AvailabilityFormState> {
    const { profile } = await getUserAndProfile();

    const validatedFields = AvailabilitySchema.safeParse({
        availability: formData.get("availability"),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid availability data provided.",
            success: false,
        };
    }

    try {
        await profileService.updateAvailability(profile.id, validatedFields.data.availability);

        revalidatePath("/profile/edit");
        return {
            success: true,
            messageKey: "availabilityUpdated",
        };
    } catch (e: unknown) {
        console.error("Failed to update availability:", e);
        return {
            error: `An unexpected error occurred while saving your availability: ${e instanceof Error ? e.message : String(e)}`,
            success: false,
        };
    }
}