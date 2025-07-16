
"use client";

import { useMeasurementManager } from "@/hooks/useMeasurementManager";
import type { ClientMeasurement } from "@/app/[locale]/clients/actions/measurement-actions";
import { Button, Input, Textarea } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface ManageClientMeasurementsProps {
  clientId: string;
  initialMeasurements: ClientMeasurement[];
}

export default function ManageClientMeasurements({
  clientId,
  initialMeasurements,
}: ManageClientMeasurementsProps) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const {
    measurements,
    editingMeasurementId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingMeasurement,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    isDeleting,
  } = useMeasurementManager({ initialMeasurements });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useServerActionToast({
    formState: addState,
    onSuccess: () => formRef.current?.reset(),
  });
  useServerActionToast({
    formState: updateState,
    onSuccess: handleCancelEdit,
  });

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const result = await handleDelete(itemToDelete);
      if (result?.success) {
        toast.success(result.message || t("measurements_deleted"));
      } else {
        toast.error(result?.error || t("measurements_failDelete"));
      }
      setItemToDelete(null);
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
        title={t("measurements_deleteTitle")}
        description={t("measurements_deleteDesc")}
      />
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t("measurements_manage")}
        </h2>

        {/* Add/Edit Measurement Form */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {isEditing && currentEditingMeasurement
              ? t("measurements_addEditTitle_edit", {
                  date: new Date(
                    currentEditingMeasurement.measurementDate,
                  ).toLocaleDateString(locale),
                })
              : t("measurements_addEditTitle_add")}
          </h3>
          <form
            ref={formRef}
            action={isEditing ? updateAction : addAction}
            className="space-y-4"
            key={editingMeasurementId || "add"}
          >
            <input type="hidden" name="clientId" value={clientId} />
            {isEditing && (
              <input
                type="hidden"
                name="measurementId"
                value={editingMeasurementId ?? ""}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                name="measurementDate"
                required
                defaultValue={
                  isEditing && currentEditingMeasurement
                    ? new Date(currentEditingMeasurement.measurementDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
              />
              <Input
                type="number"
                name="weightKg"
                step="0.01"
                placeholder={t("measurements_weight_kg")}
                defaultValue={
                  isEditing && currentEditingMeasurement
                    ? String(currentEditingMeasurement.weightKg ?? "")
                    : ""
                }
              />
              <Input
                type="number"
                name="bodyFatPercentage"
                step="0.01"
                placeholder={t("measurements_bodyFat")}
                defaultValue={
                  isEditing && currentEditingMeasurement
                    ? String(currentEditingMeasurement.bodyFatPercentage ?? "")
                    : ""
                }
              />
            </div>
            <Textarea
              name="notes"
              placeholder={t("measurements_notes")}
              defaultValue={
                isEditing && currentEditingMeasurement
                  ? currentEditingMeasurement.notes ?? ""
                  : ""
              }
            />

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing
                  ? t("measurements_updateButton")
                  : t("measurements_addButton")}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  {t("measurements_cancelButton")}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Measurement List */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {t("measurements_existing")}
          </h3>
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {new Date(
                        measurement.measurementDate,
                      ).toLocaleDateString(locale)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {measurement.weightKg != null &&
                        `${t("measurements_weight_kg")}: ${measurement.weightKg}`}
                      {measurement.weightKg != null &&
                        measurement.bodyFatPercentage != null &&
                        ` | `}
                      {measurement.bodyFatPercentage != null &&
                        `${t("measurements_bodyFat")}: ${measurement.bodyFatPercentage}`}
                    </div>
                    {measurement.notes && (
                      <p className="text-sm mt-1">{measurement.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(measurement)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(measurement.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}