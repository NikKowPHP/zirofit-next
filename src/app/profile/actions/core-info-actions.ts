"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserAndProfile } from "./_utils";
import type { User, Profile } from "./_utils";
import { Prisma } from "@prisma/client";

const CoreInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Username can only contain lowercase letters, numbers, and hyphens.",
    ),
  certifications: z.string().max(255).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});

interface CoreInfoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  updatedFields?: Partial<User & Profile>;
}

export async function updateCoreInfo(
  prevState: CoreInfoFormState | undefined,
  formData: FormData,
): Promise<CoreInfoFormState> {
  const { user } = await getUserAndProfile();

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

  const { name, username, ...profileData } = validatedFields.data;

  try {
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
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

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, username } }),
      prisma.profile.update({ where: { userId: user.id }, data: profileData }),
    ]);

    revalidatePath("/profile/edit");
    return {
      success: true,
      message: "Core info updated successfully!",
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
    return { error: `Failed to update core info: ${e instanceof Error ? e.message : String(e)}` };
  }
}