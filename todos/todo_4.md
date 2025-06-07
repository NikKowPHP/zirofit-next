Let's proceed to **Phase 5: Trainer Profile Editor - Core Info & Rich Text Sections**. This phase focuses on building the UI and backend logic for trainers to manage the fundamental parts of their profiles.

Here is the plan for @roo:

---

**Phase 5: Trainer Profile Editor - Core Info & Rich Text Sections**

**TODO #36:**
Objective: Create the main layout and navigation for the Profile Editor.
File(s) To Create/Modify:
*   `src/app/profile/edit/page.tsx` (new)
*   `src/app/profile/layout.tsx` (new)
*   `src/components/profile/ProfileEditorLayout.tsx` (new)
*   `src/components/profile/ProfileEditorSidebar.tsx` (new)
*   Modify `src/components/layouts/TrainerDashboardLayout.tsx` (update navigation to reflect Profile Editor link as active).
Specific Instructions:
1.  **Create `src/components/profile/ProfileEditorSidebar.tsx`:**
    *   This component will contain the navigation links for different sections of the profile editor (e.g., "Core Info", "Branding", "About", "Services", etc.).
    *   It should visually indicate the currently active section.
    *   Use Heroicons for icons next to links.
    *   Accept `currentSection` and `onSelectSection` (a function to change the section) as props.
    ```tsx
    // src/components/profile/ProfileEditorSidebar.tsx
    "use client"; // This component needs to handle client-side state for active section

    import {
      Cog6ToothIcon, SwatchIcon, GiftIcon, DocumentTextIcon, BriefcaseIcon, PhotoIcon, ChatBubbleLeftEllipsisIcon, LinkIcon
    } from '@heroicons/react/24/outline';
    import React from 'react';

    interface ProfileEditorSidebarProps {
      currentSection: string;
      onSelectSection: (section: string) => void;
    }

    const sections = [
      { id: 'core-info', name: 'Core Info', icon: Cog6ToothIcon },
      { id: 'branding', name: 'Branding', icon: SwatchIcon },
      { id: 'benefits', name: 'Benefits', icon: GiftIcon },
      { id: 'about-details', name: 'About & Details', icon: DocumentTextIcon },
      { id: 'services', name: 'Services', icon: BriefcaseIcon },
      { id: 'photos', name: 'Photos', icon: PhotoIcon },
      { id: 'testimonials', name: 'Testimonials', icon: ChatBubbleLeftEllipsisIcon },
      { id: 'links', name: 'External Links', icon: LinkIcon },
    ];

    export default function ProfileEditorSidebar({ currentSection, onSelectSection }: ProfileEditorSidebarProps) {
      return (
        <aside className="w-full md:w-1/4 lg:w-1/5 bg-white shadow-sm rounded-lg p-4 md:p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">Edit Profile Sections</h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                type="button"
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors duration-150 ease-in-out
                           ${currentSection === section.id
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
              >
                <section.icon className="h-5 w-5 flex-shrink-0" />
                {section.name}
              </button>
            ))}
          </nav>
        </aside>
      );
    }
    ```
2.  **Create `src/components/profile/ProfileEditorLayout.tsx`:**
    *   This client component will manage the state of the `selectedSection`.
    *   It will use the `ProfileEditorSidebar` and conditionally render the content for the selected section.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    "use client";

    import React, { useState, Suspense } from 'react';
    import ProfileEditorSidebar from './ProfileEditorSidebar';
    // Import section components dynamically later or statically for now
    // For now, we'll just show a placeholder for the content area

    // Placeholder components for each section - will be replaced by actual editor components
    const CoreInfoEditor = React.lazy(() => import('./sections/CoreInfoEditor')); // Example, create this file later
    const BrandingEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Branding Editor Content</div>;
    const BenefitsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Benefits Editor Content</div>;
    const AboutDetailsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">About & Details Editor Content</div>;
    const ServicesEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Services Editor Content</div>;
    const PhotosEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Photos Editor Content</div>;
    const TestimonialsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Testimonials Editor Content</div>;
    const LinksEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">External Links Editor Content</div>;

    const sectionComponents: { [key: string]: React.ComponentType<any> } = {
      'core-info': CoreInfoEditor,
      'branding': BrandingEditor,
      'benefits': BenefitsEditor,
      'about-details': AboutDetailsEditor,
      'services': ServicesEditor,
      'photos': PhotosEditor,
      'testimonials': TestimonialsEditor,
      'links': LinksEditor,
    };
    
    // Placeholder for loading state
    const SectionLoadingFallback = () => <div className="p-6 bg-white shadow-sm rounded-lg">Loading section...</div>;


    export default function ProfileEditorLayout() {
      const [selectedSection, setSelectedSection] = useState('core-info'); // Default section

      const handleSelectSection = (section: string) => {
        setSelectedSection(section);
      };

      const SelectedComponent = sectionComponents[selectedSection] || (() => <div className="p-6 bg-white shadow-sm rounded-lg">Select a section to edit.</div>);

      return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <ProfileEditorSidebar currentSection={selectedSection} onSelectSection={handleSelectSection} />
          <main className="w-full md:w-3/4 lg:w-4/5">
            {/* Global Session Status/Feedback can be added here if needed */}
            <Suspense fallback={<SectionLoadingFallback />}>
              <SelectedComponent />
            </Suspense>
          </main>
        </div>
      );
    }
    ```
3.  **Create `src/app/profile/layout.tsx`:**
    *   This layout will apply the `TrainerDashboardLayout` to all routes under `/profile`.
    ```tsx
    // src/app/profile/layout.tsx
    import TrainerDashboardLayout from '@/components/layouts/TrainerDashboardLayout';
    import { createClient } from '@/lib/supabase/server';

    export default async function ProfileSectionLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      return (
        <TrainerDashboardLayout userEmail={user?.email} headerTitle="Edit Profile">
          {children}
        </TrainerDashboardLayout>
      );
    }
    ```
4.  **Create `src/app/profile/edit/page.tsx`:**
    *   This page will simply render the `ProfileEditorLayout`.
    ```tsx
    // src/app/profile/edit/page.tsx
    import ProfileEditorLayout from '@/components/profile/ProfileEditorLayout';

    export default function EditProfilePage() {
      return <ProfileEditorLayout />;
    }
    ```
5.  **Modify `src/components/layouts/TrainerDashboardLayout.tsx`**:
    *   Update the `navigation` array to correctly highlight "Profile Settings" when on `/profile/edit` or other sub-routes of `/profile`.
    *   You'll need access to the current pathname for this. A simple way for a server component is to pass it down or use `next/headers` if this were a server component. Since `TrainerDashboardLayout` is a client component because of `LogoutButton`'s `useTransition`, use `usePathname` from `next/navigation`.
    ```tsx
    // src/components/layouts/TrainerDashboardLayout.tsx
    "use client"; // Add this if not already present because of usePathname

    import React from 'react';
    import Link from 'next/link';
    import { HomeIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
    import LogoutButton from '@/components/auth/LogoutButton'; // Ensure path is correct
    import { usePathname } from 'next/navigation'; // Import usePathname

    interface TrainerDashboardLayoutProps {
      children: React.ReactNode;
      headerTitle?: string;
      userEmail?: string;
    }

    export default function TrainerDashboardLayout({ children, headerTitle, userEmail }: TrainerDashboardLayoutProps) {
      const pathname = usePathname(); // Get current path

      const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
        { name: 'Profile Settings', href: '/profile/edit', icon: UserCircleIcon, current: pathname.startsWith('/profile') },
        { name: 'Manage Clients', href: '/clients', icon: UserGroupIcon, current: pathname.startsWith('/clients') },
      ];

      return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md flex-shrink-0">
            <div className="p-6">
              <Link href="/dashboard" className="flex items-center space-x-2">
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
                  <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" />
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
Expected Outcome: Navigating to `/profile/edit` shows the `TrainerDashboardLayout` with "Profile Settings" active. The `ProfileEditorLayout` is rendered within, showing the sidebar for profile sections and a placeholder content area.
Best Practice Reminders: Use client components (`"use client"`) for components that involve state or browser APIs like `useState`, `useEffect`, or event handlers. Server components for data fetching and rendering.







**TODO #37:**
Objective: Create the "Core Info" editor component and its server action.
File(s) To Create/Modify:
*   `src/components/profile/sections/CoreInfoEditor.tsx` (new)
*   `src/app/profile/actions.ts` (new, or add to existing auth actions if preferred, but separate is cleaner).
Specific Instructions:
1.  **Create `src/app/profile/actions.ts` for profile-related server actions:**
    ```typescript
    // src/app/profile/actions.ts
    "use server";

    import { z } from 'zod';
    import { prisma } from '@/lib/prisma';
    import { createClient } from '@/lib/supabase/server';
    import { revalidatePath } from 'next/cache';

    const coreInfoSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and hyphens."),
      certifications: z.string().max(255, "Certifications too long").optional().nullable(),
      location: z.string().max(255, "Location too long").optional().nullable(),
      phone: z.string().max(50, "Phone number too long").optional().nullable(),
    });

    interface CoreInfoFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[]; // To hold Zod validation errors
      success?: boolean;
      updatedFields?: Partial<z.infer<typeof coreInfoSchema>>; // To send back updated fields
    }

    export async function updateCoreInfo(prevState: CoreInfoFormState | undefined, formData: FormData): Promise<CoreInfoFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return { error: "User not authenticated.", success: false };
      }

      const validatedFields = coreInfoSchema.safeParse({
        name: formData.get('name'),
        username: formData.get('username'),
        certifications: formData.get('certifications'),
        location: formData.get('location'),
        phone: formData.get('phone'),
      });

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.issues,
          error: "Validation failed. Please check your input.",
          success: false,
        };
      }

      const { name, username, certifications, location, phone } = validatedFields.data;

      try {
        // Check if username is changing and if it's unique (excluding current user)
        const currentUser = await prisma.user.findUnique({
            where: { supabaseAuthUserId: authUser.id },
            select: { id: true, username: true }
        });

        if (!currentUser) {
            return { error: "User profile not found in database.", success: false };
        }

        if (username !== currentUser.username) {
            const existingUserWithUsername = await prisma.user.findUnique({
                where: { username: username },
            });
            if (existingUserWithUsername && existingUserWithUsername.id !== currentUser.id) {
                return { 
                    errors: [{ path: ['username'], message: 'Username is already taken.' }],
                    error: "Validation failed.",
                    success: false 
                };
            }
        }

        // Update Prisma User (name, username) and Profile (other fields)
        const updatedUser = await prisma.user.update({
          where: { supabaseAuthUserId: authUser.id },
          data: {
            name,
            username,
            profile: {
              upsert: { // Create profile if it doesn't exist, update if it does
                create: {
                  certifications,
                  location,
                  phone,
                },
                update: {
                  certifications,
                  location,
                  phone,
                },
              },
            },
          },
          select: { // Select fields to return for immediate UI update
            name: true,
            username: true,
            profile: {
                select: {
                    certifications: true,
                    location: true,
                    phone: true
                }
            }
          }
        });
        
        revalidatePath('/profile/edit'); // Revalidate the edit page
        revalidatePath(`/trainer/${updatedUser.username}`); // Revalidate public profile

        return { 
          success: true, 
          message: "Core information updated successfully!",
          updatedFields: {
            name: updatedUser.name,
            username: updatedUser.username,
            certifications: updatedUser.profile?.certifications,
            location: updatedUser.profile?.location,
            phone: updatedUser.profile?.phone,
          }
        };

      } catch (e: any) {
        console.error("Error updating core info:", e);
        if (e.code === 'P2002' && e.meta?.target?.includes('username')) {
             return { 
                errors: [{ path: ['username'], message: 'Username is already taken.' }],
                error: "Validation failed.",
                success: false 
            };
        }
        return { error: "Failed to update profile. " + (e.message || ""), success: false };
      }
    }
    ```
2.  **Create `src/components/profile/sections/CoreInfoEditor.tsx`:**
    *   This client component will fetch the current user's core info (name from `User` model, username from `User` model, rest from `Profile` model).
    *   It will use `useFormState` to handle the form submission with the `updateCoreInfo` server action.
    *   Display form fields for Name, Username, Certifications, Location, Phone.
    *   Use the reusable UI components (`Input`, `Label`, `Button`).
    ```tsx
    // src/components/profile/sections/CoreInfoEditor.tsx
    "use client";

    import React, { useEffect, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { updateCoreInfo } from '@/app/profile/actions'; // Adjust path
    import { Input } from '@/components/ui/Input';
    import { Label } from '@/components/ui/Label';
    import { Button } from '@/components/ui/Button';

    interface CoreInfoData {
      name: string;
      username: string;
      certifications: string | null;
      location: string | null;
      phone: string | null;
    }
    
    interface CoreInfoFormState {
        message?: string | null;
        error?: string | null;
        errors?: { path: (string | number)[]; message: string }[]; // For Zod issues
        success?: boolean;
        updatedFields?: Partial<CoreInfoData>;
    }
    
    const initialState: CoreInfoFormState = {
      message: null,
      error: null,
      errors: undefined,
      success: false,
    };

    // This function would ideally be a server action itself to fetch initial data
    // For simplicity in this step, we'll assume data is fetched and passed as a prop or context
    // For a real app, this component would likely be a server component initially,
    // or fetch data in a useEffect hook if it must be a client component.
    // Let's simulate fetching data on mount for this example.
    
    async function fetchInitialData(): Promise<CoreInfoData | null> {
        // This is a placeholder. In a real app, you'd call a server action
        // or an API route that uses prisma and supabase to get the current user's data.
        // For now, we can't directly call server-side prisma from this client component.
        // Supabase client-side auth can get email, but not Prisma data without an API endpoint/server action.
        console.warn("fetchInitialData is a placeholder and needs a server-side implementation.");
        // Example structure of what it might return:
        // const response = await fetch('/api/profile/core-info');
        // if (!response.ok) return null;
        // return response.json();
        return null; // No actual data fetching here for now.
    }


    function SubmitButton() {
      const { pending } = useFormStatus();
      return (
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Save Core Info'}
        </Button>
      );
    }

    export default function CoreInfoEditor() {
      const [state, formAction] = useFormState(updateCoreInfo, initialState);
      const [formData, setFormData] = useState<CoreInfoData>({
        name: '', username: '', certifications: '', location: '', phone: ''
      });
      const [isLoading, setIsLoading] = useState(true); // For initial data load

      // Simulate fetching initial data for the form
      // In a real app, this data should come from a server component prop or a dedicated server action call.
      useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            // const initialData = await fetchInitialData(); // This won't work directly
            // For now, we'll prompt the user or leave fields blank.
            // A proper way is to have this component receive initialData as a prop from a Server Component parent.
            // Or, call a server action via a button/useEffect to load data.
            // For this task, we'll assume fields start blank and are populated by user or on successful update.

            // A better approach: the PARENT component that renders ProfileEditorLayout
            // (e.g., /profile/edit/page.tsx if it were a server component) would fetch this.
            // Since ProfileEditorLayout is client, it's tricky.
            // For now, we'll just log a warning.
            console.warn("CoreInfoEditor: Initial data loading should be handled by a server component parent or a dedicated server action.");
            setIsLoading(false);
        }
        loadData();
      }, []);
      
      // Update local form data if server action returns updated fields
      useEffect(() => {
        if (state.success && state.updatedFields) {
          setFormData(prev => ({ ...prev, ...state.updatedFields as CoreInfoData }));
        }
      }, [state.success, state.updatedFields]);


      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
      
      const getFieldError = (fieldName: keyof CoreInfoData) => {
        return state.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };


      if (isLoading) {
        return <div className="p-6 bg-white shadow-sm rounded-lg">Loading core info...</div>;
      }

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Core Information</h3>
          
          {state.success && state.message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
              {state.message}
            </div>
          )}
          {state.error && (
             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" required 
                     value={formData.name} onChange={handleInputChange}
                     className="mt-1" />
              {getFieldError('name') && <p className="text-red-500 text-xs mt-1">{getFieldError('name')}</p>}
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" required 
                     value={formData.username} onChange={handleInputChange}
                     className="mt-1" />
              {getFieldError('username') && <p className="text-red-500 text-xs mt-1">{getFieldError('username')}</p>}
              <p className="mt-1 text-xs text-gray-500">Used for your public profile URL. Lowercase letters, numbers, and hyphens only.</p>
            </div>
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input id="certifications" name="certifications" type="text" 
                     value={formData.certifications || ''} onChange={handleInputChange}
                     className="mt-1" placeholder="e.g., NASM CPT, CPR/AED" />
              {getFieldError('certifications') && <p className="text-red-500 text-xs mt-1">{getFieldError('certifications')}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" type="text" 
                     value={formData.location || ''} onChange={handleInputChange}
                     className="mt-1" placeholder="e.g., New York, NY or Remote" />
              {getFieldError('location') && <p className="text-red-500 text-xs mt-1">{getFieldError('location')}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" type="tel" 
                     value={formData.phone || ''} onChange={handleInputChange}
                     className="mt-1" placeholder="e.g., (555) 123-4567" />
              {getFieldError('phone') && <p className="text-red-500 text-xs mt-1">{getFieldError('phone')}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      );
    }
    ```
    *   **Note on Initial Data Loading for `CoreInfoEditor`:** The above `CoreInfoEditor` is a client component. Fetching initial data directly within it using server-side logic (like Prisma) is not straightforward. A more robust solution involves its parent (`ProfileEditorLayout` or the page `src/app/profile/edit/page.tsx`) being a Server Component that fetches this data and passes it as a prop. For now, the `useEffect` in `CoreInfoEditor` simulates this challenge and suggests fields might start blank. The user will need to manually fill them, or a subsequent TODO can address passing initial data. The `updateCoreInfo` action *does* return updated fields, which `CoreInfoEditor` uses to update its local state.
3.  Ensure `src/components/profile/ProfileEditorLayout.tsx` correctly imports and uses `CoreInfoEditor`. (The provided `ProfileEditorLayout` already uses `React.lazy` for `CoreInfoEditor`). You'll need to create the directory `src/components/profile/sections/` and place `CoreInfoEditor.tsx` there.
Expected Outcome: The "Core Info" section in the profile editor is functional, allowing trainers to update their name, username, certifications, location, and phone. Validation errors and success messages are displayed.
Best Practice Reminders: Server actions for mutations are a key Next.js App Router feature. Validate data on the server using Zod. Ensure username uniqueness check is robust. `revalidatePath` is crucial for updating cached data on related pages.

**TODO #38:**
Objective: Create editor components for "About Me", "Philosophy", and "Methodology" (rich text).
File(s) To Create/Modify:
*   `src/components/ui/RichTextEditor.tsx` (new - a simple wrapper for a rich text library or a textarea for now)
*   `src/components/profile/sections/AboutMeEditor.tsx` (new)
*   `src/components/profile/sections/PhilosophyEditor.tsx` (new)
*   `src/components/profile/sections/MethodologyEditor.tsx` (new)
*   Modify `src/app/profile/actions.ts` (add update actions for these fields).
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor components).
Specific Instructions:
1.  **Create `src/components/ui/RichTextEditor.tsx`:**
    *   For MVP, this can be a simple styled `Textarea`. A proper rich text editor (like Tiptap, Quill, Lexical, or even a simple Markdown editor) would be a future enhancement.
    ```tsx
    // src/components/ui/RichTextEditor.tsx
    "use client"; // If using client-side state for a library

    import React, { TextareaHTMLAttributes } from 'react';
    import { Textarea } from './Textarea'; // Use your existing Textarea component

    interface RichTextEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
      label: string;
      initialValue?: string;
      // Add more props if integrating a real library
    }

    // For MVP, this is just a styled textarea.
    // In a real app, you'd integrate a proper rich text editor library here.
    const RichTextEditor = React.forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
      ({ label, initialValue, name, id, className, ...props }, ref) => {
        return (
          <div>
            <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <Textarea
              id={id || name}
              name={name}
              defaultValue={initialValue} // Use defaultValue for uncontrolled or manage state
              rows={8} // Default rows
              className={`mt-1 ${className || ''}`}
              ref={ref}
              {...props}
            />
            <p className="mt-1 text-xs text-gray-500">
              Basic text input for now. Rich text features (bold, italics, lists) will be added later.
              For now, you can use simple line breaks.
            </p>
          </div>
        );
      }
    );
    RichTextEditor.displayName = 'RichTextEditor';
    export { RichTextEditor };
    ```
2.  **Create Server Actions in `src/app/profile/actions.ts` for each field:**
    *   `updateAboutMe`, `updatePhilosophy`, `updateMethodology`.
    *   Each action takes `content: string` (or `content: string | null`).
    *   Validate input (e.g., max length, disallow harmful HTML if not sanitizing on display - for now, assume text or simple HTML that will be sanitized on display or is trusted). For MVP, simple string validation is fine.
    *   Update the corresponding field in the `Profile` model.
    *   Use Prisma and Supabase for auth.
    *   Return success/error state.
    *   `revalidatePath` after update.
    Example for `updateAboutMe`:
    ```typescript
    // Add to src/app/profile/actions.ts

    const textContentSchema = z.string().max(65535, "Content is too long.").nullable().optional();

    interface TextContentFormState {
      message?: string | null;
      error?: string | null;
      success?: boolean;
      updatedContent?: string | null;
    }
    
    async function updateProfileTextField(
        fieldName: 'aboutMe' | 'philosophy' | 'methodology',
        content: string | null,
        successMessage: string
    ): Promise<TextContentFormState> {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return { error: "User not authenticated.", success: false };
        }

        const validatedContent = textContentSchema.safeParse(content);
        if (!validatedContent.success) {
            return { error: validatedContent.error.issues.map(i => i.message).join(', '), success: false };
        }

        try {
            const updatedProfile = await prisma.profile.update({
                where: { userId: authUser.id }, // Assuming profile exists, or handle upsert
                data: {
                    [fieldName]: validatedContent.data,
                },
                select: { [fieldName]: true }
            });

            revalidatePath('/profile/edit');
            // Also revalidate public profile if these fields are shown there
            // const dbUser = await prisma.user.findUnique({ where: { supabaseAuthUserId: authUser.id }, select: { username: true } });
            // if (dbUser?.username) revalidatePath(`/trainer/${dbUser.username}`);
            
            return { success: true, message: successMessage, updatedContent: updatedProfile[fieldName] as string | null };
        } catch (e: any) {
            console.error(`Error updating ${fieldName}:`, e);
            return { error: `Failed to update ${fieldName}. ` + (e.message || ""), success: false };
        }
    }

    export async function updateAboutMe(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
        return updateProfileTextField('aboutMe', formData.get('aboutMeContent') as string | null, 'About Me section updated successfully!');
    }

    export async function updatePhilosophy(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
        return updateProfileTextField('philosophy', formData.get('philosophyContent') as string | null, 'Philosophy section updated successfully!');
    }

    export async function updateMethodology(prevState: TextContentFormState | undefined, formData: FormData): Promise<TextContentFormState> {
        return updateProfileTextField('methodology', formData.get('methodologyContent') as string | null, 'Methodology section updated successfully!');
    }
    ```
3.  **Create Editor Components (e.g., `src/components/profile/sections/AboutMeEditor.tsx`):**
    *   Each will be a client component.
    *   Fetch initial content (similar challenge to `CoreInfoEditor` - will pass as prop for now).
    *   Use `RichTextEditor` (our simple textarea wrapper).
    *   Use `useFormState` and the corresponding server action.
    *   Display success/error messages.
    Example for `AboutMeEditor.tsx` (PhilosophyEditor and MethodologyEditor will be very similar):
    ```tsx
    // src/components/profile/sections/AboutMeEditor.tsx
    "use client";

    import React, { useEffect, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { updateAboutMe } from '@/app/profile/actions';
    import { RichTextEditor } from '@/components/ui/RichTextEditor';
    import { Button } from '@/components/ui/Button';

    interface TextContentFormState {
      message?: string | null;
      error?: string | null;
      success?: boolean;
      updatedContent?: string | null;
    }

    const initialState: TextContentFormState = { /* ... */ };

    interface AboutMeEditorProps {
      initialAboutMe: string | null; // Passed from parent server component
    }
    
    function SubmitButton() {
      const { pending } = useFormStatus();
      return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save About Me'}</Button>;
    }

    export default function AboutMeEditor({ initialAboutMe }: AboutMeEditorProps) {
      const [state, formAction] = useFormState(updateAboutMe, initialState);
      const [content, setContent] = useState(initialAboutMe || '');

      useEffect(() => {
        if (state.success && typeof state.updatedContent === 'string') {
          setContent(state.updatedContent);
        } else if (state.success && state.updatedContent === null) {
          setContent('');
        }
      }, [state.success, state.updatedContent]);

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About Me</h3>
          {state.success && state.message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{state.message}</div>
          )}
          {state.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{state.error}</div>
          )}
          <form action={formAction}>
            <RichTextEditor
              label="Edit Content"
              name="aboutMeContent"
              initialValue={content} // Or value={content} onChange={e => setContent(e.target.value)} for controlled
              // If using defaultValue, the component will be uncontrolled by React state after initial render for the textarea itself
              // but the server action will use the submitted form data.
              // For simplicity with form reset and reflecting server updates, defaultValue is okay here.
            />
            <div className="flex justify-end mt-4">
              <SubmitButton />
            </div>
          </form>
        </div>
      );
    }
    ```
    *   Create similar `PhilosophyEditor.tsx` and `MethodologyEditor.tsx`, using `updatePhilosophy` and `updateMethodology` actions respectively, and taking `initialPhilosophy` and `initialMethodology` as props.
4.  **Integrate into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Import the new editor components (e.g., `AboutMeEditor`, `PhilosophyEditor`, `MethodologyEditor`).
    *   Update the `sectionComponents` mapping to use these.
    *   The `AboutDetailsEditor` placeholder can be replaced by a component that renders these three editors.
    ```tsx
    // Modify src/components/profile/ProfileEditorLayout.tsx

    // ... other imports ...
    // const AboutDetailsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">About & Details Editor Content</div>; // Remove old placeholder
    
    // Import new section editors (assuming they are created with props for initial data)
    const AboutMeEditor = React.lazy(() => import('./sections/AboutMeEditor'));
    const PhilosophyEditor = React.lazy(() => import('./sections/PhilosophyEditor'));
    const MethodologyEditor = React.lazy(() => import('./sections/MethodologyEditor'));
    
    // This component will fetch data and pass it to the individual editors
    const AboutDetailsSection = () => {
        // In a real app, this data would be fetched server-side and passed down
        // For now, we'll pass null or empty strings as initial values
        // This requires AboutMeEditor etc. to handle these props.
        const [initialData, setInitialData] = useState<{aboutMe: string|null, philosophy: string|null, methodology: string|null} | null>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            // Placeholder: simulate fetching data or make a server action call here
            // async function fetchData() {
            //   const data = await someServerActionToGetProfileDetails();
            //   setInitialData(data);
            //   setLoading(false);
            // }
            // fetchData();
            console.warn("AboutDetailsSection: Initial data loading needs to be implemented via server action call from a parent or this component if it becomes async.");
            // For now, using placeholders:
            setInitialData({ aboutMe: "", philosophy: "", methodology: "" });
            setLoading(false);
        }, []);

        if (loading || !initialData) return <SectionLoadingFallback />;

        return (
            <div className="space-y-6">
                <AboutMeEditor initialAboutMe={initialData.aboutMe} />
                <PhilosophyEditor initialPhilosophy={initialData.philosophy} />
                <MethodologyEditor initialMethodology={initialData.methodology} />
            </div>
        );
    };
    
    const sectionComponents: { [key: string]: React.ComponentType<any> } = {
      'core-info': CoreInfoEditor,
      'branding': BrandingEditor, // Placeholder
      'benefits': BenefitsEditor, // Placeholder
      'about-details': AboutDetailsSection, // Use the new wrapper
      'services': ServicesEditor, // Placeholder
      'photos': PhotosEditor, // Placeholder
      'testimonials': TestimonialsEditor, // Placeholder
      'links': LinksEditor, // Placeholder
    };
    // ... rest of ProfileEditorLayout.tsx
    ```
    *   **Important Note on Data Fetching for Rich Text Editors:** Similar to `CoreInfoEditor`, these client components need initial data. The `AboutDetailsSection` above is a placeholder strategy. The ideal way is for the page component (`/profile/edit/page.tsx`) to be a Server Component, fetch all profile data, and pass it down to `ProfileEditorLayout`, which then passes relevant parts to each section editor. This will be addressed in a refactoring step if not immediately. For now, they might start with empty or hardcoded initial values if the fetching strategy within the client component is not implemented. The server actions _will_ update the database correctly.
Expected Outcome: Trainers can edit their "About Me", "Philosophy", and "Methodology" sections using basic text areas. Changes are saved via server actions.
Best Practice Reminders: Use a generic `updateProfileTextField` helper in actions.ts to keep code DRY. Plan for actual rich text editor integration in the future (Trix, TipTap, etc.).

---

Please have @roo start with TODO #36. Let me know when these tasks are completed.
The data fetching strategy for client components needing initial state from the DB (like the editors) is a known challenge with the App Router if not structured carefully. We're using placeholders for now and will refine if needed. The primary goal is to get the form submission via Server Actions working.