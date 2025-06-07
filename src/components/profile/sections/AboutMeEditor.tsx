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

const initialState: TextContentFormState = {
  message: null,
  error: null,
  success: false,
  updatedContent: null,
};

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
          initialValue={content}
        />
        <div className="flex justify-end mt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}