"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import {
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/app/profile/actions/testimonial-actions";
import { revalidateProfilePath } from "@/app/profile/revalidate";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";

interface Testimonial {
  id: string;
  clientName: string;
  testimonialText: string;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
}

type FormState = {
  success: boolean;
  error: string | null;
  message?: string | null;
  newTestimonial?: Testimonial;
  updatedTestimonial?: Testimonial;
};

type FormAction = (
  prevState: FormState,
  formData: FormData,
) => Promise<FormState>;

const initialAddState: FormState = {
  success: false,
  error: null,
};

const initialUpdateState: FormState = {
  success: false,
  error: null,
};

export default function TestimonialsEditor({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);
  const [editingTestimonialId, setEditingTestimonialId] = useState<
    string | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, addFormAction] = useFormState<FormState, FormData>(
    addTestimonial as FormAction,
    initialAddState,
  );

  const [updateState, updateFormAction] = useFormState<FormState, FormData>(
    (prevState, formData) =>
      updateTestimonial(
        editingTestimonialId || "",
        prevState,
        formData,
      ) as Promise<FormState>,
    initialUpdateState,
  );

  useServerActionToast({
    formState: addState,
    onSuccess: () => {
      formRef.current?.reset();
    },
  });

  useServerActionToast({
    formState: updateState,
    onSuccess: () => {
      setEditingTestimonialId(null);
    },
  });

  const isEditing = !!editingTestimonialId;

  const handleStartEdit = (testimonial: Testimonial) => {
    setEditingTestimonialId(testimonial.id);
  };

  const handleCancelEdit = () => {
    setEditingTestimonialId(null);
    formRef.current?.reset();
  };

  // Effect for add testimonial
  useEffect(() => {
    const handleEffect = async () => {
      if (addState?.success && addState?.newTestimonial) {
        setTestimonials((current) =>
          [addState.newTestimonial!, ...current].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
        await revalidateProfilePath();
      }
    };
    handleEffect();
  }, [addState?.success, addState?.newTestimonial]);

  // Effect for update testimonial
  useEffect(() => {
    const handleEffect = async () => {
      if (updateState?.success && updateState?.updatedTestimonial) {
        setTestimonials((current) =>
          current
            .map((t) =>
              t.id === updateState.updatedTestimonial!.id
                ? updateState.updatedTestimonial!
                : t,
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
        );
        await revalidateProfilePath();
      }
    };
    handleEffect();
  }, [updateState?.success, updateState?.updatedTestimonial]);

  const handleDeleteTestimonial = async (testimonialId: string) => {
    setDeletingId(testimonialId);
    const result = await deleteTestimonial(testimonialId, undefined);
    if (result?.success && result?.deletedId) {
      toast.success(result.message || "Testimonial deleted.");
      setTestimonials((current) =>
        current.filter((t) => t.id !== result?.deletedId),
      );
      await revalidateProfilePath();
    } else if (result?.error) {
      toast.error(result.error);
    }
    setDeletingId(null);
  };

  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (_fieldName: "clientName" | "testimonialText") => {
    return currentFormState?.error
      ? currentFormState?.error?.toString()
      : undefined;
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeleteTestimonial(itemToDelete);
            setItemToDelete(null);
          }
        }}
        isPending={!!deletingId}
        title="Delete Testimonial"
        description="Are you sure you want to permanently delete this testimonial?"
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Testimonial" : "Add Testimonial"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            action={isEditing ? updateFormAction : addFormAction}
            className="space-y-4"
            key={editingTestimonialId || "add"}
          >
            <div className="grid gap-4">
              <Input
                name="clientName"
                placeholder="Client name"
                defaultValue={
                  isEditing
                    ? testimonials.find((t) => t.id === editingTestimonialId)
                        ?.clientName
                    : ""
                }
                className={getFieldError("clientName") ? "border-red-500" : ""}
              />
              <RichTextEditor
                label="Testimonial Text"
                name="testimonialText"
                initialValue={
                  isEditing
                    ? testimonials.find((t) => t.id === editingTestimonialId)
                        ?.testimonialText ?? ""
                    : ""
                }
                className={
                  getFieldError("testimonialText")
                    ? "border border-red-500 rounded-md"
                    : ""
                }
              />
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  {isEditing ? "Update" : "Add"} Testimonial
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="space-y-2 mt-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-md transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {testimonial.clientName}
                    </h4>
                    <div
                      className="text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: testimonial.testimonialText,
                      }}
                    />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartEdit(testimonial)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(testimonial.id)}
                      disabled={deletingId === testimonial.id}
                    >
                      {deletingId === testimonial.id ? (
                        "..."
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}