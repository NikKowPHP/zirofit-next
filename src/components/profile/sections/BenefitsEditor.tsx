// src/components/profile/sections/BenefitsEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import {
  addBenefit,
  updateBenefit,
  deleteBenefit,
  updateBenefitOrder,
} from "@/app/profile/actions/benefit-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "../../ui";
import type { Benefit } from "@prisma/client";
import SortableJS from "sortablejs";
import { RichTextEditor } from "../../ui/RichTextEditor";

interface BenefitsEditorProps {
  initialBenefits: Benefit[];
}

interface BenefitFormState {
  message?: string | null;
  error?: string | null;
  success?: boolean;
}

const initialFormState: BenefitFormState = {
  message: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Benefit"}
    </Button>
  );
}

export default function BenefitsEditor({
  initialBenefits,
}: BenefitsEditorProps) {
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [formState, formAction] = useActionState(addBenefit, initialFormState);

  useEffect(() => {
    const sortable = new SortableJS(
      document.getElementById("benefits-list") as HTMLElement,
      {
        handle: ".drag-handle",
        onEnd: () => {
          const newOrder = Array.from(
            document.getElementById("benefits-list")?.children || [],
          )
            .map((item) => (item as HTMLElement).dataset.id)
            .filter((id): id is string => id !== undefined);
          updateBenefitOrder(newOrder);
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
  }, []);

  const handleEditBenefit = (benefit: Benefit) => {
    setEditingBenefitId(benefit.id);
  };

  const handleCancelEdit = () => {
    setEditingBenefitId(null);
  };

  const handleDeleteBenefit = async (id: string) => {
    try {
      await deleteBenefit(id);
      setBenefits((prevBenefits) =>
        prevBenefits.filter((benefit) => benefit.id !== id),
      );
    } catch (e: unknown) {
      console.error("Failed to delete benefit: ", e);
    }
  };

  const handleBenefitUpdate = async (id: string, formData: FormData) => {
    const result = await updateBenefit(id, undefined, formData);
    if (result?.success) {
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
      console.error("Failed to update benefit: ", result?.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        {formState?.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md">
            {formState.message}
          </div>
        )}
        {formState?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md">
            {formState.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" type="text" required />
          </div>
          <div>
            <RichTextEditor
              label="Description (Optional)"
              name="description"
              initialValue=""
            />
          </div>
          <div>
            <Label htmlFor="iconName">Icon Name</Label>
            <Input id="iconName" name="iconName" type="text" />
          </div>
          <div>
            <Label htmlFor="iconStyle">Icon Style</Label>
            <Input id="iconStyle" name="iconStyle" type="text" />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitButton />
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
                  className="flex-1 flex items-center space-x-2"
                >
                  <Input
                    type="text"
                    name="title"
                    defaultValue={benefit.title}
                    className="flex-1"
                  />
                  <div className="flex-1">
                    <RichTextEditor
                      label=""
                      name="description"
                      initialValue={benefit.description ?? ""}
                    />
                  </div>
                  <Input
                    type="text"
                    name="iconName"
                    defaultValue={benefit.iconName ?? ""}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    name="iconStyle"
                    defaultValue={benefit.iconStyle ?? ""}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Update
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {benefit.title}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {benefit.description}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleEditBenefit(benefit)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteBenefit(benefit.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}