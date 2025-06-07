// src/app/auth/actions.ts
"use server";

import { createClient } from "../../lib/supabase/server";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache"; // For later use if needed

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

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

export async function registerUser(prevState: RegisterState | undefined, formData: FormData): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
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

  const { name, email, password } = validatedFields.data;
  const supabase = createClient();

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
    return { error: authError?.message || "Failed to register user with auth provider.", success: false };
  }

  // Create user in Prisma database, linking to Supabase Auth user
  try {
    // Username generation logic from Laravel (simplified)
    let baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!baseSlug) {
        const emailParts = email.split('@');
        baseSlug = emailParts[0].toLowerCase().replace(/[^a-z0-9-]/g, '') || Math.random().toString(36).substring(2, 10);
    }
    let username = baseSlug;
    let count = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseSlug}-${count}`;
        count++;
    }
    
    await prisma.user.create({
      data: {
        supabaseAuthUserId: authData.user.id,
        name,
        email,
        username, // Add username
        role: "trainer", // Default role
        // emailVerifiedAt: authData.user.email_confirmed_at ? new Date(authData.user.email_confirmed_at) : null, // If email confirmation is set up
      },
    });
  } catch (dbError: any) {
    console.error("Prisma DB Error:", dbError);
    // Potentially delete the Supabase auth user if Prisma creation fails (for consistency)
    // await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
    return { error: "Failed to save user details to database. " + (dbError.message || ""), success: false };
  }

  // For now, redirect to login. Later, might redirect to a "check your email" page if confirmation is enabled.
  // Or directly to dashboard if auto-login after signup is desired (Supabase handles session)
  // Supabase signUp by default logs the user in.
  // return { success: true, message: "Registration successful! Please log in." };
  redirect('/auth/login?message=Registration successful! Please log in.'); // Redirect after successful creation
}