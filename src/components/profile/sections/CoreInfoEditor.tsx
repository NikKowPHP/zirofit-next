"use client";

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCoreInfo } from '@/app/profile/actions';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { z } from 'zod'; // Import z for ZodIssue

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
    errors?: z.ZodIssue[]; // Use ZodIssue directly
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