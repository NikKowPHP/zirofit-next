**Phase 5 Refinement & Start of Phase 6**

**TODO #39: Refactor Profile Editor for Server-Side Initial Data Fetching**
Objective: Modify the profile editor page structure to fetch initial profile data on the server and pass it down to client components.
File(s) To Create/Modify:
*   `src/app/profile/edit/page.tsx` (major change)
*   `src/components/profile/ProfileEditorLayout.tsx` (modify props)
*   `src/components/profile/sections/CoreInfoEditor.tsx` (modify props, remove internal fetch simulation)
*   `src/components/profile/sections/AboutMeEditor.tsx` (modify props, remove internal fetch simulation)
*   `src/components/profile/sections/PhilosophyEditor.tsx` (modify props, remove internal fetch simulation)
*   `src/components/profile/sections/MethodologyEditor.tsx` (modify props, remove internal fetch simulation)
*   `src/app/profile/actions.ts` (add a new action to get profile data)
Specific Instructions:
1.  **Create a Server Action in `src/app/profile/actions.ts` to get the current user's profile data:**
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)

    export async function getCurrentUserProfileData() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // This should ideally not be reached if middleware protects the route
        return null;
      }

      try {
        const userWithProfile = await prisma.user.findUnique({
          where: { supabaseAuthUserId: authUser.id },
          select: {
            name: true,
            username: true,
            email: true, // For display, not editing here
            profile: {
              select: {
                id: true,
                certifications: true,
                location: true,
                phone: true,
                aboutMe: true,
                philosophy: true,
                methodology: true,
                bannerImagePath: true,
                profilePhotoPath: true,
                // We'll add relations like services, benefits etc. later when their editors are built
              },
            },
          },
        });

        if (!userWithProfile) {
          return null; // Or throw an error / return specific state
        }
        
        // Ensure profile is at least an empty object if it doesn't exist,
        // or handle its creation if User exists but Profile doesn't.
        // For now, assuming User and Profile are created on registration or first update attempt.
        // The upsert logic in updateCoreInfo handles profile creation.

        return {
          name: userWithProfile.name,
          username: userWithProfile.username,
          email: userWithProfile.email,
          profile: userWithProfile.profile || { // Provide default structure if profile is null
              id: '', // This might need a proper default or handling if profile is truly null
              certifications: null,
              location: null,
              phone: null,
              aboutMe: null,
              philosophy: null,
              methodology: null,
              bannerImagePath: null,
              profilePhotoPath: null,
          },
        };
      } catch (error) {
        console.error("Error fetching profile data:", error);
        return null; // Or return an error state
      }
    }
    ```
2.  **Modify `src/app/profile/edit/page.tsx` to be an `async` Server Component:**
    *   Fetch the profile data using `getCurrentUserProfileData`.
    *   Pass the fetched data to `ProfileEditorLayout`.
    ```tsx
    // src/app/profile/edit/page.tsx
    import ProfileEditorLayout from '@/components/profile/ProfileEditorLayout';
    import { getCurrentUserProfileData } from '@/app/profile/actions';
    import { redirect } from 'next/navigation';

    export default async function EditProfilePage() {
      const initialProfileData = await getCurrentUserProfileData();

      if (!initialProfileData) {
        // Handle case where user or profile data couldn't be fetched
        // This could be a redirect to login or an error message page
        // Assuming middleware handles auth, this might mean a DB issue or new user without profile yet.
        // For now, a simple error or redirect. Let's redirect to dashboard for simplicity.
        // Or show an error message component.
        console.error("EditProfilePage: Failed to load initial profile data.");
        // Consider creating a default profile entry if user exists but profile doesn't, via an action call.
        // For now, redirect if something is critically wrong.
        return redirect('/dashboard?error=profile_load_failed'); 
      }

      return <ProfileEditorLayout initialData={initialProfileData} />;
    }
    ```
3.  **Modify `src/components/profile/ProfileEditorLayout.tsx` to accept `initialData` prop:**
    *   Pass the relevant parts of `initialData` to the respective section components.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    "use client";

    import React, { useState, Suspense, useEffect } from 'react';
    import ProfileEditorSidebar from './ProfileEditorSidebar';

    // Define a type for the initial data structure
    interface InitialProfileData {
      name: string;
      username: string;
      email: string; // If needed by any section
      profile: {
        id: string;
        certifications: string | null;
        location: string | null;
        phone: string | null;
        aboutMe: string | null;
        philosophy: string | null;
        methodology: string | null;
        // Add other profile fields as they get editors
      } | null; // Profile can be null if not yet created
    }

    interface ProfileEditorLayoutProps {
      initialData: InitialProfileData;
    }
    
    // Import section components
    const CoreInfoEditor = React.lazy(() => import('./sections/CoreInfoEditor'));
    const AboutMeEditor = React.lazy(() => import('./sections/AboutMeEditor'));
    const PhilosophyEditor = React.lazy(() => import('./sections/PhilosophyEditor'));
    const MethodologyEditor = React.lazy(() => import('./sections/MethodologyEditor'));

    // ... (placeholder components for Branding, Benefits, etc. remain for now)
    const BrandingEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Branding Editor Content</div>;
    const BenefitsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Benefits Editor Content</div>;
    const ServicesEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Services Editor Content</div>;
    const PhotosEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Photos Editor Content</div>;
    const TestimonialsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Testimonials Editor Content</div>;
    const LinksEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">External Links Editor Content</div>;
    
    const SectionLoadingFallback = () => <div className="p-6 bg-white shadow-sm rounded-lg">Loading section...</div>;

    export default function ProfileEditorLayout({ initialData }: ProfileEditorLayoutProps) {
      const [selectedSection, setSelectedSection] = useState('core-info');

      const handleSelectSection = (section: string) => {
        setSelectedSection(section);
      };
      
      // Wrapper for About/Philosophy/Methodology
      const AboutDetailsSection = () => (
        <div className="space-y-6">
          <AboutMeEditor initialAboutMe={initialData.profile?.aboutMe ?? null} />
          <PhilosophyEditor initialPhilosophy={initialData.profile?.philosophy ?? null} />
          <MethodologyEditor initialMethodology={initialData.profile?.methodology ?? null} />
        </div>
      );

      const sectionComponents: { [key: string]: React.ComponentType<any> } = {
        'core-info': () => <CoreInfoEditor initialData={{
            name: initialData.name,
            username: initialData.username,
            certifications: initialData.profile?.certifications ?? null,
            location: initialData.profile?.location ?? null,
            phone: initialData.profile?.phone ?? null,
        }} />,
        'branding': BrandingEditor,
        'benefits': BenefitsEditor,
        'about-details': AboutDetailsSection,
        'services': ServicesEditor,
        'photos': PhotosEditor,
        'testimonials': TestimonialsEditor,
        'links': LinksEditor,
      };

      const SelectedComponent = sectionComponents[selectedSection] || (() => <div className="p-6 bg-white shadow-sm rounded-lg">Select a section to edit.</div>);

      return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <ProfileEditorSidebar currentSection={selectedSection} onSelectSection={handleSelectSection} />
          <main className="w-full md:w-3/4 lg:w-4/5">
            <Suspense fallback={<SectionLoadingFallback />}>
              <SelectedComponent />
            </Suspense>
          </main>
        </div>
      );
    }
    ```
4.  **Modify `src/components/profile/sections/CoreInfoEditor.tsx`:**
    *   Accept `initialData` as a prop.
    *   Remove the internal `useEffect` for fetching/simulating data. Initialize `formData` state from the prop.
    ```tsx
    // src/components/profile/sections/CoreInfoEditor.tsx
    "use client";
    import React, { useEffect, useState } from 'react';
    // ... (other imports: useFormState, useFormStatus, updateCoreInfo, ui components, z) ...
    import { useFormState, useFormStatus } from 'react-dom';
    import { updateCoreInfo } from '@/app/profile/actions'; 
    import { Input } from '@/components/ui/Input';
    import { Label } from '@/components/ui/Label';
    import { Button } from '@/components/ui/Button';
    import { z } from 'zod';


    interface CoreInfoData {
      name: string;
      username: string;
      certifications: string | null;
      location: string | null;
      phone: string | null;
    }
    
    interface CoreInfoEditorProps {
      initialData: CoreInfoData;
    }

    interface CoreInfoFormState {
        message?: string | null;
        error?: string | null;
        errors?: z.ZodIssue[]; 
        success?: boolean;
        updatedFields?: Partial<CoreInfoData>;
    }
    
    const initialState: CoreInfoFormState = { /* ... */ };
    
    function SubmitButton() { /* ... */ }

    export default function CoreInfoEditor({ initialData }: CoreInfoEditorProps) {
      const [state, formAction] = useFormState(updateCoreInfo, initialState);
      // Initialize formData from prop
      const [formData, setFormData] = useState<CoreInfoData>(initialData);

      // Update local form data if server action returns updated fields
      useEffect(() => {
        if (state.success && state.updatedFields) {
          // Merge only the fields that were successfully updated by the server
          setFormData(prev => ({ 
            ...prev, 
            ...(state.updatedFields as Partial<CoreInfoData>) // Type assertion for safety
          }));
        }
      }, [state.success, state.updatedFields]);

      // Removed the simulated isLoading and fetchInitialData useEffect

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... */ };
      const getFieldError = (fieldName: keyof CoreInfoData) => { /* ... */ };

      // ... (rest of the JSX, using formData.name, formData.username etc. for input values)
      return (
        <div className="p-6 bg-white shadow-sm rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Core Information</h3>
          
          {state.success && state.message && ( /* ... */ )}
          {state.error && ( /* ... */ )}

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
5.  **Modify `AboutMeEditor`, `PhilosophyEditor`, `MethodologyEditor` similarly:**
    *   Accept `initialAboutMe`, `initialPhilosophy`, `initialMethodology` as props.
    *   Initialize their internal `content` state from these props.
    *   Remove internal `useEffect` for simulating data fetching.
    *   Update `content` state if the server action returns `updatedContent`.
Expected Outcome: The profile editor sections now receive their initial data correctly from the server. Client-side state is initialized with this data. Forms still submit via server actions.
Best Practice Reminders: This pattern (Server Component fetching data and passing to Client Components) is standard for the App Router. It ensures data is available on initial render and reduces client-side fetching complexities.









---
**Phase 6: Trainer Profile Editor - Collection-Based Sections (Services)**

We'll start with the "Services" section. The pattern for Testimonials, External Links, Benefits, and Photos will be similar.

**TODO #40: Services Editor - Component & Actions (Add, List, Initial Data)**
Objective: Create the UI and server actions for managing services (listing existing, adding new).
File(s) To Create/Modify:
*   `src/components/profile/sections/ServicesEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `addService` and modify `getCurrentUserProfileData` to include services)
Specific Instructions:
1.  **Modify `getCurrentUserProfileData` in `src/app/profile/actions.ts`:**
    *   Include `services` in the profile data selection.
    ```typescript
    // src/app/profile/actions.ts
    // ...
    export async function getCurrentUserProfileData() {
      // ... (authUser check) ...
      try {
        const userWithProfile = await prisma.user.findUnique({
          where: { supabaseAuthUserId: authUser.id },
          select: {
            // ... (existing selections: name, username, email)
            profile: {
              select: {
                // ... (existing profile selections)
                services: { // Add this
                  orderBy: { createdAt: 'asc' }
                },
              },
            },
          },
        });
        // ... (rest of the function, ensure new profile data structure is returned)
        // Update the return structure to include services:
        return {
          // ... (name, username, email)
          profile: userWithProfile.profile ? {
              ...userWithProfile.profile,
              services: userWithProfile.profile.services || [], // Ensure services is an array
          } : { /* default empty profile structure with services: [] */ }
        };
      } // ... (catch block)
    }
    ```
    *   Update the `InitialProfileData` interface in `src/components/profile/ProfileEditorLayout.tsx` to include `services: Array<{id: string, title: string, description: string}>`.
2.  **Add `addService` server action to `src/app/profile/actions.ts`:**
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)

    const serviceSchema = z.object({
      title: z.string().min(3, "Title must be at least 3 characters.").max(255),
      description: z.string().min(10, "Description must be at least 10 characters."),
    });

    interface ServiceFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newService?: { id: string; title: string; description: string; createdAt: Date };
    }

    export async function addService(prevState: ServiceFormState | undefined, formData: FormData): Promise<ServiceFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return { error: "User not authenticated.", success: false };
      }

      const validatedFields = serviceSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
      });

      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }

      const { title, description } = validatedFields.data;

      try {
        const profile = await prisma.profile.findUnique({
          where: { userId: authUser.id },
          select: { id: true }
        });

        if (!profile) {
          return { error: "Profile not found. Please complete core info first.", success: false };
        }

        const newService = await prisma.service.create({
          data: {
            profileId: profile.id,
            title,
            description,
          },
        });
        
        revalidatePath('/profile/edit'); // Revalidate to show the new service
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`); // Revalidate public profile

        return { success: true, message: "Service added successfully!", newService };

      } catch (e: any) {
        console.error("Error adding service:", e);
        return { error: "Failed to add service. " + (e.message || ""), success: false };
      }
    }
    ```
3.  **Create `src/components/profile/sections/ServicesEditor.tsx`:**
    *   This client component will receive `initialServices` as a prop.
    *   Display a form to add a new service (Title, Description). Use `useFormState` with `addService`.
    *   List existing services.
    *   Implement client-side state to optimistically add the new service to the list upon successful submission, or rely on re-fetch/re-prop-pass after `revalidatePath`. For MVP, re-prop-pass after revalidation is simpler.
    ```tsx
    // src/components/profile/sections/ServicesEditor.tsx
    "use client";

    import React, { useEffect, useRef, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { addService } from '@/app/profile/actions'; // Adjust path
    import { Input } from '@/components/ui/Input';
    import { Label } from '@/components/ui/Label';
    import { Textarea } from '@/components/ui/Textarea';
    import { Button } from '@/components/ui/Button';
    import { z } from 'zod';

    interface Service {
      id: string;
      title: string;
      description: string;
      // Add createdAt if needed for display
    }

    interface ServicesEditorProps {
      initialServices: Service[];
    }
    
    interface ServiceFormState {
        message?: string | null;
        error?: string | null;
        errors?: z.ZodIssue[];
        success?: boolean;
        newService?: Service;
    }

    const initialState: ServiceFormState = { /* ... */ };

    function AddServiceButton() {
      const { pending } = useFormStatus();
      return <Button type="submit" disabled={pending}>{pending ? 'Adding...' : 'Add Service'}</Button>;
    }

    export default function ServicesEditor({ initialServices }: ServicesEditorProps) {
      const [state, formAction] = useFormState(addService, initialState);
      const formRef = useRef<HTMLFormElement>(null);
      const [services, setServices] = useState<Service[]>(initialServices);

      useEffect(() => {
        if (state.success && state.newService) {
          setServices(currentServices => [state.newService!, ...currentServices]); // Optimistic update or reflect new prop
          formRef.current?.reset();
          // If not using optimistic update, you might need a mechanism to re-fetch or rely on parent re-render
        }
         // If initialServices prop changes (due to parent re-fetch after revalidatePath), update local state
        if (initialServices !== services && !state.success) { // Avoid overriding after optimistic update
             setServices(initialServices);
        }
      }, [state.success, state.newService, initialServices]);


      const getFieldError = (fieldName: 'title' | 'description') => {
        return state.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Services</h3>
            {state.success && state.message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{state.message}</div>
            )}
            {state.error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{state.error}</div>
            )}
            <form action={formAction} ref={formRef} className="space-y-4 border-b pb-6 mb-6">
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input id="title" name="title" type="text" required className="mt-1" />
                {getFieldError('title') && <p className="text-red-500 text-xs mt-1">{getFieldError('title')}</p>}
              </div>
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea id="description" name="description" rows={4} required className="mt-1" />
                {getFieldError('description') && <p className="text-red-500 text-xs mt-1">{getFieldError('description')}</p>}
              </div>
              <div className="flex justify-end">
                <AddServiceButton />
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Services</h4>
            {services.length === 0 ? (
              <p className="text-gray-500">You haven't added any services yet.</p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 border rounded-md">
                    <h5 className="font-semibold text-gray-800">{service.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{service.description}</p>
                    {/* Delete/Edit buttons will be added in a subsequent TODO */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
4.  **Integrate `ServicesEditor` into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Ensure `initialData` prop passed to `ProfileEditorLayout` includes `services`.
    *   Pass `initialData.profile?.services` to `ServicesEditor`.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    // ...
    const ServicesEditor = React.lazy(() => import('./sections/ServicesEditor'));
    // ... in sectionComponents map:
    // 'services': ServicesEditor, // This needs to pass props now
    'services': () => <ServicesEditor initialServices={initialData.profile?.services || []} />,
    // ...
    ```
Expected Outcome: The "Services" section in the profile editor allows adding new services. Existing services are listed. The initial list of services is populated from server-fetched data.
Best Practice Reminders: `revalidatePath` is key for data consistency after mutations. Consider optimistic updates for a smoother UX, but server-driven updates via revalidation are simpler to start.

**TODO #41: Services Editor - Delete Functionality**
Objective: Add the ability to delete services.
File(s) To Create/Modify:
*   `src/app/profile/actions.ts` (add `deleteService` action)
*   `src/components/profile/sections/ServicesEditor.tsx` (add delete buttons and handler)
Specific Instructions:
1.  **Add `deleteService` server action to `src/app/profile/actions.ts`:**
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions)

    interface DeleteFormState {
        message?: string | null;
        error?: string | null;
        success?: boolean;
        deletedId?: string;
    }

    export async function deleteService(serviceId: string): Promise<DeleteFormState> { // Can take ID directly if not using form
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return { error: "User not authenticated.", success: false };
      }

      try {
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { profile: { select: { userId: true } } }
        });

        if (!service || service.profile?.userId !== authUser.id) {
          return { error: "Service not found or you are not authorized to delete it.", success: false };
        }

        await prisma.service.delete({
          where: { id: serviceId },
        });
        
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

        return { success: true, message: "Service deleted successfully!", deletedId: serviceId };
      } catch (e: any) {
        console.error("Error deleting service:", e);
        return { error: "Failed to delete service. " + (e.message || ""), success: false };
      }
    }
    ```
2.  **Modify `src/components/profile/sections/ServicesEditor.tsx`:**
    *   Add a delete button next to each service in the list.
    *   Create a handler function `handleDeleteService` that calls the `deleteService` server action.
    *   Update client-side `services` state upon successful deletion.
    ```tsx
    // src/components/profile/sections/ServicesEditor.tsx
    // ... (imports, interfaces, existing component code) ...
    import { TrashIcon } from '@heroicons/react/24/outline'; // For delete button

    export default function ServicesEditor({ initialServices }: ServicesEditorProps) {
      // ... (existing state and formAction for add) ...
      const [services, setServices] = useState<Service[]>(initialServices);
      const [deleteError, setDeleteError] = useState<string | null>(null);
      const [deletingId, setDeletingId] = useState<string | null>(null);

      useEffect(() => {
        // ... (existing useEffect for addService state) ...
        // Update local services if initialServices prop changes
        if (initialServices !== services && !state.success) { // Avoid race condition with optimistic add
             setServices(initialServices);
        }
      }, [state.success, state.newService, initialServices]);


      const handleDeleteService = async (serviceId: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeletingId(serviceId);
        setDeleteError(null);
        const result = await deleteService(serviceId); // Call server action
        if (result.success && result.deletedId) {
          setServices(currentServices => currentServices.filter(s => s.id !== result.deletedId));
          // Optionally show a success toast/message
        } else if (result.error) {
          setDeleteError(result.error);
        }
        setDeletingId(null);
      };

      // ... (getFieldError, JSX for add form) ...

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          {/* ... (Add form and its messages) ... */}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>
          )}

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Services</h4>
            {services.length === 0 ? ( /* ... */ ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 border rounded-md flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-gray-800">{service.title}</h5>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{service.description}</p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      disabled={deletingId === service.id}
                      className="ml-4 flex-shrink-0"
                    >
                      <TrashIcon className="h-4 w-4 mr-1.5" />
                      {deletingId === service.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
Expected Outcome: Trainers can delete their services. The list updates optimistically or upon re-fetch after `revalidatePath`.
Best Practice Reminders: Always authorize delete operations on the server. Provide user confirmation before deletion.

**TODO #42: Services Editor - Edit Functionality (Part 1: Setup Edit State and Form)**
Objective: Set up the UI to toggle into an "edit mode" for a service, pre-filling a form.
File(s) To Create/Modify:
*   `src/components/profile/sections/ServicesEditor.tsx` (modify)
Specific Instructions:
1.  **Modify `src/components/profile/sections/ServicesEditor.tsx`:**
    *   Add state variables for `editingServiceId`, `editingTitle`, `editingDescription`.
    *   When an "Edit" button (to be added next to each service) is clicked, populate these state variables with the service's data and change the main form to "edit mode".
    *   The main form will now be used for both adding and editing. Change its submit handler and button text accordingly.
    *   Add a "Cancel Edit" button.
    ```tsx
    // src/components/profile/sections/ServicesEditor.tsx
    // ... (imports)
    import { PencilIcon } from '@heroicons/react/24/outline'; // For edit button

    export default function ServicesEditor({ initialServices }: ServicesEditorProps) {
      // ... (existing state for add form, services list) ...
      const [addServiceState, addServiceFormAction] = useFormState(addService, initialState);
      const addFormRef = useRef<HTMLFormElement>(null);
      const [services, setServices] = useState<Service[]>(initialServices);
      
      // State for editing
      const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
      const [editingTitle, setEditingTitle] = useState('');
      const [editingDescription, setEditingDescription] = useState('');
      
      // ... (useEffect for addServiceState) ...
      useEffect(() => {
        if (addServiceState.success && addServiceState.newService) {
          setServices(currentServices => [addServiceState.newService!, ...currentServices]);
          addFormRef.current?.reset();
        }
        if (initialServices !== services && !addServiceState.success && !editingServiceId) {
             setServices(initialServices);
        }
      }, [addServiceState.success, addServiceState.newService, initialServices, editingServiceId]); // Add editingServiceId to deps

      const handleEditClick = (service: Service) => {
        setEditingServiceId(service.id);
        setEditingTitle(service.title);
        setEditingDescription(service.description);
        // Clear add form errors/messages if any
        addFormRef.current?.reset(); // This won't clear useFormState, need to manage that if combining.
                                   // For now, separate forms or a more complex state management for the form is better.
                                   // Let's assume for now edit will use the same form, and we'll handle state reset.
      };

      const handleCancelEdit = () => {
        setEditingServiceId(null);
        setEditingTitle('');
        setEditingDescription('');
        // Clear any form errors related to editing if form state was shared
      };
      
      const isEditing = !!editingServiceId;

      // ... (getFieldError - might need adjustment if form state is shared for add/edit)
      // ... (handleDeleteService) ...

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? `Edit Service: ${editingTitle}` : 'Add New Service'}
            </h3>
            {/* Messages for ADD form */}
            {addServiceState.success && addServiceState.message && !isEditing && ( /* ... */ )}
            {addServiceState.error && !isEditing && ( /* ... */ )}
            {/* TODO: Add messages for EDIT form state later */}

            <form 
                action={isEditing ? /* updateServiceFormAction (to be created) */ addServiceFormAction : addServiceFormAction} 
                ref={addFormRef} // Will become editFormRef when editing
                className="space-y-4 border-b pb-6 mb-6"
                key={editingServiceId || 'add'} // Re-mount form on mode change to clear native input values
            >
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input 
                    id="title" name="title" type="text" required 
                    defaultValue={isEditing ? editingTitle : ''} // Use defaultValue for easy reset on mode change via key
                    className="mt-1" 
                />
                {/* Error display needs to adapt to edit/add state */}
              </div>
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea 
                    id="description" name="description" rows={4} required 
                    defaultValue={isEditing ? editingDescription : ''}
                    className="mt-1" 
                />
                 {/* Error display needs to adapt to edit/add state */}
              </div>
              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                )}
                <Button type="submit"> 
                  {isEditing ? 'Save Changes' : 'Add Service'}
                </Button>
                {/* We'll use a separate formStatus for edit if actions are different */}
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Services</h4>
            {/* ... (services list rendering) ... */}
            {services.map((service) => (
              <div key={service.id} className="p-4 border rounded-md flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-gray-800">{service.title}</h5>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{service.description}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => handleEditClick(service)} disabled={deletingId === service.id || isEditing}>
                        <PencilIcon className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteService(service.id)} /* ... */ >
                        <TrashIcon className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    ```
Expected Outcome: The Services editor UI now supports an "edit mode". Clicking "Edit" on a service populates the form with its data. The form submit button changes to "Save Changes". A "Cancel Edit" button appears. Actual update logic is next.
Best Practice Reminders: Using `key={editingServiceId || 'add'}` on the form can help reset its internal state when switching between add/edit modes if you use `defaultValue` on inputs.

**TODO #43: Services Editor - Update Functionality**
Objective: Implement the server action and client-side logic to update an existing service.
File(s) To Create/Modify:
*   `src/app/profile/actions.ts` (add `updateService` action)
*   `src/components/profile/sections/ServicesEditor.tsx` (modify form submission to call `updateService` when in edit mode)
Specific Instructions:
1.  **Add `updateService` server action to `src/app/profile/actions.ts`:**
    ```typescript
    // src/app/profile/actions.ts
    // ... (imports and other actions)

    interface UpdateServiceFormState extends ServiceFormState { // Can reuse or extend ServiceFormState
        updatedService?: { id: string; title: string; description: string };
    }

    export async function updateService(prevState: UpdateServiceFormState | undefined, formData: FormData): Promise<UpdateServiceFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return { error: "User not authenticated.", success: false };
      }
      
      const serviceId = formData.get('serviceId') as string; // Get serviceId from a hidden input
      if (!serviceId) {
        return { error: "Service ID is missing.", success: false };
      }

      const validatedFields = serviceSchema.safeParse({ // Reuse serviceSchema
        title: formData.get('title'),
        description: formData.get('description'),
      });

      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }

      const { title, description } = validatedFields.data;

      try {
        const serviceToUpdate = await prisma.service.findFirst({
          where: { 
            id: serviceId,
            profile: { userId: authUser.id } // Authorization check
          },
        });

        if (!serviceToUpdate) {
          return { error: "Service not found or you are not authorized to update it.", success: false };
        }

        const updatedService = await prisma.service.update({
          where: { id: serviceId },
          data: { title, description },
        });
        
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

        return { success: true, message: "Service updated successfully!", updatedService };

      } catch (e: any) {
        console.error("Error updating service:", e);
        return { error: "Failed to update service. " + (e.message || ""), success: false };
      }
    }
    ```
2.  **Modify `src/components/profile/sections/ServicesEditor.tsx`:**
    *   Import `updateService` action.
    *   Create a new `useFormState` hook for the update action: `[updateServiceState, updateServiceFormAction] = useFormState(updateService, initialUpdateState);`
    *   Conditionally use `addServiceFormAction` or `updateServiceFormAction` for the form's `action` prop.
    *   Add a hidden input `<input type="hidden" name="serviceId" value={editingServiceId} />` to the form when in edit mode.
    *   Handle the `updateServiceState` to update the `services` list locally and clear edit mode on success.
    ```tsx
    // src/components/profile/sections/ServicesEditor.tsx
    // ... (imports: add updateService) ...
    import { addService, updateService } from '@/app/profile/actions';

    // ... (Service interface, ServicesEditorProps) ...
    
    // Define separate initial states if their structure differs, or ensure they are compatible.
    const initialAddState: ServiceFormState = { /* ... */ };
    const initialUpdateState: UpdateServiceFormState = { /* ... */ }; // UpdateServiceFormState is defined in actions.ts

    export default function ServicesEditor({ initialServices }: ServicesEditorProps) {
      const [addState, addFormAction] = useFormState(addService, initialAddState);
      const [updateState, updateFormAction] = useFormState(updateService, initialUpdateState);
      const formRef = useRef<HTMLFormElement>(null); // Keep for add form, or a general form ref
      const [services, setServices] = useState<Service[]>(initialServices);
      
      const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
      // No need for editingTitle, editingDescription state if using defaultValue on keyed form

      // ... (useEffect for addState) ...
      useEffect(() => {
        if (addState.success && addState.newService) {
          setServices(currentServices => [addState.newService!, ...currentServices].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ) ); // Sort if needed
          formRef.current?.reset();
        }
      }, [addState.success, addState.newService]);

      // useEffect for updateState
      useEffect(() => {
        if (updateState.success && updateState.updatedService) {
          setServices(currentServices => 
            currentServices.map(s => s.id === updateState.updatedService!.id ? updateState.updatedService! : s)
          );
          handleCancelEdit(); // Exit edit mode
        }
      }, [updateState.success, updateState.updatedService]);
      
      // Consolidate common initial services loading
       useEffect(() => {
        if (initialServices !== services && !addState.success && !updateState.success && !editingServiceId) {
             setServices(initialServices);
        }
      }, [initialServices, addState.success, updateState.success, editingServiceId]);


      const handleEditClick = (service: Service) => {
        setEditingServiceId(service.id);
        // Form inputs will be keyed and use defaultValue, so direct state for title/desc not strictly needed here.
        // Clear add form specific messages if any
        // formRef.current?.reset(); // This clears the whole form; keying the form is better.
      };

      const handleCancelEdit = () => {
        setEditingServiceId(null);
      };
      
      const isEditing = !!editingServiceId;
      
      // Determine current form state based on mode
      const currentFormState = isEditing ? updateState : addState;
      const getFieldError = (fieldName: 'title' | 'description') => {
        return currentFormState.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };

      // ... (handleDeleteService) ...

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? `Edit Service` : 'Add New Service'}
            </h3>
            {currentFormState.success && currentFormState.message && ( /* ... display message ... */ )}
            {currentFormState.error && ( /* ... display error ... */ )}

            <form 
                action={isEditing ? updateFormAction : addFormAction} 
                key={editingServiceId || 'add'} // Re-mounts form on mode change, resetting uncontrolled inputs
                className="space-y-4 border-b pb-6 mb-6"
            >
              {isEditing && <input type="hidden" name="serviceId" value={editingServiceId} />}
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input 
                    id="title" name="title" type="text" required 
                    defaultValue={isEditing ? services.find(s => s.id === editingServiceId)?.title : ''}
                    className="mt-1" 
                />
                {getFieldError('title') && <p className="text-red-500 text-xs mt-1">{getFieldError('title')}</p>}
              </div>
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea 
                    id="description" name="description" rows={4} required 
                    defaultValue={isEditing ? services.find(s => s.id === editingServiceId)?.description : ''}
                    className="mt-1" 
                />
                 {getFieldError('description') && <p className="text-red-500 text-xs mt-1">{getFieldError('description')}</p>}
              </div>
              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                )}
                <Button type="submit"> 
                  {isEditing 
                    ? (useFormStatus().pending ? 'Saving...' : 'Save Changes') 
                    : (useFormStatus().pending ? 'Adding...' : 'Add Service')}
                </Button>
              </div>
            </form>
          </div>
          {/* ... (Services list rendering with Edit and Delete buttons) ... */}
           <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Services</h4>
            {services.length === 0 ? (
              <p className="text-gray-500">You haven't added any services yet.</p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 border rounded-md flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-gray-800">{service.title}</h5>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{service.description}</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                        <Button variant="secondary" size="sm" onClick={() => handleEditClick(service)} disabled={deletingId === service.id || (isEditing && editingServiceId === service.id) }>
                            <PencilIcon className="h-4 w-4 mr-1.5" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteService(service.id)} disabled={deletingId === service.id}>
                            <TrashIcon className="h-4 w-4 mr-1.5" /> {deletingId === service.id ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
Expected Outcome: Trainers can now fully CRUD their services. The edit form pre-fills correctly, and submissions update the existing service.
Best Practice Reminders: Ensure the `updateService` action correctly authorizes that the user owns the service being updated. `key`ing the form on `editingServiceId` is a good way to ensure it resets when switching between add/edit or different items to edit.

---

Please have @roo start with TODO #39.
Let me know when these tasks are completed.