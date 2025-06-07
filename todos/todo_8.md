Okay, I've reviewed the latest XML.

*   **TODO #39: Refactor Profile Editor for Server-Side Initial Data Fetching** - **DONE**
*   **TODO #40: Services Editor - Component & Actions (Add, List, Initial Data)** - **DONE**
*   **TODO #41: Services Editor - Delete Functionality** - **DONE**
*   **TODO #42: Services Editor - Edit Functionality (Part 1: Setup Edit State and Form)** - **DONE**
*   **TODO #43: Services Editor - Update Functionality** - **DONE**
*   **TODO #44: Testimonials Editor - Component & Actions (Add, List, Initial Data)** - **DONE**
*   **TODO #45: Testimonials Editor - Delete & Edit Functionality** - **DONE**
*   **TODO #46: External Links Editor - Component & Actions (Full CRUD)** - **DONE**
    *   `getCurrentUserProfileData` in `src/app/profile/actions.ts` now includes `externalLinks`.
    *   `addExternalLink`, `updateExternalLink`, and `deleteExternalLink` server actions are implemented.
    *   `src/components/profile/sections/ExternalLinksEditor.tsx` is created and integrated, handling full CRUD.
    *   The `ui` components now have an `index.d.ts` for barrel exports, which is a good small improvement.

Excellent work on completing the CRUD functionality for Services, Testimonials, and External Links! The profile editor is shaping up nicely.

Now, let's move on to the sections involving file uploads: "Transformation Photos" and "Profile Branding" (profile photo and banner). Supabase Storage will be used for this.

---

**Phase 6: Trainer Profile Editor - Collection-Based Sections (Continued) & Image Uploads**

**TODO #47: Setup Supabase Storage Bucket for Profile Images**
Objective: Create and configure a Supabase Storage bucket for profile-related images (transformation photos, profile photos, banners).
File(s) To Create/Modify: This task is primarily done in the Supabase Dashboard.
Specific Instructions:
1.  Go to your Supabase project dashboard.
2.  Navigate to the "Storage" section.
3.  Create a new bucket. A good name would be `profile-assets` or similar.
4.  **Crucially, configure the bucket policies for public read access** for images that will be displayed on public trainer profiles.
    *   For example, allow `SELECT` (read) access for `anon` (anonymous users) on files within specific paths like `transformation_photos/*`, `profile_photos/*`, `profile_banners/*`.
    *   Restrict `INSERT`, `UPDATE`, `DELETE` to authenticated users or via security definer functions if needed (though our server actions will handle uploads securely).
    *   A general public read policy for the bucket might look like this (adjust paths as needed):
        ```sql
        -- Example policy for public read access on specific folders
        -- (Run this in Supabase SQL Editor or configure via UI if available for RLS on Storage)

        -- For profile_photos folder (publicly readable)
        CREATE POLICY "Public Read Access for Profile Photos"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'profile_photos' );

        -- For profile_banners folder (publicly readable)
        CREATE POLICY "Public Read Access for Profile Banners"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'profile_banners' );

        -- For transformation_photos folder (publicly readable)
        CREATE POLICY "Public Read Access for Transformation Photos"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'transformation_photos' );

        -- Policy for authenticated users to upload to their own folders
        -- Example: Allow user to upload to a folder matching their user_id under 'profile_photos'
        CREATE POLICY "Allow Users to Upload Own Profile Photos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'profile_photos' AND auth.uid()::text = (storage.foldername(name))[2] );
        
        -- Similar upload policies for bannerImagePath and transformation_photos,
        -- ensuring the path includes the user's ID for namespacing and security.
        -- e.g., profile_banners/{user_id}/banner.jpg
        -- e.g., transformation_photos/{user_id}/photo.jpg
        
        -- Example for transformation_photos upload:
        CREATE POLICY "Allow Users to Upload Own Transformation Photos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'transformation_photos' AND auth.uid()::text = (storage.foldername(name))[2] );

        CREATE POLICY "Allow Users to Update Own Transformation Photos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'transformation_photos' AND auth.uid()::text = (storage.foldername(name))[2] );
        
        CREATE POLICY "Allow Users to Delete Own Transformation Photos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = 'transformation_photos' AND auth.uid()::text = (storage.foldername(name))[2] );

        -- Add similar UPDATE and DELETE policies for profile_photos and profile_banners if users can change/remove them.
        ```
5.  Note the bucket name (`profile-assets`) and the public URL structure for files in this bucket. This URL will usually be `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/storage/v1/object/public/<BUCKET_NAME>/<FILE_PATH>`.
Expected Outcome: A Supabase Storage bucket is ready for use, with appropriate public read access policies for image display and secured upload policies.
Best Practice Reminders: Use Row Level Security (RLS) policies on your storage bucket to ensure users can only access/modify their own files where appropriate. Public files should indeed be public.

**TODO #48: Transformation Photos Editor - Component & Actions (File Upload, Add, List, Initial Data)**
Objective: Create the UI and server actions for managing transformation photos, including file uploads to Supabase Storage.
File(s) To Create/Modify:
*   `src/components/profile/sections/TransformationPhotosEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `addTransformationPhoto` and modify `getCurrentUserProfileData` to include `transformationPhotos`)
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor component).
Specific Instructions:
1.  **Modify `getCurrentUserProfileData` in `src/app/profile/actions.ts`:**
    *   Include `transformationPhotos` in the profile data selection, ordered by `createdAt` descending.
    ```typescript
    // src/app/profile/actions.ts
    // ... (inside getCurrentUserProfileData, in profile select block)
    // ...
    profile: {
      select: {
        // ... (existing selections)
        transformationPhotos: { // Add this
          orderBy: { createdAt: 'desc' }
        },
      },
    },
    // ...
    // Ensure return type and default structure include transformationPhotos: Array<{id: string, imagePath: string, caption: string | null, createdAt: Date}>
    ```
    *   Update the `InitialProfileData` interface in `src/components/profile/ProfileEditorLayout.tsx`.
2.  **Add `addTransformationPhoto` server action to `src/app/profile/actions.ts`:**
    *   This action will handle file uploads to Supabase Storage.
    *   Input: `caption: string | null`, `photoFile: File` (via FormData).
    *   Use `supabase.storage.from('profile-assets').upload(filePath, file)` for uploading.
    *   The `filePath` should be namespaced, e.g., `transformation_photos/${authUser.id}/${randomFileName}.${extension}`.
    *   Store the `imagePath` (the path within the bucket) in the `TransformationPhoto` model.
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)
    import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

    const transformationPhotoSchema = z.object({
      caption: z.string().max(1000).optional().nullable(),
      photoFile: z
        .instanceof(File, { message: "A photo file is required." })
        .refine(file => file.size > 0, "Photo file cannot be empty.")
        .refine(file => file.size <= 2 * 1024 * 1024, `Photo must be less than 2MB.`) // Max 2MB
        .refine(file => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
          "Invalid file type. Only JPG, PNG, WEBP, GIF allowed."
        ),
    });

    interface TransformationPhotoFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newPhoto?: { id: string; imagePath: string; publicUrl: string; caption: string | null; createdAt: Date };
    }

    export async function addTransformationPhoto(prevState: TransformationPhotoFormState | undefined, formData: FormData): Promise<TransformationPhotoFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      const validatedFields = transformationPhotoSchema.safeParse({
        caption: formData.get('caption'),
        photoFile: formData.get('photoFile'),
      });

      if (!validatedFields.success) {
        return { errors: validatedFields.error.issues, error: "Validation failed.", success: false };
      }
      const { caption, photoFile } = validatedFields.data;

      try {
        const profile = await prisma.profile.findUnique({ where: { userId: authUser.id }, select: { id: true } });
        if (!profile) return { error: "Profile not found.", success: false };

        const fileExtension = photoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `transformation_photos/${authUser.id}/${fileName}`; // Supabase User ID as part of path

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-assets') // Your bucket name
          .upload(filePath, photoFile, {
            cacheControl: '3600', // Cache for 1 hour
            upsert: false, // Do not overwrite if file exists (uuid should prevent this)
          });

        if (uploadError) {
          console.error("Supabase Storage Upload Error:", uploadError);
          return { error: "Failed to upload photo to storage: " + uploadError.message, success: false };
        }

        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('profile-assets')
          .getPublicUrl(filePath);

        const newPhotoRecord = await prisma.transformationPhoto.create({
          data: {
            profileId: profile.id,
            imagePath: filePath, // Store the path within the bucket
            caption,
          },
        });
        
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);

        return { 
          success: true, 
          message: "Photo uploaded successfully!", 
          newPhoto: { ...newPhotoRecord, publicUrl: publicUrlData.publicUrl }
        };

      } catch (e: any) {
        console.error("Error adding transformation photo:", e);
        return { error: "Failed to add photo. " + e.message, success: false };
      }
    }
    ```
    *   **Note:** You will need to install `uuid`: `npm install uuid` and `@types/uuid`: `npm install -D @types/uuid`.
3.  **Create `src/components/profile/sections/TransformationPhotosEditor.tsx`:**
    *   Client component, receives `initialTransformationPhotos`.
    *   Form with file input for photo and text input for caption.
    *   Display preview of selected image before upload.
    *   Use `useFormState` with `addTransformationPhoto`.
    *   Display list of existing photos with their captions (images served from Supabase Storage).
    ```tsx
    // src/components/profile/sections/TransformationPhotosEditor.tsx
    "use client";

    import React, { useEffect, useRef, useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { addTransformationPhoto } from '@/app/profile/actions'; // Adjust
    import { Input, Label, Textarea, Button } from '@/components/ui';
    import Image from 'next/image';
    import { z } from 'zod';

    interface TransformationPhoto {
      id: string;
      imagePath: string; // This is the path within the bucket
      publicUrl: string; // This will be the full public URL from Supabase Storage
      caption: string | null;
      createdAt: Date;
    }

    interface TransformationPhotosEditorProps {
      initialTransformationPhotos: TransformationPhoto[];
    }
    
    interface TransformationPhotoFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
      newPhoto?: TransformationPhoto;
    }

    const initialState: TransformationPhotoFormState = { /* ... */ };

    function SubmitPhotoButton() {
      const { pending } = useFormStatus();
      return <Button type="submit" disabled={pending}>{pending ? 'Uploading...' : 'Upload Photo'}</Button>;
    }

    export default function TransformationPhotosEditor({ initialTransformationPhotos }: TransformationPhotosEditorProps) {
      const [state, formAction] = useFormState(addTransformationPhoto, initialState);
      const formRef = useRef<HTMLFormElement>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const [photos, setPhotos] = useState<TransformationPhoto[]>(initialTransformationPhotos);
      const [previewUrl, setPreviewUrl] = useState<string | null>(null);

      useEffect(() => {
        if (state.success && state.newPhoto) {
          setPhotos(current => [state.newPhoto!, ...current].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          formRef.current?.reset();
          setPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
        }
         if (initialTransformationPhotos !== photos && !state.success) {
             setPhotos(initialTransformationPhotos);
        }
      }, [state.success, state.newPhoto, initialTransformationPhotos]);

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          setPreviewUrl(URL.createObjectURL(file));
        } else {
          setPreviewUrl(null);
        }
      };
      
      const getFieldError = (fieldName: 'caption' | 'photoFile') => {
        return state.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
      };

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Transformation Photos</h3>
            {state.success && state.message && ( /* ... success message ... */ )}
            {state.error && ( /* ... error message ... */ )}
            <form action={formAction} ref={formRef} className="space-y-4 border-b pb-6 mb-6" encType="multipart/form-data">
              <div>
                <Label htmlFor="photoFile">Photo File (Max 2MB)</Label>
                <Input id="photoFile" name="photoFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required 
                       className="mt-1" onChange={handleFileChange} ref={fileInputRef} />
                {getFieldError('photoFile') && <p className="text-red-500 text-xs mt-1">{getFieldError('photoFile')}</p>}
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Preview:</p>
                  <Image src={previewUrl} alt="Selected preview" width={200} height={200} className="max-h-48 w-auto rounded border" />
                </div>
              )}
              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea id="caption" name="caption" rows={3} className="mt-1" />
                {getFieldError('caption') && <p className="text-red-500 text-xs mt-1">{getFieldError('caption')}</p>}
              </div>
              <div className="flex justify-end">
                <SubmitPhotoButton />
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Uploaded Photos</h4>
            {photos.length === 0 ? (
              <p className="text-gray-500">No photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden shadow">
                    <Image src={photo.publicUrl} alt={photo.caption || 'Transformation photo'} 
                           width={300} height={200} className="w-full h-48 object-cover" 
                           onError={(e) => (e.currentTarget.style.display = 'none')} />
                    {photo.caption && <p className="p-3 text-sm text-gray-600">{photo.caption}</p>}
                    {/* Delete button to be added in next TODO */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    ```
4.  **Integrate `TransformationPhotosEditor` into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Ensure `initialData` prop includes `transformationPhotos`.
    *   Pass `initialData.profile?.transformationPhotos` to `TransformationPhotosEditor`.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    // ...
    const PhotosEditor = React.lazy(() => import('./sections/TransformationPhotosEditor'));
    // ... in sectionComponents map:
    'photos': () => <PhotosEditor initialTransformationPhotos={initialData.profile?.transformationPhotos || []} />,
    // ...
    ```
Expected Outcome: Trainers can upload transformation photos with captions. Photos are stored in Supabase Storage, and paths are saved in Prisma. Existing photos are listed.
Best Practice Reminders: Handle file type and size validation both client-side (for UX) and server-side (for security). Ensure Supabase Storage policies are correctly set up.

**TODO #49: Transformation Photos Editor - Delete Functionality**
Objective: Add the ability to delete transformation photos from Supabase Storage and Prisma.
File(s) To Create/Modify:
*   `src/app/profile/actions.ts` (add `deleteTransformationPhoto` action)
*   `src/components/profile/sections/TransformationPhotosEditor.tsx` (add delete buttons and handler)
Specific Instructions:
1.  **Add `deleteTransformationPhoto` server action to `src/app/profile/actions.ts`:**
    *   Input: `photoId: string`.
    *   Fetch the `TransformationPhoto` record to get its `imagePath`.
    *   Delete the file from Supabase Storage: `supabase.storage.from('profile-assets').remove([imagePath])`.
    *   Delete the record from Prisma.
    *   Authorize: ensure the photo belongs to the authenticated user's profile.
    ```typescript
    // src/app/profile/actions.ts
    // ... (addTransformationPhoto and other actions) ...

    export async function deleteTransformationPhoto(photoId: string): Promise<DeleteFormState> { // Reusing DeleteFormState
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      try {
        const photo = await prisma.transformationPhoto.findFirst({
          where: { id: photoId, profile: { userId: authUser.id } },
          select: { id: true, imagePath: true }
        });
        if (!photo) return { error: "Photo not found or not authorized.", success: false };

        // Delete from Supabase Storage
        if (photo.imagePath) {
          const { error: storageError } = await supabase.storage
            .from('profile-assets')
            .remove([photo.imagePath]);
          if (storageError) {
            console.error("Supabase Storage Delete Error:", storageError);
            // Decide if this is a hard failure or if DB record should still be deleted
            // For now, let's treat it as a failure.
            return { error: "Failed to delete photo from storage: " + storageError.message, success: false };
          }
        }

        await prisma.transformationPhoto.delete({ where: { id: photoId } });
        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "Photo deleted successfully.", deletedId: photoId };
      } catch (e: any) {
        console.error("Error deleting transformation photo:", e);
        return { error: "Failed to delete photo. " + e.message, success: false };
      }
    }
    ```
2.  **Modify `src/components/profile/sections/TransformationPhotosEditor.tsx`:**
    *   Add a delete button for each photo.
    *   Implement `handleDeletePhoto` to call the `deleteTransformationPhoto` server action.
    *   Update client-side `photos` state on success.
    ```tsx
    // src/components/profile/sections/TransformationPhotosEditor.tsx
    // ... (imports: add TrashIcon, deleteTransformationPhoto)
    import { TrashIcon } from '@heroicons/react/24/outline';
    import { addTransformationPhoto, deleteTransformationPhoto } from '@/app/profile/actions';

    export default function TransformationPhotosEditor({ initialTransformationPhotos }: TransformationPhotosEditorProps) {
      // ... (existing state: state, formAction, formRef, photos, previewUrl, fileInputRef)
      const [deleteError, setDeleteError] = useState<string | null>(null);
      const [deletingId, setDeletingId] = useState<string | null>(null);
      
      // ... (useEffect for addTransformationPhoto state) ...
       useEffect(() => {
        if (initialTransformationPhotos !== photos && !state.success && !deletingId) {
             setPhotos(initialTransformationPhotos);
        }
      }, [initialTransformationPhotos, state.success, deletingId, photos]); // Added photos to dependency array

      const handleDeletePhoto = async (photoId: string) => {
        if (!window.confirm("Are you sure you want to delete this photo?")) return;
        setDeletingId(photoId);
        setDeleteError(null);
        const result = await deleteTransformationPhoto(photoId);
        if (result.success && result.deletedId) {
          setPhotos(current => current.filter(p => p.id !== result.deletedId));
        } else if (result.error) {
          setDeleteError(result.error);
        }
        setDeletingId(null);
      };
      
      // ... (handleFileChange, getFieldError, JSX for add form) ...
      
      return (
        <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
          {/* ... (Add form and its messages) ... */}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>
          )}

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Your Uploaded Photos</h4>
            {photos.length === 0 ? ( /* ... */ ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative border rounded-lg overflow-hidden shadow group">
                    <Image src={photo.publicUrl} alt={photo.caption || 'Transformation photo'} 
                           width={300} height={200} className="w-full h-48 object-cover" 
                           onError={(e) => (e.currentTarget.style.display = 'none')} />
                    {photo.caption && <p className="p-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">{photo.caption}</p>}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="danger" size="sm"
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletingId === photo.id}
                        title="Delete photo"
                      >
                        {deletingId === photo.id ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <TrashIcon className="h-4 w-4" />}
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
Expected Outcome: Trainers can delete their transformation photos. Files are removed from Supabase Storage and records from Prisma.
Best Practice Reminders: Ensure server-side checks prevent unauthorized deletion. Error handling for storage deletion failures is important.

---

Please have @roo begin with **TODO #47**.
Supabase storage setup is crucial before implementing the photo upload features.
Let me know when these tasks for External Links and Transformation Photos (including Supabase setup) are complete.