import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  type MeasurementFormState,
} from "@/app/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";

interface UseMeasurementManagerProps {
  initialMeasurements: ClientMeasurement[];
}

/**
 * Custom hook to manage client measurements state and actions.
 * @param {UseMeasurementManagerProps} props - The initial measurements for the client.
 * @returns An object with state and handlers for managing measurements.
 */
export const useMeasurementManager = ({
  initialMeasurements,
}: UseMeasurementManagerProps) => {
  const [measurements, setMeasurements] =
    useState<ClientMeasurement[]>(initialMeasurements);
  const [editingMeasurementId, setEditingMeasurementId] = useState<
    string | null
  >(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialActionState: MeasurementFormState = { message: "" };

  const [addState, addAction] = useActionState(
    addMeasurement,
    initialActionState,
  );
  const [updateState, updateAction] = useActionState(
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

  const handleDelete = async (measurementId: string) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      const result = await deleteMeasurement({}, measurementId);
      if (result?.success) {
        setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
      } else {
        alert(result?.error || "Failed to delete measurement.");
      }
    }
  };

  const handleEdit = (measurement: ClientMeasurement) => {
    setEditingMeasurementId(measurement.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelEdit = () => {
    setEditingMeasurementId(null);
  };

  const currentEditingMeasurement = isEditing
    ? measurements.find((m) => m.id === editingMeasurementId)
    : null;

  return {
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
  };
};