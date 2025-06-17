// src/app/auth/login/page.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { loginUser } from '../actions';
import PublicLayout from '../../../components/layouts/PublicLayout'; // Import

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
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Logging in...' : 'Log In'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginUser, initialState);
  return (
    <PublicLayout> {/* Wrap with PublicLayout */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 sm:px-6 lg:px-8"> {/* Adjusted padding */}
        <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Trainer Login</h1>
          
          {state?.error && !state.errors && <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">{state.error}</p>}
          {state?.message && !state.error && <p className="text-green-500 text-sm mb-4 bg-green-100 p-2 rounded">{state.message}</p>}
          
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.email && state.errors.email.map((err: string) => (
                <p key={err} className="text-red-500 text-xs mt-1">{err}</p>
              ))}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
               {state?.errors?.password && state.errors.password.map((err: string) => (
                <p key={err} className="text-red-500 text-xs mt-1">{err}</p>
              ))}
            </div>
            <SubmitButton />
          </form>
           <p className="mt-4 text-center text-sm">
            Need an account?{' '}
            <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
