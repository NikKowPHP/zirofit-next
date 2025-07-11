"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  type MeasurementFormState,
} from "@/app/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";
import { Button, Input, Textarea } from "@/components/ui";

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
  const initialActionState: MeasurementFormState = { message: "" };

  const addMeasurementActionWrapper = async (
    state: MeasurementFormState,
    formData: FormData,
  ): Promise<MeasurementFormState> => {
    const result = await addMeasurement(state, formData);
    if (result?.success && result.measurement) {
      // Update the local state with the new measurement
      setMeasurements((prev) => [...prev, result.measurement!].sort((a,b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()));
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const updateMeasurementActionWrapper = async (
    state: MeasurementFormState,
    formData: FormData,
  ): Promise<MeasurementFormState> => {
    const result = await updateMeasurement(state, formData);
    if (result?.success && result.measurement) {
      // Update the local state with the updated measurement
      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === result.measurement!.id ? result.measurement! : m,
        ),
      );
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const deleteMeasurementActionWrapper = async (
    state: { success: boolean; message?: string; error?: string },
    measurementId: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const result = await deleteMeasurement(state, measurementId);
    if (result?.success) {
      // Remove the deleted measurement from local state
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const [addMeasurementState, addMeasurementAction] = useFormState<
    MeasurementFormState,
    FormData
  >(addMeasurementActionWrapper, initialActionState);
  
  const [, deleteMeasurementAction] = useFormState<
    { success: boolean; message?: string; error?: string },
    string
  >(deleteMeasurementActionWrapper, { success: false, message: "" });


  const handleDeleteMeasurement = async (measurementId: string) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      await deleteMeasurementAction(measurementId);
    }
  };


  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Measurements
      </h2>

      {/* Add Measurement Form */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Measurement
        </h3>
        <form action={addMeasurementAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" name="measurementDate" required />
            <Input type="number" name="weightKg" step="0.01" placeholder="Weight (kg)" />
            <Input type="number" name="bodyFatPercentage" step="0.01" placeholder="Body Fat %" />
          </div>
          <Textarea name="notes" placeholder="Notes..." />

          <Button type="submit">Add Measurement</Button>

          {addMeasurementState.error && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {addMeasurementState.error}
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
            <form
              key={measurement.id}
              action={updateMeasurementActionWrapper}
              className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 space-y-4"
            >
              <input
                type="hidden"
                name="measurementId"
                value={measurement.id}
              />
              <input type="hidden" name="clientId" value={clientId} />

              <div className="flex justify-between items-start">
                 <Input
                    type="date"
                    name="measurementDate"
                    defaultValue={new Date(measurement.measurementDate).toISOString().split("T")[0]}
                    required
                    className="max-w-xs"
                  />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteMeasurement(measurement.id)}
                >
                  Delete
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    name="weightKg"
                    step="0.01"
                    defaultValue={measurement.weightKg ?? ""}
                    placeholder="Weight (kg)"
                  />
                  <Input
                    type="number"
                    name="bodyFatPercentage"
                    step="0.01"
                    defaultValue={measurement.bodyFatPercentage ?? ""}
                    placeholder="Body Fat %"
                  />
              </div>

              <Textarea
                name="notes"
                defaultValue={measurement.notes ?? ""}
                placeholder="Notes..."
              />

              <div className="flex justify-end space-x-2">
                <Button type="submit" size="sm">Update</Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
