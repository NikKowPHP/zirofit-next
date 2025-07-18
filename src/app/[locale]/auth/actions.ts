
"use server";

import { createClient } from "../../../lib/supabase/server";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";

const getRegisterSchema = async () => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "ZodErrors" });
  return z.object({
    name: z.string().min(2, t("name_min_2")),
    email: z.string().email(t("invalid_email")),
    password: z.string().min(8, t("password_min_8")),
    role: z.enum(["client", "trainer"]),
  });
};

interface RegisterState {
  message?: string | null;
  error?: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export async function registerUser(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const registerSchema = await getRegisterSchema();
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, email, password, role } = validatedFields.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, // Optional: for email confirmation
      data: {
        full_name: name, // Store name in Supabase Auth metadata (optional but good)
      },
    },
  });

  if (authError || !authData.user) {
    console.error("Supabase Auth Error:", authError);
    return {
      error:
        authError?.message || "Failed to register user with auth provider.",
      success: false,
    };
  }

  // Create user in Prisma database, linking to Supabase Auth user
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "Email already registered.",
        errors: { _form: ["This email is already in use."] },
        success: false,
      };
    }

    // Username generation logic from Laravel (simplified)
    let baseSlug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!baseSlug) {
      const emailParts = email.split("@");
      baseSlug =
        emailParts[0].toLowerCase().replace(/[^a-z0-9-]/g, "") ||
        Math.random().toString(36).substring(2, 10);
    }
    let username = baseSlug;
    let count = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseSlug}-${count}`;
      count++;
    }

    const operations = [
      prisma.user.create({
        data: {
          id: authData.user.id, // Use Supabase Auth UUID as the primary key
          name,
          email,
          username, // Add username
          role: role,
        },
      }),
      prisma.profile.create({
        data: {
          userId: authData.user.id,
        },
      }),
    ];

    if (role === "client") {
      operations.push(
        prisma.client.create({
          data: {
            userId: authData.user.id,
            name: name,
            email: email,
            status: "active",
            trainerId: null,
          },
        }) as any,
      );
    }

    await prisma.$transaction(operations);
  } catch (dbError: unknown) {
    console.error("Prisma DB Error:", dbError);
    // Potentially delete the Supabase auth user if Prisma creation fails (for consistency)
    // await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
    const errorMessage =
      dbError instanceof Error ? dbError.message : "Unknown database error";
    return {
      error: "Failed to save user details to database. " + errorMessage,
      success: false,
    };
  }

  const locale = await getLocale();
  redirect(`/${locale}/auth/login?messageKey=registrationSuccess`);
}

const getLoginSchema = async () => {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "ZodErrors" });
    return z.object({
        email: z.string().email(t('invalid_email')),
        password: z.string().min(1, t('password_is_required')), // Min 1, Supabase handles actual length
    });
}

interface LoginState {
  message?: string | null;
  error?: string | null;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export async function loginUser(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const loginSchema = await getLoginSchema();
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase Login Error:", error);
    return { error: error.message || "Failed to log in.", success: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Could not retrieve user session after login.",
      success: false,
    };
  }
  const prismaUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const locale = await getLocale();
  if (prismaUser?.role === "client") {
    redirect(`/${locale}/client-dashboard`);
  }

  redirect(`/${locale}/dashboard`);
}

export async function logoutUser() {
  // No prevState or formData needed for simple logout
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase Logout Error:", error);
    // Even if logout fails on Supabase, attempt to redirect.
    // Client-side should clear any local session info if necessary.
    // Consider how to handle this error more gracefully if needed.
  }

  const locale = await getLocale();
  redirect(`/${locale}/auth/login?messageKey=logoutSuccess`);
}