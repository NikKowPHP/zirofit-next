"use client";

import React, { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateMethodology } from "@/app/profile/actions/text-content-actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useServerActionToast } from "@/hooks/useServerActionToast";

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

interface MethodologyEditorProps {
  initialMethodology: string | null; // Passed from parent server component
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Methodology"}
    </Button>
  );
}

export default function MethodologyEditor({
  initialMethodology,
}: MethodologyEditorProps) {
  const [state, formAction] = useActionState(updateMethodology, initialState);
  const [content, setContent] = useState(initialMethodology || "");

  useServerActionToast({ formState: state });

  // Update content state if server action returns updatedContent
  useEffect(() => {
    if (state.success && typeof state.updatedContent === "string") {
      setContent(state.updatedContent);
    } else if (state.success && state.updatedContent === null) {
      setContent("");
    }
  }, [state.success, state.updatedContent]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Methodology</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <RichTextEditor
            label="Edit Content"
            name="methodologyContent"
            initialValue={content}
          />
          <div className="flex justify-end mt-4">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}