"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addMeasurement, updateMeasurement, deleteMeasurement, type MeasurementFormState } from "@/app/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";
import { ZodIssue } from "zod";

interface ManageClientMeasurementsProps {
  clientId: string;
  initialMeasurements: ClientMeasurement[];
}

export default function ManageClientMeasurements({ clientId, initialMeasurements }: ManageClientMeasurementsProps) {
  const [measurements, setMeasurements] = useState<ClientMeasurement[]>(initialMeasurements);
  const initialActionState: MeasurementFormState = { message: "" };

  const addMeasurementActionWrapper = async (state: MeasurementFormState, formData: FormData): Promise<MeasurementFormState> => {
    const result = await addMeasurement(state, formData);
    if (result?.success && result.measurement) {
      // Update the local state with the new measurement
      setMeasurements((prev) => [...prev, result.measurement!]);
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const updateMeasurementActionWrapper = async (state: MeasurementFormState, formData: FormData): Promise<MeasurementFormState> => {
    const result = await updateMeasurement(state, formData);
    if (result?.success && result.measurement) {
      // Update the local state with the updated measurement
      setMeasurements((prev) =>
        prev.map((m) => (m.id === result.measurement!.id ? result.measurement! : m))
      );
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const deleteMeasurementActionWrapper = async (state: { success: boolean; message?: string; error?: string }, measurementId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const result = await deleteMeasurement(state, measurementId);
    if (result?.success) {
      // Remove the deleted measurement from local state
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
      return { ...result }; // Return the full result from the action
    } else {
      return { ...result }; // Return the full result from the action
    }
  };

  const [addMeasurementState, addMeasurementAction] = useFormState<MeasurementFormState, FormData>(
    addMeasurementActionWrapper,
    initialActionState
  );
  const [updateMeasurementState, updateMeasurementAction] = useFormState<MeasurementFormState, FormData>(
    updateMeasurementActionWrapper,
    initialActionState
  );
  const [deleteMeasurementState, deleteMeasurementAction] = useFormState<{ success: boolean; message?: string; error?: string }, string>(
    deleteMeasurementActionWrapper,
    { success: false, message: "" }
  );

  const [customMetrics, setCustomMetrics] = useState([{ name: "", value: "" }]);

  // These handlers are now wrappers for the useFormState actions, accepting formData
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
        {addMeasurementState.error && (
          <p style={{ color: "red" }}>{addMeasurementState.error}</p>
        )}
        {addMeasurementState.success && (
          <p style={{ color: "green" }}>{addMeasurementState.message}</p>
        )}
      </form>

      {/* Measurement List */}
      <h3>Measurements</h3>
      <ul>
        {measurements.map((measurement) => (
          <li key={measurement.id}>
            {new Date(measurement.measurementDate).toLocaleDateString()} - Weight: {measurement.weightKg}kg - Body Fat:{" "}
            {measurement.bodyFatPercentage}%
            {/* Update Measurement Form */}
            <form action={handleUpdateMeasurement}>
              <input type="hidden" name="measurementId" value={measurement.id} />
              <input type="hidden" name="clientId" value={clientId} />
              <label>Measurement Date:</label>
              <input type="date" name="measurementDate" defaultValue={new Date(measurement.measurementDate).toISOString().split('T')[0]} required />
              <label>Weight (kg):</label>
              <input type="number" name="weightKg" step="0.01" defaultValue={measurement.weightKg ?? ''} />
              <label>Body Fat Percentage:</label>
              <input type="number" name="bodyFatPercentage" step="0.01" defaultValue={measurement.bodyFatPercentage ?? ''} />
              <label>Notes:</label>
              <textarea name="notes" defaultValue={measurement.notes ?? ''} />
              <input type="hidden" name="customMetrics" value={JSON.stringify(customMetrics)} />
              <button type="submit">Update</button>
              {updateMeasurementState.error && (
                <p style={{ color: "red" }}>{updateMeasurementState.error}</p>
              )}
              {updateMeasurementState.success && (
                <p style={{ color: "green" }}>{updateMeasurementState.message}</p>
              )}
            </form>
            <form action={() => handleDeleteMeasurement(measurement.id)}>
              <button type="submit">Delete</button>
              {deleteMeasurementState?.error && (
                <p style={{ color: "red" }}>{deleteMeasurementState.error}</p>
              )}
              {deleteMeasurementState?.success && (
                <p style={{ color: "green" }}>{deleteMeasurementState.message}</p>
              )}
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
