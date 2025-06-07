Excellent work, the verification is complete. The implementation of Phase 5 Refinement and the initial parts of Phase 6 (TODOs #39 through #49) is confirmed as **DONE**.

The profile editor is now highly functional, with full CRUD operations for Core Info, Rich Text sections, Services, Testimonials, External Links, and Transformation Photos.

We will now complete **Phase 6** by building the editors for **Branding** and **Benefits**. After this, the entire profile editor will be feature-complete according to the original ZIRO.FIT spec.

Here is the next set of tasks for @roo:

---

**Phase 6: Trainer Profile Editor - Collection-Based Sections (Final)**

**TODO #50: Branding Editor - Component & Actions for Image Uploads**
Objective: Create the UI and server actions for managing profile branding images (banner and profile photo). This involves uploading files to Supabase Storage and updating the `Profile` model.
File(s) To Create/Modify:
*   `src/components/profile/sections/BrandingEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `updateBrandingImages` action)
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor component).
Specific Instructions:
1.  **Add `updateBrandingImages` server action to `src/app/profile/actions.ts`:**
    *   This action will handle the upload of a `bannerImage` and/or a `profilePhoto`. Both are optional in a single submission.
    *   It will upload files to Supabase Storage in their respective folders (e.g., `profile_banners/{user_id}/`, `profile_photos/{user_id}/`).
    *   It will update the `bannerImagePath` and `profilePhotoPath` fields on the `Profile` model.
    *   It should delete the old image from storage if a new one is uploaded.
    ```typescript
    // src/app/profile/actions.ts
    // ... (existing actions and imports)

    const brandingImageSchema = z.object({
      bannerImage: z.instanceof(File).optional()
        .refine(file => !file || file.size <= 2 * 1024 * 1024, `Banner image must be less than 2MB.`)
        .refine(file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Invalid banner image type."),
      profilePhoto: z.instanceof(File).optional()
        .refine(file => !file || file.size <= 1 * 1024 * 1024, `Profile photo must be less than 1MB.`)
        .refine(file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Invalid profile photo type."),
    });

    interface BrandingFormState {
      message?: string | null;
      error?: string | null;
      success?: boolean;
    }

    export async function updateBrandingImages(prevState: BrandingFormState | undefined, formData: FormData): Promise<BrandingFormState> {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: "User not authenticated.", success: false };

      const bannerFile = formData.get('bannerImage') as File | null;
      const profilePhotoFile = formData.get('profilePhoto') as File | null;
      
      const validatedFields = brandingImageSchema.safeParse({
        bannerImage: bannerFile?.size ? bannerFile : undefined,
        profilePhoto: profilePhotoFile?.size ? profilePhotoFile : undefined,
      });

      if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.toString(), success: false };
      }

      try {
        const profile = await prisma.profile.findUnique({ where: { userId: authUser.id } });
        if (!profile) return { error: "Profile not found.", success: false };
        
        let bannerImagePath = profile.bannerImagePath;
        let profilePhotoPath = profile.profilePhotoPath;

        // Handle Banner Image Upload
        if (bannerFile?.size) {
          if (profile.bannerImagePath) await supabase.storage.from('profile-assets').remove([profile.bannerImagePath]);
          const newPath = `profile_banners/${authUser.id}/${uuidv4()}.${bannerFile.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('profile-assets').upload(newPath, bannerFile);
          if (error) throw new Error(`Banner upload failed: ${error.message}`);
          bannerImagePath = newPath;
        }

        // Handle Profile Photo Upload
        if (profilePhotoFile?.size) {
          if (profile.profilePhotoPath) await supabase.storage.from('profile-assets').remove([profile.profilePhotoPath]);
          const newPath = `profile_photos/${authUser.id}/${uuidv4()}.${profilePhotoFile.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('profile-assets').upload(newPath, profilePhotoFile);
          if (error) throw new Error(`Profile photo upload failed: ${error.message}`);
          profilePhotoPath = newPath;
        }

        // Update Prisma
        await prisma.profile.update({
          where: { userId: authUser.id },
          data: { bannerImagePath, profilePhotoPath },
        });

        revalidatePath('/profile/edit');
        revalidatePath(`/trainer/${authUser.user_metadata?.username || authUser.id}`);
        return { success: true, message: "Branding updated successfully!" };

      } catch (e: any) {
        return { error: "Failed to update branding: " + e.message, success: false };
      }
    }
    ```
2.  **Create `src/components/profile/sections/BrandingEditor.tsx`:**
    *   Client component, receives `initialBannerUrl` and `initialProfilePhotoUrl` as props.
    *   Show current images.
    *   Provide two separate file inputs for banner and profile photo.
    *   Use a single form and server action to submit both.
    *   Show previews for newly selected images.
    ```tsx
    // src/components/profile/sections/BrandingEditor.tsx
    "use client";

    import React, { useState } from 'react';
    import { useFormState, useFormStatus } from 'react-dom';
    import { updateBrandingImages } from '@/app/profile/actions';
    import { Input, Label, Button } from '@/components/ui';
    import Image from 'next/image';

    interface BrandingEditorProps {
      initialData: {
        bannerImagePath: string | null;
        profilePhotoPath: string | null;
      };
    }

    const DEFAULT_BANNER = '/next.svg';
    const DEFAULT_PHOTO = '/next.svg';

    function SubmitButton() {
      const { pending } = useFormStatus();
      return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Branding'}</Button>;
    }

    export default function BrandingEditor({ initialData }: BrandingEditorProps) {
      const [state, formAction] = useFormState(updateBrandingImages, undefined);
      const [bannerPreview, setBannerPreview] = useState<string | null>(null);
      const [photoPreview, setPhotoPreview] = useState<string | null>(null);

      const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setBannerPreview(file ? URL.createObjectURL(file) : null);
      };
      const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
      };

      // Construct full Supabase URLs from paths for display
      const getPublicUrl = (path: string | null) => path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-assets/${path}` : null;
      
      const currentBannerUrl = bannerPreview || getPublicUrl(initialData.bannerImagePath);
      const currentProfilePhotoUrl = photoPreview || getPublicUrl(initialData.profilePhotoPath);

      return (
        <div className="p-6 bg-white shadow-sm rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Profile Branding</h3>
          {state?.success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{state.message}</div>}
          {state?.error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{state.error}</div>}

          <form action={formAction} className="space-y-6">
            {/* Banner Image Section */}
            <div>
              <Label htmlFor="bannerImage">Banner Image (Recommended: 1200x400)</Label>
              <Image src={currentBannerUrl || DEFAULT_BANNER} alt="Banner" width={600} height={200} className="w-full h-auto object-cover rounded-md mt-2 mb-2 bg-gray-100" />
              <Input id="bannerImage" name="bannerImage" type="file" accept="image/*" className="text-sm" onChange={handleBannerChange} />
            </div>
            
            {/* Profile Photo Section */}
            <div>
              <Label htmlFor="profilePhoto">Profile Photo (Recommended: square)</Label>
              <Image src={currentProfilePhotoUrl || DEFAULT_PHOTO} alt="Profile Photo" width={128} height={128} className="w-32 h-32 object-cover rounded-full mt-2 mb-2 bg-gray-100" />
              <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" className="text-sm" onChange={handlePhotoChange} />
            </div>

            <div className="flex justify-end pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      );
    }
    ```
3.  **Integrate `BrandingEditor` into `src/components/profile/ProfileEditorLayout.tsx`:**
    *   Pass `initialData.profile` to `BrandingEditor`.
    ```tsx
    // src/components/profile/ProfileEditorLayout.tsx
    // ...
    const BrandingEditor = React.lazy(() => import('./sections/BrandingEditor'));
    // ... in sectionComponents map:
    'branding': () => <BrandingEditor initialData={initialData.profile || { bannerImagePath: null, profilePhotoPath: null }} />,
    // ...
    ```
Expected Outcome: The Branding editor allows users to upload, preview, and save a banner image and profile photo. Old images are replaced in storage.

**TODO #50: Benefits Editor - Component & Actions (Full CRUD & Reordering)**
Objective: Create the UI and server actions for managing "Benefits" (add, list, edit, delete, reorder).
File(s) To Create/Modify:
*   `package.json` (add `sortablejs`)
*   `src/components/profile/sections/BenefitsEditor.tsx` (new)
*   `src/app/profile/actions.ts` (add `addBenefit`, `updateBenefit`, `deleteBenefit`, `updateBenefitOrder`, and modify `getCurrentUserProfileData` to include `benefits`)
*   Modify `src/components/profile/ProfileEditorLayout.tsx` (integrate new editor component).
Specific Instructions:
1.  **Install `sortablejs`:**
    ```bash
    npm install sortablejs
    npm install -D @types/sortablejs
    ```
2.  **Modify `getCurrentUserProfileData` in `src/app/profile/actions.ts`:**
    *   Include `benefits` in the profile data selection, ordered by `orderColumn` ascending.
3.  **Add CRUD and Reorder Actions to `src/app/profile/actions.ts`:**
    *   `addBenefit`: Takes `title`, `description`, `iconName`, `iconStyle`. Calculates the `orderColumn`.
    *   `updateBenefit`: Takes `benefitId`, `title`, `description`, `iconName`, `iconStyle`.
    *   `deleteBenefit`: Takes `benefitId`.
    *   `updateBenefitOrder`: Takes an array of `benefitIds` in the new order and updates their `orderColumn` accordingly.
4.  **Create `src/components/profile/sections/BenefitsEditor.tsx`:**
    *   Client component, receives `initialBenefits`.
    *   Form for adding/editing benefits (title, description, icon picker).
    *   Use `sortablejs` to make the list of benefits draggable. On drag `end`, call the `updateBenefitOrder` action.
    *   This component will be complex due to the combination of CRUD and drag-and-drop. Start with CRUD and then add reordering.
5.  **Integrate `BenefitsEditor` into `ProfileEditorLayout.tsx`:**
    *   Pass `initialData.profile?.benefits` to `BenefitsEditor`.

Expected Outcome: A fully functional editor for the "Benefits" section, including adding, editing, deleting, and reordering items via drag-and-drop. The UI updates reflect these changes.

---

This is a substantial set of tasks. Please have @roo start with **TODO #47** (Supabase setup) and then proceed with the implementation of the editors one by one. Let me know when this phase is complete.