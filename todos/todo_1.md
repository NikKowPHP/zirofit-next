


**Phase 2: Authentication (Supabase Auth) & Core API Setup**

**TODO #20:** !!!!!!!!!!!!
Objective: Create Supabase clientutility  functions for client and server components.
File(s) To Create/Modify: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`.
Specific Instructions:
1.  Create a directory `src/lib/supabase`.
2.  Create `src/lib/supabase/client.ts` for the client-side Supabase client:
    ```typescript
    // src/lib/supabase/client.ts
    import { createBrowserClient } from '@supabase/ssr';

    export function createClient() {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    ```
3.  Create `src/lib/supabase/server.ts` for server-side (Server Components, API Routes, Server Actions) Supabase client:
    ```typescript
    // src/lib/supabase/server.ts
    import { createServerClient, type CookieOptions } from '@supabase/ssr';
    import { cookies } from 'next/headers';

    export function createClient() {
      const cookieStore = cookies();

      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options });
              } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      );
    }
    ```
Expected Outcome: Utility functions are created to initialize Supabase clients for different contexts (client-side, server-side).
Best Practice Reminders: These helpers abstract client creation and handle cookies for server-side authentication.

**TODO #21:**
Objective: Create a basic Register page component. !!!!!!!!!!!!
File(s) To Create/Modify: `src/app/auth/register/page.tsx`.
Specific Instructions:
1.  Create the directory structure: `src/app/auth/register/`.
2.  Create a new file `src/app/auth/register/page.tsx`.
3.  Implement a basic React component for the registration form. For now, it will just have fields for `name`, `email`, `password`, and `confirmPassword`. Styling can be minimal Tailwind CSS. This page will later use a Server Action for submission.
    ```tsx
    // src/app/auth/register/page.tsx
    "use client"; // For now, will convert to use Server Action later

    import { useState } from 'react';

    export default function RegisterPage() {
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [error, setError] = useState<string | null>(null);
      const [message, setMessage] = useState<string | null>(null);

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        // Placeholder for actual registration logic
        setMessage("Registration form submitted (placeholder).");
        console.log({ name, email, password });
      };

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Register as Trainer</h1>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </form>
             <p className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Log in
                </a>
              </p>
          </div>
        </div>
      );
    }
    ```
Expected Outcome: A basic, non-functional (in terms of backend) registration page is accessible at `/auth/register`.
Best Practice Reminders: Use semantic HTML for form elements. Minimal client-side validation for now.





**TODO #22:**
Objective: Create a basic Login page component.
File(s) To Create/Modify: `src/app/auth/login/page.tsx`.
Specific Instructions:
1.  Create the directory structure: `src/app/auth/login/`.
2.  Create a new file `src/app/auth/login/page.tsx`.
3.  Implement a basic React component for the login form with fields for `email` and `password`. This page will later use a Server Action.
    ```tsx
    // src/app/auth/login/page.tsx
    "use client"; // For now, will convert to use Server Action later

    import { useState } from 'react';

    export default function LoginPage() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState<string | null>(null);
      const [message, setMessage] = useState<string | null>(null);

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        // Placeholder for actual login logic
        setMessage("Login form submitted (placeholder).");
        console.log({ email, password });
      };

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Trainer Login</h1>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              {/* Optional: Add remember me and forgot password links later */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log In
                </button>
              </div>
            </form>
            <p className="mt-4 text-center text-sm">
              Need an account?{' '}
              <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register
              </a>
            </p>
          </div>
        </div>
      );
    }
    ```
Expected Outcome: A basic, non-functional (in terms of backend) login page is accessible at `/auth/login`.
Best Practice Reminders: Keep UI simple for now; focus on functionality integration in subsequent steps.

**TODO #23:**
Objective: Create a Server Action for user registration.
File(s) To Create/Modify: `src/app/auth/actions.ts` (new file), `src/app/auth/register/page.tsx` (modify).
Specific Instructions:
1.  Create `src/app/auth/actions.ts`:
    ```typescript
    // src/app/auth/actions.ts
    "use server";

    import { createClient } from "@/lib/supabase/server";
    import { prisma } from "@/lib/prisma";
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
      // If auto-login happens, client-side needs to react to session change.
      // Supabase signUp by default logs the user in.
      // return { success: true, message: "Registration successful! Please log in." };
      redirect('/auth/login?message=Registration successful! Please log in.'); // Redirect after successful creation
    }
    ```
2.  Modify `src/app/auth/register/page.tsx` to use `useFormState` and call the server action:
    ```tsx
    // src/app/auth/register/page.tsx
    "use client";

    import { useFormState, useFormStatus } from 'react-dom'; // Import useFormStatus
    import { registerUser } from '@/app/auth/actions'; // Adjust path as needed
    import { useEffect } from 'react';

    const initialState = {
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
          {pending ? 'Registering...' : 'Register'}
        </button>
      );
    }

    export default function RegisterPage() {
      const [state, formAction] = useFormState(registerUser, initialState);
      
      // useEffect(() => { // For client-side redirect or message handling if not using server redirect
      //   if (state?.success && state.message) {
      //     // router.push('/auth/login?message=' + encodeURIComponent(state.message));
      //     alert(state.message); // Or show a toast
      //   }
      // }, [state, router]);

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Register as Trainer</h1>
            
            {state?.error && !state.errors && <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">{state.error}</p>}
            {state?.message && !state.error && <p className="text-green-500 text-sm mb-4 bg-green-100 p-2 rounded">{state.message}</p>}

            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
                {state?.errors?.name && state.errors.name.map((err) => (
                  <p key={err} className="text-red-500 text-xs mt-1">{err}</p>
                ))}
              </div>
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
                {state?.errors?.email && state.errors.email.map((err) => (
                  <p key={err} className="text-red-500 text-xs mt-1">{err}</p>
                ))}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
                {state?.errors?.password && state.errors.password.map((err) => (
                  <p key={err} className="text-red-500 text-xs mt-1">{err}</p>
                ))}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword" // Supabase handles confirmation, or you can check in action
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
                {/* Client-side check if password mismatch, or handle in action */}
              </div>
              <SubmitButton />
            </form>
            <p className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </a>
            </p>
          </div>
        </div>
      );
    }
    ```
Expected Outcome: Registration form now submits to the server action. Supabase Auth user and Prisma User are created. Redirect to login on success.
Best Practice Reminders: Use Zod for validation. Implement proper error handling and user feedback. The username generation logic is a simplified version of the Laravel one; ensure it's robust.









**TODO #24:**
Objective: Create a Server Action for user login.
File(s) To Create/Modify: `src/app/auth/actions.ts` (add login function), `src/app/auth/login/page.tsx` (modify).
Specific Instructions:
1.  Add the `loginUser` server action to `src/app/auth/actions.ts`:
    ```typescript
    // src/app/auth/actions.ts
    // ... (keep existing registerUser and imports)

    const loginSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"), // Min 1, Supabase handles actual length
    });

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
    
    export async function loginUser(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
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
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Login Error:", error);
        return { error: error.message || "Failed to log in.", success: false };
      }

      // On successful Supabase login, the session cookies are automatically set by the Supabase client.
      // Redirect to dashboard. The middleware will handle session refresh.
      redirect('/dashboard'); // Or wherever your authenticated users should go
    }
    ```
2.  Modify `src/app/auth/login/page.tsx` to use `useFormState` and call the `loginUser` server action:
    ```tsx
    // src/app/auth/login/page.tsx
    "use client";

    import { useFormState, useFormStatus } from 'react-dom';
    import { loginUser } from '@/app/auth/actions'; // Adjust path
    // import { useRouter } from 'next/navigation'; // For client-side redirect if needed
    // import { useEffect } from 'react';

    const initialState = {
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
      // const router = useRouter();

      // useEffect(() => { // Example for client-side handling, but server redirect is preferred
      //   if (state?.success) {
      //     router.push('/dashboard');
      //   }
      // }, [state, router]);

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
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
                {state?.errors?.email && state.errors.email.map((err) => (
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
                 {state?.errors?.password && state.errors.password.map((err) => (
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
      );
    }
    ```
Expected Outcome: Login form submits to the server action. User is authenticated with Supabase. Redirects to dashboard on success.
Best Practice Reminders: Redirect on the server-side within the Server Action is generally preferred.

**TODO #25:**
Objective: Create a Server Action for user logout.
File(s) To Create/Modify: `src/app/auth/actions.ts` (add logout function).
Specific Instructions:
1.  Add the `logoutUser` server action to `src/app/auth/actions.ts`:
    ```typescript
    // src/app/auth/actions.ts
    // ... (keep existing registerUser, loginUser and imports)

    export async function logoutUser() { // No prevState or formData needed for simple logout
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase Logout Error:", error);
        // Even if logout fails on Supabase, attempt to redirect.
        // Client-side should clear any local session info if necessary.
        // Consider how to handle this error more gracefully if needed.
      }
      
      redirect('/auth/login?message=Logged out successfully.'); // Redirect to login page
    }
    ```
Expected Outcome: A server action for logging out the user is created.
Best Practice Reminders: Logout should clear the session on Supabase.

**TODO #26:**
Objective: Implement a logout button and integrate it into a basic authenticated page (e.g., a simple Dashboard page).
File(s) To Create/Modify: `src/app/dashboard/page.tsx` (new), `src/components/auth/LogoutButton.tsx` (new).
Specific Instructions:
1.  Create `src/components/auth/LogoutButton.tsx`:
    ```tsx
    // src/components/auth/LogoutButton.tsx
    "use client";

    import { logoutUser } from "@/app/auth/actions"; // Adjust path
    import { useTransition } from 'react';

    export default function LogoutButton() {
      const [isPending, startTransition] = useTransition();

      const handleLogout = () => {
        startTransition(async () => {
          await logoutUser();
        });
      };

      return (
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? 'Logging out...' : 'Log Out'}
        </button>
      );
    }
    ```
2.  Create a simple `src/app/dashboard/page.tsx`:
    ```tsx
    // src/app/dashboard/page.tsx
    import LogoutButton from "@/components/auth/LogoutButton"; // Adjust path
    import { createClient } from "@/lib/supabase/server";
    import { redirect } from "next/navigation";

    export default async function DashboardPage() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return redirect('/auth/login'); // Protect this page
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4">Dashboard</h1>
            <p className="text-center mb-2">Welcome, {user.email}!</p>
            <p className="text-center mb-6 text-sm text-gray-600">(Supabase User ID: {user.id})</p>
            <div className="mt-6 flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      );
    }
    ```
Expected Outcome: A dashboard page is created. If a user is logged in (session exists), they see a welcome message and a logout button. Clicking logout calls the server action and redirects.
Best Practice Reminders: The dashboard page currently uses `supabase.auth.getUser()` for auth check; middleware will centralize this.

**TODO #27:**
Objective: Create Supabase middleware to manage user sessions.
File(s) To Create/Modify: `src/middleware.ts`.
Specific Instructions:
1.  Create `src/middleware.ts` at the root of your `src` directory:
    ```typescript
    // src/middleware.ts
    import { createServerClient, type CookieOptions } from '@supabase/ssr';
    import { NextResponse, type NextRequest } from 'next/server';

    export async function middleware(request: NextRequest) {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value: '',
                ...options,
              });
            },
          },
        }
      );

      // Refresh session if expired - important to keep user logged in
      const { data: { session } } = await supabase.auth.getSession();

      const { data: { user } } = await supabase.auth.getUser();

      // Define protected and auth routes
      const protectedRoutes = ['/dashboard', '/profile', '/clients']; // Add more as needed
      const authRoutes = ['/auth/login', '/auth/register'];

      const { pathname } = request.nextUrl;

      // If user is not logged in and trying to access a protected route, redirect to login
      if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/auth/login?error=Please log in to access this page.', request.url));
      }

      // If user is logged in and trying to access an auth route (login/register), redirect to dashboard
      if (user && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return response;
    }

    export const config = {
      matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      ],
    };
    ```
Expected Outcome: Supabase middleware is set up to refresh sessions and protect routes. Unauthenticated users trying to access `/dashboard` will be redirected to `/auth/login`. Authenticated users trying to access `/auth/login` or `/auth/register` will be redirected to `/dashboard`.
Best Practice Reminders: The `matcher` config is important to avoid running middleware on static assets. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in `.env.local`.

---
This completes the initial setup for Authentication. Please confirm when @roo has completed these tasks, starting with TODO #19.