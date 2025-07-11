"use client";
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { updateCoreInfo } from "@/app/profile/actions/core-info-actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { z } from "zod";

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

const initialState: CoreInfoFormState = {
  message: null,
  error: null,
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Core Info"}
    </Button>
  );
}

export default function CoreInfoEditor({ initialData }: CoreInfoEditorProps) {
  const [state, formAction] = useActionState(updateCoreInfo, initialState);
  // Initialize formData from prop
  const [formData, setFormData] = useState<CoreInfoData>(initialData);

  // Update local form data if server action returns updated fields
  useEffect(() => {
    if (state.success && state.updatedFields) {
      // Merge only the fields that were successfully updated by the server
      setFormData((prev) => ({
        ...prev,
        ...(state.updatedFields as Partial<CoreInfoData>), // Type assertion for safety
      }));
    }
  }, [state.success, state.updatedFields]);

  // Removed the simulated isLoading and fetchInitialData useEffect

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const getFieldError = (fieldName: keyof CoreInfoData) => {
    return state.errors?.find((err) => err.path && err.path.includes(fieldName))
      ?.message;
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Core Information
      </h3>

      {state.success && state.message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md text-sm">
          {state.message}
        </div>
      )}
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1"
          />
          {getFieldError("name") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("name")}</p>
          )}
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleInputChange}
            className="mt-1"
          />
          {getFieldError("username") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("username")}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for your public profile URL. Lowercase letters, numbers, and
            hyphens only.
          </p>
        </div>
        <div>
          <Label htmlFor="certifications">Certifications</Label>
          <Input
            id="certifications"
            name="certifications"
            type="text"
            value={formData.certifications || ""}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="e.g., NASM CPT, CPR/AED"
          />
          {getFieldError("certifications") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("certifications")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            type="text"
            value={formData.location || ""}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="e.g., New York, NY or Remote"
          />
          {getFieldError("location") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("location")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="e.g., (555) 123-4567"
          />
          {getFieldError("phone") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("phone")}
            </p>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
