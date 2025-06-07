

**Phase 6: Trainer Profile Editor - Collection-Based Sections (Continued)**

**TODO #44: Testimonials Editor - Component & Actions (Add, List, Initial Data)**
Objective: Create the UI and server actions for managing testimonials (listing existing, adding new).
File(s) To Create/Modify:
*   `src/components/profile/sections/TestimonialsEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `addTestimonial` and modify `getCurrentUserProfileData` to include testimonials)
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor component).
Specific Instructions:
1.  **Modify `getCurrentUserProfileData` in `src/app/profile/actions.ts`:**
    *   Include `testimonials` in the profile data selection, ordered by `createdAt` descending.
    ```typescript
    // src/app/profile/actions.ts
    // ... (inside getCurrentUserProfileData, in profile select block)
    // ...
    profile: {
      select: {
        // ... (existing selections: id, certifications, ..., services)
        testimonials: { // Add this
          orderBy: { createdAt: 'desc' }
        },
      },
    },
    // ...
    // Ensure the return type and default structure in InitialProfileData include testimonials
    // Example for default structure: testimonials: []
    ```
    *   Update the `InitialProfileData` interface in `src/components/profile/ProfileEditorLayout.tsx` to include `testimonials: Array<{id: string, clientName: string, testimonialText: string, createdAt: Date}>`.
2.  **Add `addTestimonial` server action to `src/app/profile/actions.ts`:**
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)

    const testimonialSchema = z.object({
      clientName: z.string().min(2, "Client name is required.").max(255),
      testimonialText: z.string().min(10, "Testimonial text must be at least 10 characters."),
    });

    interface TestimonialFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newTestimonial?: { id: string; clientName: string; testimonialText: string; createdAt: Date };
    }

    export async function addTestimonial(prevState: TestimonialFormState | undefined, formData: FormData): Promise<TestimonialFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return { error: "User not authenticated.", success: false };
      }

      const validatedFields = testimonialSchema.safeParse({
        clientName: formData.get('clientName'),
        testimonialText: formData.get('testimonialText'),
      });

      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }

      const { clientName, testimonialText } = validatedFields.data;

      try {
        const profile = await prisma.profile.findUnique({
          where: { userId: authUser.id },
          select: { id: true }
        });

        if (!profile) {
          return { error: "Profile not found. Please complete core info first.", success: false };
        }

        const newTestimonial = await prisma.testimonial.create({
          data: {
            profileId: profile.id,
            clientName,
            testimonialText,
          },
        });
        
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

        return { success: true, message: "Testimonial added successfully!", newTestimonial };

      } catch (e: any) {
        console.error("Error adding testimonial:", e);
        return { error: "Failed to add testimonial. " + (e.message || ""), success: false };
      }
    }
    ```
3.  **Create `src/components/profile/sections/TestimonialsEditor.tsx`:**
    *   Client component, receives `initialTestimonials` prop.
    *   Form for "Client Name" and "Testimonial Text".
    *   Uses `useFormState` with `addTestimonial` action.
    *   Lists existing testimonials.
    ```tsx
    // src/components/profile/sections/TestimonialsEditor.tsx
    "use client";

    import React, { useEffect, useRef, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { addTestimonial } from '@/app/profile/actions';
    import { Input, Label, Textarea, Button } from '@/components/ui'; // Assuming barrel export from ui
    import { z } from 'zod';

    interface Testimonial {
      id: string;
      clientName: string;
      testimonialText: string;
      createdAt: Date;
    }

    interface TestimonialsEditorProps {
      initialTestimonials: Testimonial[];
    }
    
    interface TestimonialFormState {
        message?: string | null;
        error?: string | null;
        errors?: z.ZodIssue[];
        success?: boolean;
        newTestimonial?: Testimonial;
    }

    const initialState: TestimonialFormState = { /* ... */ };

    function AddTestimonialButton() {
      const { pending } = useFormStatus();
      return <Button type="submit" disabled={pending}>{pending ? 'Adding...' : 'Add Testimonial'}</Button>;
    }

    export default function TestimonialsEditor({ initialTestimonials }: TestimonialsEditorProps) {
      const [state, formAction] = useFormState(addTestimonial, initialState);
      const formRef = useRef<HTMLFormElement>(null);
      const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);

      useEffect(() => {
        if (state.success && state.newTestimonial) {
          setTestimonials(current => [state.newTestimonial!, ...current].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          formRef.current?.reset();
        }
        if (initialTestimonials !== testimonials && !state.success) {
             setTestimonials(initialTestimonials);
        }
      }, [state.success, state.newTestimonial, initialTestimonials]);

      const getFieldError = (fieldName: 'clientName' | 'testimonialText') => {
        return state.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Testimonials</h3>
            {state.success && state.message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{state.message}</div>
            )}
            {state.error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{state.error}</div>
            )}
            <form action={formAction} ref={formRef} className="space-y-4 border-b pb-6 mb-6">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" name="clientName" type="text" required className="mt-1" />
                {getFieldError('clientName') && <p className="text-red-500 text-xs mt-1">{getFieldError('clientName')}</p>}
              </div>
              <div>
                <Label htmlFor="testimonialText">Testimonial Text</Label>
                <Textarea id="testimonialText" name="testimonialText" rows={5} required className="mt-1" />
                {getFieldError('testimonialText') && <p className="text-red-500 text-xs mt-1">{getFieldError('testimonialText')}</p>}
              </div>
              <div className="flex justify-end">
                <AddTestimonialButton />
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Testimonials</h4>
            {testimonials.length === 0 ? (
              <p className="text-gray-500">No testimonials added yet.</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="p-4 border rounded-md">
                    <h5 className="font-semibold text-gray-800">{testimonial.clientName}</h5>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">"{testimonial.testimonialText}"</p>
                    {/* Delete/Edit buttons to be added next */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
4.  **Integrate `TestimonialsEditor` into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Ensure `initialData` prop includes `testimonials`.
    *   Pass `initialData.profile?.testimonials` to `TestimonialsEditor`.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    // ...
    const TestimonialsEditor = React.lazy(() => import('./sections/TestimonialsEditor'));
    // ... in sectionComponents map:
    'testimonials': () => <TestimonialsEditor initialTestimonials={initialData.profile?.testimonials || []} />,
    // ...
    ```
Expected Outcome: Trainers can add new testimonials. Existing ones are listed.
Best Practice Reminders: Keep form state handling consistent with other editor components.







**TODO #45: Testimonials Editor - Delete & Edit Functionality**
Objective: Add delete and edit capabilities for testimonials.
File(s) To Create/Modify:
*   `src/app/profile/actions.ts` (add `deleteTestimonial`, `updateTestimonial` actions)
*   `src/components/profile/sections/TestimonialsEditor.tsx` (add UI and handlers for delete/edit)
Specific Instructions:
1.  **Add `deleteTestimonial` and `updateTestimonial` server actions to `src/app/profile/actions.ts`:**
    *   Follow the pattern used for `deleteService` and `updateService`.
    *   Ensure authorization: user must own the profile associated with the testimonial.
    *   `updateTestimonial` will take `testimonialId`, `clientName`, `testimonialText`.
    *   Use `testimonialSchema` for validation in `updateTestimonial`.
    ```typescript
    // src/app/profile/actions.ts
    // ... (addTestimonial and other actions) ...

    export async function deleteTestimonial(testimonialId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      try {
        const testimonial = await prisma.testimonial.findFirst({
          where: { id: testimonialId, profile: { userId: authUser.id } },
        });
        if (!testimonial) return { error: "Testimonial not found or not authorized.", success: false };

        await prisma.testimonial.delete({ where: { id: testimonialId } });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "Testimonial deleted.", deletedId: testimonialId };
      } catch (e: any) {
        return { error: "Failed to delete testimonial. " + e.message, success: false };
      }
    }

    interface UpdateTestimonialFormState extends TestimonialFormState {
        updatedTestimonial?: { id: string; clientName: string; testimonialText: string; createdAt: Date };
    }

    export async function updateTestimonial(prevState: UpdateTestimonialFormState | undefined, formData: FormData): Promise<UpdateTestimonialFormState> {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return { error: "User not authenticated.", success: false };

        const testimonialId = formData.get('testimonialId') as string;
        if (!testimonialId) return { error: "Testimonial ID missing.", success: false };

        const validatedFields = testimonialSchema.safeParse({
            clientName: formData.get('clientName'),
            testimonialText: formData.get('testimonialText'),
        });

        if (!validatedFields.success) {
            return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
        }
        const { clientName, testimonialText } = validatedFields.data;

        try {
            const testimonialToUpdate = await prisma.testimonial.findFirst({
                where: { id: testimonialId, profile: { userId: authUser.id } },
            });
            if (!testimonialToUpdate) return { error: "Testimonial not found or not authorized.", success: false };

            const updatedTestimonial = await prisma.testimonial.update({
                where: { id: testimonialId },
                data: { clientName, testimonialText },
            });
            revalidatePath('/profile/edit');
            revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
            return { success: true, message: "Testimonial updated.", updatedTestimonial };
        } catch (e: any) {
            return { error: "Failed to update testimonial. " + e.message, success: false };
        }
    }
    ```
2.  **Modify `src/components/profile/sections/TestimonialsEditor.tsx`:**
    *   Add Edit and Delete buttons for each listed testimonial.
    *   Implement `handleDeleteTestimonial` similar to `ServicesEditor`.
    *   Implement edit mode:
        *   State for `editingTestimonialId`, `editingClientName`, `editingTestimonialText`.
        *   When "Edit" is clicked, populate these states and change the main form to "edit mode".
        *   Form submits to `updateTestimonial` action when editing.
        *   "Cancel Edit" button.
    *   Use `PencilIcon` and `TrashIcon` from Heroicons.
    ```tsx
    // src/components/profile/sections/TestimonialsEditor.tsx
    "use client";
    // ... (imports: add PencilIcon, TrashIcon, deleteTestimonial, updateTestimonial)
    import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
    import { addTestimonial, deleteTestimonial, updateTestimonial } from '@/app/profile/actions';


    // ... (interfaces, initial states for add/update) ...
    const initialAddTestimonialState: TestimonialFormState = { /* ... */ };
    const initialUpdateTestimonialState: UpdateTestimonialFormState = { /* ... */ };


    export default function TestimonialsEditor({ initialTestimonials }: TestimonialsEditorProps) {
      const [addState, addFormAction] = useFormState(addTestimonial, initialAddTestimonialState);
      const [updateState, updateFormAction] = useFormState(updateTestimonial, initialUpdateTestimonialState);
      const formRef = useRef<HTMLFormElement>(null);
      const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);

      const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
      // Current values for the edit form will be derived from `testimonials.find(...)` or from `defaultValue` in inputs
      
      const [deleteError, setDeleteError] = useState<string | null>(null);
      const [deletingId, setDeletingId] = useState<string | null>(null);
      
      const isEditing = !!editingTestimonialId;
      const currentEditingTestimonial = isEditing ? testimonials.find(t => t.id === editingTestimonialId) : null;

      // Effect for add testimonial
      useEffect(() => {
        if (addState.success && addState.newTestimonial) {
          setTestimonials(current => [addState.newTestimonial!, ...current].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          formRef.current?.reset(); // Only reset if it was the add form submission
        }
      }, [addState.success, addState.newTestimonial]);

      // Effect for update testimonial
      useEffect(() => {
        if (updateState.success && updateState.updatedTestimonial) {
          setTestimonials(current => 
            current.map(t => t.id === updateState.updatedTestimonial!.id ? updateState.updatedTestimonial! : t)
                   .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
          handleCancelEdit();
        }
      }, [updateState.success, updateState.updatedTestimonial]);
      
      // Effect to sync with initial props (if not adding/editing/deleting)
      useEffect(() => {
        if (initialTestimonials !== testimonials && !addState.success && !updateState.success && !deletingId && !isEditing) {
             setTestimonials(initialTestimonials);
        }
      }, [initialTestimonials, addState.success, updateState.success, deletingId, isEditing]);


      const handleEditClick = (testimonial: Testimonial) => {
        setEditingTestimonialId(testimonial.id);
        // Form inputs will use defaultValue, keyed by editingTestimonialId
      };

      const handleCancelEdit = () => {
        setEditingTestimonialId(null);
      };

      const handleDeleteTestimonial = async (testimonialId: string) => {
        if (!window.confirm("Are you sure?")) return;
        setDeletingId(testimonialId);
        setDeleteError(null);
        const result = await deleteTestimonial(testimonialId);
        if (result.success && result.deletedId) {
          setTestimonials(current => current.filter(t => t.id !== result.deletedId));
        } else if (result.error) {
          setDeleteError(result.error);
        }
        setDeletingId(null);
      };
      
      const currentFormState = isEditing ? updateState : addState;
      const getFieldError = (fieldName: 'clientName' | 'testimonialText') => {
        return currentFormState.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };


      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? `Edit Testimonial from ${currentEditingTestimonial?.clientName}` : 'Add New Testimonial'}
            </h3>
            {currentFormState.success && currentFormState.message && ( /* ... */ )}
            {currentFormState.error && ( /* ... */ )}

            <form 
                action={isEditing ? updateFormAction : addFormAction} 
                key={editingTestimonialId || 'add-testimonial'} // Key to reset form when switching modes
                ref={formRef}
                className="space-y-4 border-b pb-6 mb-6"
            >
              {isEditing && <input type="hidden" name="testimonialId" value={editingTestimonialId} />}
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" name="clientName" type="text" required className="mt-1"
                       defaultValue={isEditing ? currentEditingTestimonial?.clientName : ''} />
                {getFieldError('clientName') && <p className="text-red-500 text-xs mt-1">{getFieldError('clientName')}</p>}
              </div>
              <div>
                <Label htmlFor="testimonialText">Testimonial Text</Label>
                <Textarea id="testimonialText" name="testimonialText" rows={5} required className="mt-1"
                          defaultValue={isEditing ? currentEditingTestimonial?.testimonialText : ''} />
                {getFieldError('testimonialText') && <p className="text-red-500 text-xs mt-1">{getFieldError('testimonialText')}</p>}
              </div>
              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                )}
                <Button type="submit"> 
                  {isEditing 
                    ? (useFormStatus().pending ? 'Saving...' : 'Save Changes') 
                    : (useFormStatus().pending ? 'Adding...' : 'Add Testimonial')}
                </Button>
              </div>
            </form>
          </div>

          {deleteError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>}
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Testimonials</h4>
            {testimonials.length === 0 ? ( /* ... */ ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="p-4 border rounded-md flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-gray-800">{testimonial.clientName}</h5>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">"{testimonial.testimonialText}"</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(testimonial)} disabled={deletingId === testimonial.id || (isEditing && editingTestimonialId === testimonial.id)}>
                        <PencilIcon className="h-4 w-4 mr-1.5" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteTestimonial(testimonial.id)} disabled={deletingId === testimonial.id}>
                        <TrashIcon className="h-4 w-4 mr-1.5" /> {deletingId === testimonial.id ? 'Deleting...' : 'Delete'}
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
Expected Outcome: Trainers can perform full CRUD operations on their testimonials via the profile editor.
Best Practice Reminders: Ensure consistent error handling and user feedback across CRUD operations.

---

Please have @roo begin with **TODO #39**. The initial data loading is crucial for the editor experience.
Let me know when these tasks are complete.