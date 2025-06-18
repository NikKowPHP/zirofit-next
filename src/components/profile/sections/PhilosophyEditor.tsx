"use client";

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updatePhilosophy } from '@/app/profile/actions';
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

interface PhilosophyEditorProps {
  initialPhilosophy: string | null; // Passed from parent server component
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Philosophy'}</Button>;
}

export default function PhilosophyEditor({ initialPhilosophy }: PhilosophyEditorProps) {
  const [state, formAction] = useFormState(updatePhilosophy, initialState);
  const [content, setContent] = useState(initialPhilosophy || '');

  // Update content state if server action returns updatedContent
  useEffect(() => {
    if (state.success && typeof state.updatedContent === 'string') {
      setContent(state.updatedContent);
    } else if (state.success && state.updatedContent === null) {
      setContent('');
    }
  }, [state.success, state.updatedContent]);
 
   return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Philosophy</h3>
      {state.success && state.message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md">{state.message}</div>
      )}
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md">{state.error}</div>
      )}
      <form action={formAction}>
        <RichTextEditor
          label="Edit Content"
          name="philosophyContent"
          initialValue={content}
        />
        <div className="flex justify-end mt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
