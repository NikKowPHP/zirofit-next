
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { User, Profile } from "./_utils";
import { Prisma } from "@prisma/client";
import { normalizeLocation } from "@/lib/utils";
import { geocodeLocation } from "@/lib/services/geocodingService";
const CoreInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Username can only contain lowercase letters, numbers, and hyphens."
    ),
  certifications: z.string().max(255).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});
interface CoreInfoFormState {
  messageKey?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  updatedFields?: Partial<User & Profile>;
}
export async function updateCoreInfo(
  _prevState: CoreInfoFormState | undefined,
  formData: FormData
): Promise<CoreInfoFormState> {
  const { user, profile } = await getUserAndProfile();
  const validatedFields = CoreInfoSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    certifications: formData.get("certifications"),
    location: formData.get("location"),
    phone: formData.get("phone"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues,
      error: "Validation failed.",
    };
  }
  const { name, username, ...profileDataFromForm } = validatedFields.data;
  try {
    if (username !== user.username) {
      const existingUser = await profileService.findUserByUsername(username);
      if (existingUser) {
        return {
          error: "Username is already taken.",
          errors: [
            {
              code: "custom",
              path: ["username"],
              message: "Username is already taken.",
            },
          ],
        };
      }
    }
    const profileUpdates: Prisma.ProfileUpdateInput = {
      ...profileDataFromForm,
    };

    if (profileDataFromForm.location !== profile.location) {
      if (profileDataFromForm.location) {
        // Location added or changed
        profileUpdates.locationNormalized = normalizeLocation(
          profileDataFromForm.location
        );
        const coords = await geocodeLocation(profileDataFromForm.location);
        if (profileDataFromForm.location && !coords) {
          return {
            error: "Could not verify location.",
            errors: [
              {
                code: "custom",
                path: ["location"],
                message:
                  "We couldn't find this location. Please try the 'City, Country' format.",
              },
            ],
          };
        }
        profileUpdates.latitude = coords?.latitude;
        profileUpdates.longitude = coords?.longitude;
      } else {
        // Location cleared
        profileUpdates.locationNormalized = null;
        profileUpdates.latitude = null;
        profileUpdates.longitude = null;
      }
    }

    const [updatedUser, updatedProfile] =
      await profileService.updateUserAndProfile(
        user.id,
        { name, username },
        profileUpdates
      );

    revalidatePath("/profile/edit");
    return {
      success: true,
      messageKey: "coreInfoUpdated",
      updatedFields: {
        name: updatedUser.name,
        username: updatedUser.username,
        ...updatedProfile,
      },
    };
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" &&
      (e.meta?.target as string[])?.includes("username")
    ) {
      return {
        error: "Username is already taken.",
        errors: [
          {
            code: "custom",
            path: ["username"],
            message: "Username is already taken.",
          },
        ],
      };
    }
    return {
      error: `Failed to update core info: ${e instanceof Error ? e.message : String(e)} `,
    };
  }
}