"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  type MeasurementFormState,
} from "@/app/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";
import { Button, Input, Textarea } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ManageClientMeasurementsProps {
  clientId: string;
  initialMeasurements: ClientMeasurement[];
}

export default function ManageClientMeasurements({
  clientId,
  initialMeasurements,
}: ManageClientMeasurementsProps) {
  const [measurements, setMeasurements] =
    useState<ClientMeasurement[]>(initialMeasurements);
  const [editingMeasurementId, setEditingMeasurementId] = useState<
    string | null
  >(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialActionState: MeasurementFormState = { message: "" };

  const [addState, addAction] = useFormState(
    addMeasurement,
    initialActionState,
  );
  const [updateState, updateAction] = useFormState(
    updateMeasurement,
    initialActionState,
  );

  const isEditing = !!editingMeasurementId;

  useEffect(() => {
    if (addState.success && addState.measurement) {
      setMeasurements((prev) =>
        [...prev, addState.measurement!].sort(
          (a, b) =>
            new Date(b.measurementDate).getTime() -
            new Date(a.measurementDate).getTime(),
        ),
      );
      formRef.current?.reset();
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.measurement) {
      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === updateState.measurement!.id ? updateState.measurement! : m,
        ),
      );
      setEditingMeasurementId(null);
    }
  }, [updateState]);

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      const result = await deleteMeasurement({}, measurementId);
      if (result?.success) {
        setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
      } else {
        alert(result?.error || "Failed to delete measurement.");
      }
    }
  };

  const handleEditClick = (measurement: ClientMeasurement) => {
    setEditingMeasurementId(measurement.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelEdit = () => {
    setEditingMeasurementId(null);
  };

  const currentFormState = isEditing ? updateState : addState;
  const currentEditingMeasurement = isEditing
    ? measurements.find((m) => m.id === editingMeasurementId)
    : null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Measurements
      </h2>

      {/* Add/Edit Measurement Form */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          {isEditing && currentEditingMeasurement
            ? `Editing Measurement from ${new Date(currentEditingMeasurement.measurementDate).toLocaleDateString()}`
            : "Add New Measurement"}
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
              value={editingMeasurementId}
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
              placeholder="Weight (kg)"
              defaultValue={
                isEditing ? String(currentEditingMeasurement?.weightKg ?? "") : ""
              }
            />
            <Input
              type="number"
              name="bodyFatPercentage"
              step="0.01"
              placeholder="Body Fat %"
              defaultValue={
                isEditing
                  ? String(currentEditingMeasurement?.bodyFatPercentage ?? "")
                  : ""
              }
            />
          </div>
          <Textarea
            name="notes"
            placeholder="Notes..."
            defaultValue={isEditing ? currentEditingMeasurement?.notes ?? "" : ""}
          />

          <div className="flex gap-2">
            <Button type="submit">
              {isEditing ? "Update" : "Add"} Measurement
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

          {currentFormState.error && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {currentFormState.error}
            </div>
          )}
        </form>
      </div>

      {/* Measurement List */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Existing Measurements
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
                    {new Date(measurement.measurementDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {measurement.weightKg != null &&
                      `Weight: ${measurement.weightKg}kg`}
                    {measurement.weightKg != null &&
                      measurement.bodyFatPercentage != null &&
                      ` | `}
                    {measurement.bodyFatPercentage != null &&
                      `Body Fat: ${measurement.bodyFatPercentage}%`}
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
                    onClick={() => handleEditClick(measurement)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMeasurement(measurement.id)}
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
  );
}