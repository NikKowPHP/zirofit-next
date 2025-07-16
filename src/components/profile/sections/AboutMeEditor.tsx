"use client";

import React, { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateAboutMe } from "@/app/[locale]/profile/actions/text-content-actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { useTranslations } from "next-intl";

interface TextContentFormState {
  messageKey?: string | null;
  error?: string | null;
  success?: boolean;
  updatedContent?: string | null;
}

const initialState: TextContentFormState = {
  messageKey: null,
  error: null,
  success: false,
  updatedContent: null,
};

interface AboutMeEditorProps {
  initialAboutMe: string | null; // Passed from parent server component
}

function SubmitButton() {
  const t = useTranslations("ProfileEditor");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("saving") : t("saveAboutMe")}
    </Button>
  );
}

export default function AboutMeEditor({ initialAboutMe }: AboutMeEditorProps) {
  const t = useTranslations("ProfileEditor");
  const [state, formAction] = useFormState(updateAboutMe, initialState);
  const [content, setContent] = useState(initialAboutMe || "");

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
        <CardTitle>{t("aboutMeTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <RichTextEditor
            label={t("editContent")}
            name="aboutMeContent"
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
