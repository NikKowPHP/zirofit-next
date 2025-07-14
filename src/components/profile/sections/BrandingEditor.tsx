// src/components/profile/sections/BrandingEditor.tsx
"use client";

import React, { useState } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { updateBrandingImages } from "@/app/profile/actions/branding-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BannerImage, ProfileImage } from "@/components/ui/ImageComponents";
import { useServerActionToast } from "@/hooks/useServerActionToast";

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

const DEFAULT_BANNER = "/default-banner.jpg";
const DEFAULT_PHOTO = "/default-profile.jpg";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Branding"}
    </Button>
  );
}

export default function BrandingEditor({ initialData }: BrandingEditorProps) {
  const [state, formAction] = useFormState(
    updateBrandingImages,
    initialFormState,
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useServerActionToast({ formState: state });

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const currentBannerUrl = bannerPreview || initialData.bannerImagePath;
  const currentProfilePhotoUrl = photoPreview || initialData.profilePhotoPath;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Profile Branding</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Banner Image Section */}
          <div className="relative">
            <Label htmlFor="bannerImage">
              Banner Image (Recommended: 1200x400)
            </Label>
            <div className="w-full h-48 mt-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded-md relative overflow-hidden">
              <BannerImage
                src={currentBannerUrl || ""}
                alt="Banner"
                defaultSrc={DEFAULT_BANNER}
                layout="fill"
                objectFit="cover"
                quality={85}
                className="object-cover"
              />
            </div>
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
            <Label htmlFor="profilePhoto">
              Profile Photo (Recommended: 400x400)
            </Label>
            <ProfileImage
              src={currentProfilePhotoUrl || ""}
              alt="Profile Photo"
              width={400}
              height={400}
              className="w-32 h-32 object-cover rounded-full mt-2 mb-2 bg-gray-100 dark:bg-gray-700"
              defaultSrc={DEFAULT_PHOTO}
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
      </CardContent>
    </Card>
  );
}