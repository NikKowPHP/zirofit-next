"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormStatus, useFormState } from "react-dom";
import {
  addBenefit,
  updateBenefit,
  deleteBenefit,
  updateBenefitOrder,
} from "@/app/[locale]/profile/actions/benefit-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, RichTextEditor } from "@/components/ui";
import type { Benefit } from "@prisma/client";
import SortableJS from "sortablejs";
import { toast } from "sonner";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { useTranslations } from "next-intl";

interface BenefitsEditorProps {
  initialBenefits: Benefit[];
}

interface BenefitFormState {
  messageKey?: string | null;
  error?: string | null;
  success?: boolean;
}

const initialFormState: BenefitFormState = {
  messageKey: null,
  error: null,
  success: false,
};

function SubmitButton({isEditing}: {isEditing: boolean}) {
  const { pending } = useFormStatus();
  const t = useTranslations("ProfileEditor");
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("saving") : isEditing ? t("updateBenefit") : t("saveBenefit")}
    </Button>
  );
}

export default function BenefitsEditor({
  initialBenefits,
}: BenefitsEditorProps) {
  const t = useTranslations("ProfileEditor");
  const t_server = useTranslations("ServerActions");
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [addFormState, addFormAction] = useFormState(addBenefit, initialFormState);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  useServerActionToast({ formState: addFormState, onSuccess: () => formRef.current?.reset() });
  
  useEffect(() => {
    const sortable = new SortableJS(
      document.getElementById("benefits-list") as HTMLElement,
      {
        handle: ".drag-handle",
        onEnd: async () => {
          const newOrder = Array.from(
            document.getElementById("benefits-list")?.children || [],
          )
            .map((item) => (item as HTMLElement).dataset.id)
            .filter((id): id is string => id !== undefined);
          const result = await updateBenefitOrder(newOrder);
          if (result.success && result.messageKey) {
            toast.success(t_server(result.messageKey as any));
          } else {
            toast.error(result.error || t_server('genericError'));
          }

          setBenefits((prevBenefits) => {
            const newBenefits = [...prevBenefits];
            newOrder.forEach((id, index) => {
              const benefit = newBenefits.find((b) => b.id === id);
              if (benefit) {
                benefit.orderColumn = index + 1;
              }
            });
            newBenefits.sort((a, b) => a.orderColumn - b.orderColumn);
            return newBenefits;
          });
        },
      },
    );

    return () => {
      sortable.destroy();
    };
  }, [t_server]);

  const handleEditBenefit = (benefit: Benefit) => {
    setEditingBenefitId(benefit.id);
  };

  const handleCancelEdit = () => {
    setEditingBenefitId(null);
  };

  const handleDeleteBenefit = async () => {
    if (!itemToDelete) return;

    const originalBenefits = benefits;
    setIsDeleting(true);
    
    // Optimistic UI update
    setBenefits((prevBenefits) =>
      prevBenefits.filter((benefit) => benefit.id !== itemToDelete),
    );
    setItemToDelete(null); // Close modal

    try {
      const result = await deleteBenefit(itemToDelete);
      if (result.success && result.messageKey) {
        toast.success(t_server(result.messageKey as any));
        // State is already updated, do nothing
      } else {
        toast.error(result.error || t_server('genericError'));
        setBenefits(originalBenefits); // Revert on failure
      }
    } catch (e: unknown) {
      toast.error(t_server('genericError'));
      setBenefits(originalBenefits); // Revert on failure
      console.error("Failed to delete benefit: ", e);
    } finally {
        setIsDeleting(false);
    }
  };

  const handleBenefitUpdate = async (id: string, formData: FormData) => {
    const result = await updateBenefit(id, undefined, formData);
    if (result?.success && result.messageKey) {
      toast.success(t_server(result.messageKey as any));
      setBenefits((prevBenefits) => {
        return prevBenefits.map((benefit) => {
          if (benefit.id === id) {
            return {
              ...benefit,
              title: formData.get("title") as string,
              description: formData.get("description") as string,
              iconName: formData.get("iconName") as string | null,
              iconStyle: formData.get("iconStyle") as string | null,
            };
          }
          return benefit;
        });
      });
      setEditingBenefitId(null);
    } else {
      toast.error(result.error || t_server('genericError'));
      console.error("Failed to update benefit: ", result?.error);
    }
  };

  return (
    <>
    <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={ (isOpen) => !isOpen && setItemToDelete(null) }
        onConfirm={handleDeleteBenefit}
        isPending={isDeleting}
        title={t("deleteBenefitTitle")}
        description={t("deleteBenefitDesc")}
      />
    <Card>
      <CardHeader>
        <CardTitle>{t("benefitsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={addFormAction} className="space-y-6">
          <div>
            <Label htmlFor="title">{t("benefitTitle")}</Label>
            <Input id="title" name="title" type="text" required />
          </div>
          <div>
             <RichTextEditor
              label={t("benefitDescription")}
              name="description"
              initialValue=""
            />
          </div>
          <div>
            <Label htmlFor="iconName">{t("benefitIcon")}</Label>
            <Input id="iconName" name="iconName" type="text" />
          </div>
          <div>
            <Label htmlFor="iconStyle">{t("benefitIconStyle")}</Label>
            <Input id="iconStyle" name="iconStyle" type="text" />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitButton isEditing={false} />
          </div>
        </form>

        <ul id="benefits-list" className="mt-6 space-y-4">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              data-id={benefit.id}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-md transition-all duration-200"
            >
              <span className="drag-handle cursor-move mr-2">☰</span>
              {editingBenefitId === benefit.id ? (
                <form
                  action={(formData) => handleBenefitUpdate(benefit.id, formData)}
                  className="flex-1 flex flex-col space-y-2"
                >
                  <Input
                    type="text"
                    name="title"
                    defaultValue={benefit.title}
                    className="flex-1"
                  />
                  <RichTextEditor
                    label=""
                    name="description"
                    initialValue={benefit.description ?? ""}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="iconName"
                      defaultValue={benefit.iconName ?? ""}
                      className="flex-1"
                      placeholder={t("benefitIcon")}
                    />
                    <Input
                      type="text"
                      name="iconStyle"
                      defaultValue={benefit.iconStyle ?? ""}
                      className="flex-1"
                      placeholder={t("benefitIconStyle")}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <SubmitButton isEditing={true} />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {benefit.title}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm" dangerouslySetInnerHTML={{__html: benefit.description || ''}} />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleEditBenefit(benefit)}
                    >
                      {t("editButton")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => setItemToDelete(benefit.id)}
                    >
                      {t("deleteButton")}
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
    </>
  );
}