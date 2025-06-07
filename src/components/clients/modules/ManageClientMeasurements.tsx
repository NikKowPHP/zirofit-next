"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addMeasurement, updateMeasurement, deleteMeasurement } from "@/app/clients/actions";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface ManageClientMeasurementsProps {
  clientId: string;
  initialMeasurements: PrismaClient["clientMeasurement"][];
}

interface ActionState {
  errors?: {
    clientId?: string[];
    measurementDate?: string[];
    weightKg?: string[];
    bodyFatPercentage?: string[];
    notes?: string[];
    customMetrics?: string[];
    measurementId?: string[];
    form?: string[];
  };
  message: string;
  success?: boolean;
  measurement?: PrismaClient["clientMeasurement"];
}

export default function ManageClientMeasurements({ clientId, initialMeasurements }: ManageClientMeasurementsProps) {
  const [measurements, setMeasurements] = useState<PrismaClient["clientMeasurement"][]>(initialMeasurements);
  const initialActionState: ActionState = { message: "" };

  const addMeasurementActionWrapper = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await addMeasurement(state, formData);
    if (result?.success && result.measurement) {
      return { ...state, success: true, measurement: result.measurement, message: "" };
    } else {
      return { ...state, errors: result?.errors, message: result?.message || "Failed to add measurement" };
    }
  };

  const updateMeasurementActionWrapper = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await updateMeasurement(state, formData);
    if (result?.success && result.measurement) {
      return { ...state, success: true, measurement: result.measurement, message: "" };
    } else {
      return { ...state, errors: result?.errors, message: result?.message || "Failed to update measurement" };
    }
  };

  const deleteMeasurementActionWrapper = async (state: ActionState, measurementId: string): Promise<ActionState> => {
    const result = await deleteMeasurement(state, measurementId);
    if (result?.success) {
      return { ...state, success: true, message: result.message };
    } else {
      return { ...state, message: result?.message || "Failed to delete measurement" };
    }
  };

  const [addMeasurementState, addMeasurementAction] = useFormState<ActionState, FormData>(
    addMeasurementActionWrapper,
    initialActionState
  );
  const [updateMeasurementState, updateMeasurementAction] = useFormState<ActionState, FormData>(
    updateMeasurementActionWrapper,
    initialActionState
  );
  const [deleteMeasurementState, deleteMeasurementAction] = useFormState<ActionState, string>(
    deleteMeasurementActionWrapper,
    initialActionState
  );

  const [customMetrics, setCustomMetrics] = useState([{ name: "", value: "" }]);

  const handleAddMeasurement = async (formData: FormData) => {
    await addMeasurementAction(formData);
  };

  const handleUpdateMeasurement = async (formData: FormData) => {
    await updateMeasurementAction(formData);
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    await deleteMeasurementAction(measurementId);
  };

  const handleAddCustomMetric = () => {
    setCustomMetrics([...customMetrics, { name: "", value: "" }]);
  };

  const handleCustomMetricChange = (index: number, field: "name" | "value", value: string) => {
    const newCustomMetrics = [...customMetrics];
    newCustomMetrics[index][field] = value;
    setCustomMetrics(newCustomMetrics);
  };

  return (
    <div>
      <h2>Manage Measurements</h2>

      {/* Add Measurement Form */}
      <form action={handleAddMeasurement}>
        <input type="hidden" name="clientId" value={clientId} />
        <label>Measurement Date:</label>
        <input type="date" name="measurementDate" required />
        <label>Weight (kg):</label>
        <input type="number" name="weightKg" step="0.01" />
        <label>Body Fat Percentage:</label>
        <input type="number" name="bodyFatPercentage" step="0.01" />
        <label>Notes:</label>
        <textarea name="notes" />

        {/* Custom Metrics */}
        <h3>Custom Metrics</h3>
        {customMetrics.map((metric, index) => (
          <div key={index}>
            <label>Name:</label>
            <input
              type="text"
              value={metric.name}
              onChange={(e) => handleCustomMetricChange(index, "name", e.target.value)}
              name={`customMetrics[${index}][name]`}
            />
            <label>Value:</label>
            <input
              type="text"
              value={metric.value}
              onChange={(e) => handleCustomMetricChange(index, "value", e.target.value)}
              name={`customMetrics[${index}][value]`}
            />
          </div>
        ))}
        <button type="button" onClick={handleAddCustomMetric}>
          Add Custom Metric
        </button>

        <input type="hidden" name="customMetrics" value={JSON.stringify(customMetrics)} />

        <button type="submit">Add Measurement</button>
        {addMeasurementState.errors?.form && (
          <p style={{ color: "red" }}>{addMeasurementState.errors.form}</p>
        )}
      </form>

      {/* Measurement List */}
      <h3>Measurements</h3>
      <ul>
        {measurements.map((measurement) => (
          <li key={measurement.id}>
            {measurement.measurementDate.toLocaleDateString()} - Weight: {measurement.weightKg}kg - Body Fat:{" "}
            {measurement.bodyFatPercentage}%
            {/* Update Measurement Form */}
            <form action={handleUpdateMeasurement}>
              <input type="hidden" name="measurementId" value={measurement.id} />
              <input type="hidden" name="clientId" value={clientId} />
              <label>Measurement Date:</label>
              <input type="date" name="measurementDate" defaultValue={measurement.measurementDate.toISOString().split('T')[0]} required />
              <label>Weight (kg):</label>
              <input type="number" name="weightKg" step="0.01" defaultValue={measurement.weightKg} />
              <label>Body Fat Percentage:</label>
              <input type="number" name="bodyFatPercentage" step="0.01" defaultValue={measurement.bodyFatPercentage} />
              <label>Notes:</label>
              <textarea name="notes" defaultValue={measurement.notes} />
              <input type="hidden" name="customMetrics" value={JSON.stringify(customMetrics)} />
              <button type="submit">Update</button>
              {updateMeasurementState.errors?.form && (
                <p style={{ color: "red" }}>{updateMeasurementState.errors.form}</p>
              )}
            </form>
            <form action={(id) => handleDeleteMeasurement(measurement.id)}>
              <button type="submit">Delete</button>
              {deleteMeasurementState?.message && (
                <p style={{ color: "red" }}>{deleteMeasurementState.message}</p>
              )}
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}