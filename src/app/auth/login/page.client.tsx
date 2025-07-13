// src/app/auth/login/page.client.tsx
"use client";

import { useFormStatus } from "react";
import { useFormState } from "react-dom";
import { loginUser } from "../actions";
import PublicLayout from "../../../components/layouts/PublicLayout";
import { Input, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";

interface FormState {
  message: string | null;
  error: string | null;
  errors?: {
    email?: string[];
    password?: string[];
  };
  success: boolean;
}

const initialState: FormState = {
  message: null,
  error: null,
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Logging in..." : "Log In"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginUser, initialState);
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center bg-neutral-50 dark:bg-black py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Trainer Login</CardTitle>
          </CardHeader>
          <CardContent>
            {state?.error && !state.errors && (
              <p className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">
                {state.error}
              </p>
            )}
            {state?.message && !state.error && (
              <p className="text-green-600 text-sm mb-4 bg-green-100 dark:bg-green-900/20 p-3 rounded-md">
                {state.message}
              </p>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1"
                />
                {state?.errors?.email &&
                  state.errors.email.map((err: string) => (
                    <p key={err} className="text-red-500 text-xs mt-1">
                      {err}
                    </p>
                  ))}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1"
                />
                {state?.errors?.password &&
                  state.errors.password.map((err: string) => (
                    <p key={err} className="text-red-500 text-xs mt-1">
                      {err}
                    </p>
                  ))}
              </div>
              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Need an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-[var(--primary-blue)] hover:underline"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}