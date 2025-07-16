"use client";
import React, { useEffect, useState } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { updateCoreInfo } from "@/app/[locale]/profile/actions/core-info-actions";
import {
  Input,
  Label,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { z } from "zod";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { useTranslations } from "next-intl";

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
  messageKey?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  updatedFields?: Partial<CoreInfoData>;
}
const initialState: CoreInfoFormState = {
  messageKey: null,
  error: null,
  errors: undefined,
  success: false,
};
function SubmitButton() {
  const t = useTranslations("ProfileEditor");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("saving") : t("saveCoreInfo")}
    </Button>
  );
}
export default function CoreInfoEditor({ initialData }: CoreInfoEditorProps) {
  const t = useTranslations("ProfileEditor");
  const [state, formAction] = useFormState(updateCoreInfo, initialState);
  const [formData, setFormData] = useState<CoreInfoData>(initialData);

  useServerActionToast({ formState: state });

  useEffect(() => {
    if (state.success && state.updatedFields) {
      setFormData((prev) => ({
        ...prev,
        ...(state.updatedFields as Partial<CoreInfoData>),
      }));
    }
  }, [state.success, state.updatedFields]);

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
    <Card>
      <CardHeader>
        <CardTitle>{t("coreInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("fullNameLabel")}</Label>
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
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("name")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="username">{t("usernameLabel")}</Label>
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
              {t("usernameHint")}
            </p>
          </div>
          <div>
            <Label htmlFor="certifications">{t("certificationsLabel")}</Label>
            <Input
              id="certifications"
              name="certifications"
              type="text"
              value={formData.certifications || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder={t("certificationsPlaceholder")}
            />
            {getFieldError("certifications") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("certifications")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="location">{t("locationLabel")}</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder={t("locationPlaceholder")}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("locationHint")}
            </p>
            {getFieldError("location") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("location")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">{t("phoneLabel")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder={t("phonePlaceholder")}
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
      </CardContent>
    </Card>
  );
}
