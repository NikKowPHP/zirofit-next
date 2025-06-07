

**Phase 3: Core UI Components & Layouts**

**TODO #28:**
Objective: Install Tailwind CSS and Heroicons for Next.js.
File(s) To Create/Modify: `package.json`, `tailwind.config.ts`, `src/app/globals.css`, `postcss.config.mjs`.
Specific Instructions:
1.  **Install Dependencies:**
    ```bash
    npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
    npm install @heroicons/react
    ```
2.  **Initialize Tailwind CSS:**
    ```bash
    npx tailwindcss init -p
    ```
    This will create `tailwind.config.ts` (or `.js`) and `postcss.config.mjs`.







    
3.  **Configure `tailwind.config.ts`:**
    *   Ensure the `content` array includes paths to your Next.js components and pages:
        ```typescript
        // tailwind.config.ts
        import type { Config } from 'tailwindcss'

        const config: Config = {
          content: [
            './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
            './src/components/**/*.{js,ts,jsx,tsx,mdx}',
            './src/app/**/*.{js,ts,jsx,tsx,mdx}',
          ],
          theme: {
            extend: {
              // You can extend your theme here if needed later
              // Example from Laravel project:
              // colors: {
              //   action: '#0171e3',
              // },
              // fontFamily: {
              //   sans: ['Instrument Sans', ...defaultTheme.fontFamily.sans],
              // }
            },
          },
          plugins: [
            require('@tailwindcss/forms'), // Add forms plugin
          ],
        }
        export default config
        ```
4.  **Configure `src/app/globals.css`:**
    *   Add the Tailwind directives at the top:
        ```css
        /* src/app/globals.css */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;

        /* Your existing global styles from the XML, if any, or new ones */
        :root {
          --background: #ffffff;
          --foreground: #171717;
        }
        /* Remove dark mode specific styles for now as per requirement "we dont have dark mode on the frontend" */
        /* @media (prefers-color-scheme: dark) {
          :root {
            --background: #0a0a0a;
            --foreground: #ededed;
          }
        } */
        body {
          background: var(--background);
          color: var(--foreground);
          font-family: var(--font-geist-sans); /* Using Geist from default Next.js setup */
        }
        html {
          scroll-behavior: smooth; /* From Laravel app.css */
        }
        ```
5.  **Verify `postcss.config.mjs`** (should be auto-generated correctly):
    ```javascript
    // postcss.config.mjs
    const config = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    export default config;
    ```
Expected Outcome: Tailwind CSS is configured and ready to use. Heroicons library is installed. `@tailwindcss/forms` plugin is available.
Best Practice Reminders: Keep `tailwind.config.ts` clean and only extend the theme as necessary. Ensure `globals.css` sets up Tailwind directives correctly.

**TODO #29:**
Objective: Create a basic authenticated layout component (`TrainerDashboardLayout`).
File(s) To Create/Modify: `src/components/layouts/TrainerDashboardLayout.tsx` (new), `src/app/dashboard/layout.tsx` (new).
Specific Instructions:
1.  Create `src/components/layouts/TrainerDashboardLayout.tsx`:
    This layout will include a sidebar for navigation and a main content area. For now, the sidebar will be static with placeholder links.
    ```tsx
    // src/components/layouts/TrainerDashboardLayout.tsx
    import React from 'react';
    import Link from 'next/link';
    import { HomeIcon, UserCircleIcon, UserGroupIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
    import LogoutButton from '@/components/auth/LogoutButton'; // We created this earlier

    interface TrainerDashboardLayoutProps {
      children: React.ReactNode;
      headerTitle?: string;
      userEmail?: string; // To display user email
    }

    export default function TrainerDashboardLayout({ children, headerTitle, userEmail }: TrainerDashboardLayoutProps) {
      // Placeholder navigation items, will be dynamic later
      const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true }, // Update 'current' based on route later
        { name: 'Profile Settings', href: '/profile/edit', icon: UserCircleIcon, current: false },
        { name: 'Manage Clients', href: '/clients', icon: UserGroupIcon, current: false },
      ];

      return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md flex-shrink-0">
            <div className="p-6">
              <Link href="/dashboard" className="flex items-center space-x-2">
                  {/* Placeholder for logo */}
                  <span className="text-2xl font-bold text-indigo-600">ZIRO.FIT</span>
              </Link>
            </div>
            <nav className="mt-6 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-2
                              ${item.current
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
              {userEmail && <p className="text-xs text-gray-500 mb-2">Logged in as: {userEmail}</p>}
              <LogoutButton />
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-semibold text-gray-900">
                  {headerTitle || 'Dashboard'}
                </h1>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              {children}
            </main>
          </div>
        </div>
      );
    }
    ```
2.  Create `src/app/dashboard/layout.tsx` to use this new layout specifically for the dashboard section:
    ```tsx
    // src/app/dashboard/layout.tsx
    import TrainerDashboardLayout from '@/components/layouts/TrainerDashboardLayout';
    import { createClient } from '@/lib/supabase/server'; // For fetching user session

    export default async function DashboardSectionLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      return (
        <TrainerDashboardLayout userEmail={user?.email} headerTitle="Dashboard">
          {children}
        </TrainerDashboardLayout>
      );
    }
    ```
3.  Update `src/app/dashboard/page.tsx` to remove its own layout structure and rely on the new `DashboardSectionLayout`.
    ```tsx
    // src/app/dashboard/page.tsx
    // Remove LogoutButton import from here, it's in the layout
    // import LogoutButton from "@/components/auth/LogoutButton";
    import { createClient } from "@/lib/supabase/server";
    import { redirect } from "next/navigation";

    export default async function DashboardPage() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Middleware should handle this, but as a fallback:
        return redirect('/auth/login');
      }

      return (
        // Content specific to dashboard page
        <div>
          <p className="text-gray-700">
            You are logged in! Your Supabase User ID is: {user.id}.
          </p>
          <p className="mt-4">This is the main content area for the dashboard.</p>
          {/* Add dashboard specific widgets/content here later */}
        </div>
      );
    }
    ```
Expected Outcome: The `/dashboard` route now uses the `TrainerDashboardLayout`, showing a sidebar with placeholder navigation and the main content area. The logout button is part of this layout.
Best Practice Reminders: Layout components improve code reuse. Pass necessary data like `userEmail` and `headerTitle` as props.

**TODO #30:**
Objective: Create a basic public layout component (`PublicLayout`).
File(s) To Create/Modify: `src/components/layouts/PublicLayout.tsx` (new), `src/app/layout.tsx` (modify to use as default or for public pages).
Specific Instructions:
1.  Create `src/components/layouts/PublicLayout.tsx`:
    This layout will be very simple, including a basic header with a logo and login/register links, and a simple footer.
    ```tsx
    // src/components/layouts/PublicLayout.tsx
    import React from 'react';
    import Link from 'next/link';
    import Image from 'next/image'; // For logo

    interface PublicLayoutProps {
      children: React.ReactNode;
    }

    export default function PublicLayout({ children }: PublicLayoutProps) {
      return (
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex-shrink-0 flex items-center">
                    {/* Placeholder for logo, similar to Laravel welcome page */}
                    {/* <Image src="/assets/ziro.avif" alt="ZIRO.FIT Logo" width={95} height={36} className="h-9 w-auto" /> */}
                    <span className="text-2xl font-bold text-indigo-600">ZIRO.FIT</span>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                    <Link href="/trainers" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                      Find Trainers
                    </Link>
                  </div>
                </div>
                {/* Mobile menu button can be added later if needed */}
              </div>
            </nav>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-gray-100 border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} ZIRO.FIT. All rights reserved.
              </p>
              {/* Add more footer content similar to Laravel welcome page later */}
            </div>
          </footer>
        </div>
      );
    }
    ```
2.  Modify `src/app/layout.tsx` (the root layout) to use this `PublicLayout` for non-authenticated sections by default, or adjust how layouts are nested based on route groups. For simplicity, we can apply it globally and let specific sections like `/dashboard` override it with their own layout.
    *   The existing `src/app/layout.tsx` is a root layout. We will apply the `PublicLayout` to the home page (`src/app/page.tsx`) for now. Other public pages like trainer profiles will also use this.
3.  Update `src/app/page.tsx` (Home Page) to be wrapped by `PublicLayout`:
    ```tsx
    // src/app/page.tsx
    import Image from "next/image";
    import PublicLayout from "@/components/layouts/PublicLayout"; // Import the layout

    export default function Home() {
      return (
        <PublicLayout> {/* Wrap content with PublicLayout */}
          <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
              {/* Content from Laravel welcome page - simplified for now */}
              <div className="flex flex-col justify-center items-center gap-[10px] py-16">
                <div className="w-full max-w-5xl mx-auto">
                  <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900 leading-tight">
                      Transform Bodies, <br />Build Your Empire
                    </h1>
                  </div>
                </div>
                <div className="outline-none flex flex-col justify-start flex-shrink-0 transform-none max-w-[600px] mx-auto mt-4">
                  <h2 className="text-xl md:text-2xl leading-[33.6px] text-center text-gray-600">
                    Attract More Clients, Showcase Your Results, and Grow Your Fitness Business
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 p-0 m-0 pt-12">
                  <a href="/trainers" // Link to trainer discovery page
                    className="flex items-center justify-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 min-w-[210px] py-3 px-8 rounded-full text-lg font-semibold transition-colors">
                    See Case Study (Find Trainers)
                  </a>
                  <a href="/auth/register"
                    className="flex items-center justify-center border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 min-w-[210px] py-3 px-8 rounded-full text-lg font-semibold transition-colors">
                    Sign Up
                  </a>
                </div>
              </div>
            </main>
            {/* Footer is part of PublicLayout, so no need for the one from original page.tsx here */}
          </div>
        </PublicLayout>
      );
    }
    ```
4.  Modify `src/app/auth/login/page.tsx` and `src/app/auth/register/page.tsx` to use `PublicLayout` as well:
    *   In `src/app/auth/login/page.tsx`, import `PublicLayout` and wrap the existing content.
    *   In `src/app/auth/register/page.tsx`, import `PublicLayout` and wrap the existing content.
    *Example for `src/app/auth/login/page.tsx`:*
    ```tsx
    // src/app/auth/login/page.tsx
    "use client";
    import { useFormState, useFormStatus } from 'react-dom';
    import { loginUser } from '@/app/auth/actions';
    import PublicLayout from '@/components/layouts/PublicLayout'; // Import

    // ... (initialState, SubmitButton remain the same) ...

    export default function LoginPage() {
      const [state, formAction] = useFormState(loginUser, initialState);
      return (
        <PublicLayout> {/* Wrap with PublicLayout */}
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 sm:px-6 lg:px-8"> {/* Adjusted padding */}
            <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
              {/* ... rest of the form ... */}
            </div>
          </div>
        </PublicLayout>
      );
    }
    ```
    *Apply similar wrapping for `src/app/auth/register/page.tsx`.*
Expected Outcome: A basic public layout is created. The home page and auth pages now use this public layout, providing a consistent header and footer.
Best Practice Reminders: Define clear boundaries between authenticated and public layouts. The root layout in `src/app/layout.tsx` should remain minimal, containing global elements like `<html>`, `<body>`, and font/CSS links.

**TODO #31:**
Objective: Create reusable UI components: `Button`, `Input`, `Label`, `Textarea`.
File(s) To Create/Modify: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Label.tsx`, `src/components/ui/Textarea.tsx` (all new).
Specific Instructions:
1.  Create directory `src/components/ui`.
2.  **`src/components/ui/Button.tsx`**:
    ```tsx
    // src/components/ui/Button.tsx
    import React from 'react';

    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'danger';
      size?: 'sm' | 'md' | 'lg';
    }

    const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
      ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
        
        const variantStyles = {
          primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
          secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
          danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        };

        const sizeStyles = {
          sm: 'px-3 py-1.5 text-xs',
          md: 'px-4 py-2 text-sm',
          lg: 'px-6 py-3 text-base',
        };

        return (
          <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
            ref={ref}
            {...props}
          />
        );
      }
    );
    Button.displayName = 'Button';
    export { Button };
    ```
3.  **`src/components/ui/Input.tsx`**:
    ```tsx
    // src/components/ui/Input.tsx
    import React from 'react';

    export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

    const Input = React.forwardRef<HTMLInputElement, InputProps>(
      ({ className, type, ...props }, ref) => {
        return (
          <input
            type={type}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 ${className || ''}`}
            ref={ref}
            {...props}
          />
        );
      }
    );
    Input.displayName = 'Input';
    export { Input };
    ```
4.  **`src/components/ui/Label.tsx`**:
    ```tsx
    // src/components/ui/Label.tsx
    import React from 'react';

    interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

    const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
      ({ className, ...props }, ref) => {
        return (
          <label
            ref={ref}
            className={`block text-sm font-medium text-gray-700 ${className || ''}`}
            {...props}
          />
        );
      }
    );
    Label.displayName = 'Label';
    export { Label };
    ```
5.  **`src/components/ui/Textarea.tsx`**:
    ```tsx
    // src/components/ui/Textarea.tsx
    import React from 'react';

    export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

    const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
      ({ className, ...props }, ref) => {
        return (
          <textarea
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 ${className || ''}`}
            ref={ref}
            {...props}
          />
        );
      }
    );
    Textarea.displayName = 'Textarea';
    export { Textarea };
    ```
Expected Outcome: Basic, reusable Button, Input, Label, and Textarea components are created with minimal styling.
Best Practice Reminders: Use `React.forwardRef` for components that might need to be referenced. Keep styling consistent. These components can be enhanced later.

---

Please have @roo start with TODO #28. Let me know when it's completed.