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
      setMeasurements((prev) => [...prev, result.measurement!]);
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
  const [updateMeasurementState, updateMeasurementAction] = useFormState<
    MeasurementFormState,
    FormData
  >(updateMeasurementActionWrapper, initialActionState);
  const [, deleteMeasurementAction] = useFormState<
    { success: boolean; message?: string; error?: string },
    string
  >(deleteMeasurementActionWrapper, { success: false, message: "" });

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

  const handleCustomMetricChange = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const newCustomMetrics = [...customMetrics];
    newCustomMetrics[index][field] = value;
    setCustomMetrics(newCustomMetrics);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Manage Measurements
      </h2>

      {/* Add Measurement Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Measurement
        </h3>
        <form action={handleAddMeasurement} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Measurement Date
              </label>
              <input
                type="date"
                name="measurementDate"
                required
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Body Fat Percentage
              </label>
              <input
                type="number"
                name="bodyFatPercentage"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              name="notes"
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Custom Metrics */}
          <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
              Custom Metrics
            </h3>
            {customMetrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={metric.name}
                    onChange={(e) =>
                      handleCustomMetricChange(index, "name", e.target.value)
                    }
                    name={`customMetrics[${index}][name]`}
                    className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Value
                  </label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) =>
                      handleCustomMetricChange(index, "value", e.target.value)
                    }
                    name={`customMetrics[${index}][value]`}
                    className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCustomMetric}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Add Custom Metric
            </button>
          </div>

          <input
            type="hidden"
            name="customMetrics"
            value={JSON.stringify(customMetrics)}
          />

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Add Measurement
          </button>
          
          {addMeasurementState.error && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {addMeasurementState.error}
            </div>
          )}
          {addMeasurementState.success && (
            <div className="mt-2 p-2 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-200 dark:text-green-800">
              {addMeasurementState.message}
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
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(measurement.measurementDate).toLocaleDateString()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Weight: {measurement.weightKg}kg - Body Fat:{" "}
                    {measurement.bodyFatPercentage}%
                  </p>
                </div>
                <div className="flex space-x-2">
                  <form action={() => handleDeleteMeasurement(measurement.id)}>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <form action={handleUpdateMeasurement} className="space-y-4">
                <input
                  type="hidden"
                  name="measurementId"
                  value={measurement.id}
                />
                <input type="hidden" name="clientId" value={clientId} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Measurement Date
                    </label>
                    <input
                      type="date"
                      name="measurementDate"
                      defaultValue={
                        new Date(measurement.measurementDate)
                          .toISOString()
                          .split("T")[0]
                      }
                      required
                      className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weightKg"
                      step="0.01"
                      defaultValue={measurement.weightKg ?? ""}
                      className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Body Fat Percentage
                    </label>
                    <input
                      type="number"
                      name="bodyFatPercentage"
                      step="0.01"
                      defaultValue={measurement.bodyFatPercentage ?? ""}
                      className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={measurement.notes ?? ""}
                    className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <input
                  type="hidden"
                  name="customMetrics"
                  value={JSON.stringify(customMetrics)}
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Update
                  </button>
                </div>
                
                {updateMeasurementState.error && (
                  <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
                    {updateMeasurementState.error}
                  </div>
                )}
                {updateMeasurementState.success && (
                  <div className="mt-2 p-2 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-200 dark:text-green-800">
                    {updateMeasurementState.message}
                  </div>
                )}
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
