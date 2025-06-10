Alright, I've reviewed the latest XML.

It appears that Phase 5 Refinement (TODO #39) and the initial parts of Phase 6 (TODOs #40-45 for Services and Testimonials) have been completed successfully:

*   **TODO #39: Refactor Profile Editor for Server-Side Initial Data Fetching** - **DONE**
    *   `getCurrentUserProfileData` in `src/app/profile/actions.ts` fetches comprehensive data.
    *   `src/app/profile/edit/page.tsx` is an async Server Component passing initial data.
    *   Editor components (`CoreInfoEditor`, `AboutMeEditor`, etc.) now correctly receive and use `initialData` props.

*   **TODO #40: Services Editor - Component & Actions (Add, List, Initial Data)** - **DONE**
    *   `getCurrentUserProfileData` now includes `services`.
    *   `addService` action is implemented.
    *   `ServicesEditor.tsx` lists initial services and allows adding new ones.
    *   `ProfileEditorLayout.tsx` passes `initialServices`.

*   **TODO #41: Services Editor - Delete Functionality** - **DONE**
    *   `deleteService` action is implemented.
    *   `ServicesEditor.tsx` has delete functionality.

*   **TODO #42: Services Editor - Edit Functionality (Part 1: Setup Edit State and Form)** - **DONE**
    *   `ServicesEditor.tsx` UI adapts for editing.

*   **TODO #43: Services Editor - Update Functionality** - **DONE**
    *   `updateService` action is implemented.
    *   `ServicesEditor.tsx` handles updates.

*   **TODO #44: Testimonials Editor - Component & Actions (Add, List, Initial Data)** - **DONE**
    *   `getCurrentUserProfileData` now includes `testimonials`.
    *   `addTestimonial` action is implemented.
    *   `TestimonialsEditor.tsx` created and integrated, handles add/list.

*   **TODO #45: Testimonials Editor - Delete & Edit Functionality** - **DONE**
    *   `deleteTestimonial` and `updateTestimonial` actions are implemented.
    *   `TestimonialsEditor.tsx` has full CRUD functionality.

This is excellent progress. The profile editor is becoming quite functional!

Let's continue with **Phase 6: Trainer Profile Editor - Collection-Based Sections**, focusing on External Links, and then move to image handling for Photos and Branding.

---

**Phase 6: Trainer Profile Editor - Collection-Based Sections (Continued)**

**TODO #46: External Links Editor - Component & Actions (Full CRUD)**
Objective: Create the UI and server actions for managing external links (add, list, edit, delete).
File(s) To Create/Modify:
*   `src/components/profile/sections/ExternalLinksEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `addExternalLink`, `updateExternalLink`, `deleteExternalLink`, and modify `getCurrentUserProfileData` to include `externalLinks`)
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor component).
Specific Instructions:
1.  **Modify `getCurrentUserProfileData` in `src/app/profile/actions.ts`:**
    *   Include `externalLinks` in the profile data selection, ordered by `createdAt` ascending.
    ```typescript
    // src/app/profile/actions.ts
    // ... (inside getCurrentUserProfileData, in profile select block)
    // ...
    profile: {
      select: {
        // ... (existing selections: id, certifications, ..., services, testimonials)
        externalLinks: { // Add this
          orderBy: { createdAt: 'asc' }
        },
      },
    },
    // ...
    // Ensure the return type and default structure in InitialProfileData include externalLinks
    // Example for default structure: externalLinks: []
    ```
    *   Update the `InitialProfileData` interface in `src/components/profile/ProfileEditorLayout.tsx` to include `externalLinks: Array<{id: string, label: string, linkUrl: string, createdAt: Date}>`.
2.  **Add Server Actions to `src/app/profile/actions.ts` for External Links:**
    *   `addExternalLink(prevState, formData)`: Takes `label`, `linkUrl`. Validates (URL format for `linkUrl`).
    *   `updateExternalLink(prevState, formData)`: Takes `linkId`, `label`, `linkUrl`. Validates.
    *   `deleteExternalLink(linkId)`: Takes `linkId`.
    *   Ensure authorization and `revalidatePath` for all actions.
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)

    const externalLinkSchema = z.object({
      label: z.string().min(1, "Label is required.").max(255),
      linkUrl: z.string().url({ message: "Please enter a valid URL." }).max(2048),
    });

    interface ExternalLinkFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newLink?: { id: string; label: string; linkUrl: string; createdAt: Date };
      updatedLink?: { id: string; label: string; linkUrl: string; createdAt: Date }; // For update
    }
    
    // Add External Link
    export async function addExternalLink(prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      const validatedFields = externalLinkSchema.safeParse({
        label: formData.get('label'),
        linkUrl: formData.get('linkUrl'),
      });

      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }
      const { label, linkUrl } = validatedFields.data;

      try {
        const profile = await prisma.profile.findUnique({ where: { userId: authUser.id }, select: { id: true } });
        if (!profile) return { error: "Profile not found.", success: false };

        const newLink = await prisma.externalLink.create({
          data: { profileId: profile.id, label, linkUrl },
        });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "External link added successfully!", newLink };
      } catch (e: any) {
        return { error: "Failed to add external link. " + e.message, success: false };
      }
    }

    // Update External Link
    export async function updateExternalLink(prevState: ExternalLinkFormState | undefined, formData: FormData): Promise<ExternalLinkFormState> {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      const linkId = formData.get('linkId') as string;
      if (!linkId) return { error: "Link ID missing.", success: false };

      const validatedFields = externalLinkSchema.safeParse({
        label: formData.get('label'),
        linkUrl: formData.get('linkUrl'),
      });
      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }
      const { label, linkUrl } = validatedFields.data;

      try {
        const linkToUpdate = await prisma.externalLink.findFirst({
            where: { id: linkId, profile: { userId: authUser.id } },
        });
        if (!linkToUpdate) return { error: "Link not found or not authorized.", success: false };

        const updatedLink = await prisma.externalLink.update({
            where: { id: linkId },
            data: { label, linkUrl },
        });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "External link updated.", updatedLink };
      } catch (e: any) {
        return { error: "Failed to update external link. " + e.message, success: false };
      }
    }

    // Delete External Link
    export async function deleteExternalLink(linkId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      try {
        const linkToDelete = await prisma.externalLink.findFirst({
            where: { id: linkId, profile: { userId: authUser.id } },
        });
        if (!linkToDelete) return { error: "Link not found or not authorized.", success: false };

        await prisma.externalLink.delete({ where: { id: linkId } });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "External link deleted.", deletedId: linkId };
      } catch (e: any) {
        return { error: "Failed to delete external link. " + e.message, success: false };
      }
    }
    ```
3.  **Create `src/components/profile/sections/ExternalLinksEditor.tsx`:**
    *   Client component, receives `initialExternalLinks` prop.
    *   Manages add/edit form state and list of links.
    *   Uses `Input`, `Label`, `Button` components.
    *   Implements full CRUD UI and logic, similar to `ServicesEditor.tsx` and `TestimonialsEditor.tsx`.
    ```tsx
    // src/components/profile/sections/ExternalLinksEditor.tsx
    "use client";

    import React, { useEffect, useRef, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { addExternalLink, updateExternalLink, deleteExternalLink } from '@/app/profile/actions';
    import { Input, Label, Button } from '@/components/ui';
    import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
    import { z } from 'zod';

    interface ExternalLink {
      id: string;
      label: string;
      linkUrl: string;
      createdAt: Date; // Assuming Prisma adds this
    }

    interface ExternalLinksEditorProps {
      initialExternalLinks: ExternalLink[];
    }
    
    interface ExternalLinkFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newLink?: ExternalLink;
      updatedLink?: ExternalLink;
    }
    
    const initialFormState: ExternalLinkFormState = { /* ... */ };

    export default function ExternalLinksEditor({ initialExternalLinks }: ExternalLinksEditorProps) {
      const [addState, addFormAction] = useFormState(addExternalLink, initialFormState);
      const [updateState, updateFormAction] = useFormState(updateExternalLink, initialFormState);
      const formRef = useRef<HTMLFormElement>(null);
      const [links, setLinks] = useState<ExternalLink[]>(initialExternalLinks);

      const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
      const [deleteError, setDeleteError] = useState<string | null>(null);
      const [deletingId, setDeletingId] = useState<string | null>(null);
      
      const isEditing = !!editingLinkId;
      const currentEditingLink = isEditing ? links.find(link => link.id === editingLinkId) : null;

      // Effect for add link
      useEffect(() => {
        if (addState.success && addState.newLink) {
          setLinks(current => [addState.newLink!, ...current].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
          formRef.current?.reset();
        }
      }, [addState.success, addState.newLink]);

      // Effect for update link
      useEffect(() => {
        if (updateState.success && updateState.updatedLink) {
          setLinks(current => 
            current.map(link => link.id === updateState.updatedLink!.id ? updateState.updatedLink! : link)
                   .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );
          handleCancelEdit();
        }
      }, [updateState.success, updateState.updatedLink]);
      
      // Sync with initial props
      useEffect(() => {
        if (initialExternalLinks !== links && !addState.success && !updateState.success && !deletingId && !isEditing) {
             setLinks(initialExternalLinks);
        }
      }, [initialExternalLinks, addState.success, updateState.success, deletingId, isEditing, links]);

      const handleEditClick = (link: ExternalLink) => setEditingLinkId(link.id);
      const handleCancelEdit = () => setEditingLinkId(null);

      const handleDeleteLink = async (linkId: string) => {
        if (!window.confirm("Are you sure?")) return;
        setDeletingId(linkId);
        setDeleteError(null);
        const result = await deleteExternalLink(linkId);
        if (result.success && result.deletedId) {
          setLinks(current => current.filter(l => l.id !== result.deletedId));
        } else if (result.error) {
          setDeleteError(result.error);
        }
        setDeletingId(null);
      };
      
      const currentFormState = isEditing ? updateState : addState;
      const getFieldError = (fieldName: 'label' | 'linkUrl') => {
        return currentFormState.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? `Edit Link: ${currentEditingLink?.label}` : 'Add New External Link'}
            </h3>
            {currentFormState.success && currentFormState.message && ( /* ... */ )}
            {currentFormState.error && ( /* ... */ )}

            <form 
                action={isEditing ? updateFormAction : addFormAction} 
                key={editingLinkId || 'add-link'}
                ref={formRef}
                className="space-y-4 border-b pb-6 mb-6"
            >
              {isEditing && <input type="hidden" name="linkId" value={editingLinkId} />}
              <div>
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" type="text" required className="mt-1"
                       defaultValue={isEditing ? currentEditingLink?.label : ''} />
                {getFieldError('label') && <p className="text-red-500 text-xs mt-1">{getFieldError('label')}</p>}
              </div>
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input id="linkUrl" name="linkUrl" type="url" required className="mt-1"
                       placeholder="https://example.com"
                       defaultValue={isEditing ? currentEditingLink?.linkUrl : ''} />
                {getFieldError('linkUrl') && <p className="text-red-500 text-xs mt-1">{getFieldError('linkUrl')}</p>}
              </div>
              <div className="flex justify-end space-x-3">
                {isEditing && <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>}
                <Button type="submit">
                  {isEditing 
                    ? (useFormStatus().pending ? 'Saving...' : 'Save Changes') 
                    : (useFormStatus().pending ? 'Adding...' : 'Add Link')}
                </Button>
              </div>
            </form>
          </div>

          {deleteError && ( /* ... */ )}
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your External Links</h4>
            {links.length === 0 ? (
              <p className="text-gray-500">No external links added yet.</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-700">{link.label}</span>: {' '}
                      <a href={link.linkUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate">
                        {link.linkUrl}
                      </a>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(link)} disabled={deletingId === link.id || (isEditing && editingLinkId === link.id)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteLink(link.id)} disabled={deletingId === link.id}>
                        <TrashIcon className="h-4 w-4" />
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
4.  **Integrate `ExternalLinksEditor` into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Ensure `initialData` prop includes `externalLinks`.
    *   Pass `initialData.profile?.externalLinks` to `ExternalLinksEditor`.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    // ...
    const LinksEditor = React.lazy(() => import('./sections/ExternalLinksEditor'));
    // ... in sectionComponents map:
    'links': () => <LinksEditor initialExternalLinks={initialData.profile?.externalLinks || []} />,
    // ...
    ```
Expected Outcome: Full CRUD functionality for external links in the profile editor.
Best Practice Reminders: Maintain consistency in UI and state management with other editor sections.

---

Please have @roo start with **TODO #46**. Let me know when it's complete.