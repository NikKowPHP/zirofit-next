// src/components/profile/sections/BrandingEditor.tsx
"use client";

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { updateBrandingImages } from '@/app/profile/actions';
import { Input, Label, Button } from '@/components/ui';
import Image from 'next/image';

interface BrandingEditorProps {
  initialData: {
    bannerImagePath: string | null;
    profilePhotoPath: string | null;
  };
}

interface BrandingFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

const initialFormState: BrandingFormState = {
  message: null,
  error: null,
  success: false,
};

const DEFAULT_BANNER = '/default-banner.jpg';
const DEFAULT_PHOTO = '/default-profile.jpg';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Branding'}</Button>;
}

export default function BrandingEditor({ initialData }: BrandingEditorProps) {
  const [state, formAction] = useActionState(updateBrandingImages, initialFormState);
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

  const getPublicUrl = (path: string | null) => {
    return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/zirofit/${path}` : '';
  }

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
          <Image
            src={currentBannerUrl || DEFAULT_BANNER}
            alt="Banner"
            width={1200}
            height={400}
            className="w-full h-48 object-cover rounded-md mt-2 mb-2 bg-gray-100"
            onError={(e) => { e.currentTarget.src = DEFAULT_BANNER }}
          />
          <Input
            id="bannerImage"
            name="bannerImage"
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={handleBannerChange}
          />
        </div>

        {/* Profile Photo Section */}
        <div>
          <Label htmlFor="profilePhoto">Profile Photo (Recommended: 400x400)</Label>
          <Image
            src={currentProfilePhotoUrl || DEFAULT_PHOTO}
            alt="Profile Photo"
            width={400}
            height={400}
            className="w-32 h-32 object-cover rounded-full mt-2 mb-2 bg-gray-100"
            onError={(e) => { e.currentTarget.src = DEFAULT_PHOTO }}
          />
          <Input
            id="profilePhoto"
            name="profilePhoto"
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
