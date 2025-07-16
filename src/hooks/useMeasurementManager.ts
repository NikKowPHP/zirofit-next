import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  type MeasurementFormState,
} from "@/app/[locale]/clients/actions/measurement-actions";
import type { ClientMeasurement } from "@/app/[locale]/clients/actions/measurement-actions";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const initialActionState: MeasurementFormState = { message: "", success: false };

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
    if (addState?.success && addState.measurement) {
      setMeasurements((prev) =>
        [...prev, addState.measurement!].sort(
          (a, b) =>
            new Date(b.measurementDate).getTime() -
            new Date(a.measurementDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState?.success && updateState.measurement) {
      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === updateState.measurement!.id ? updateState.measurement! : m,
        ),
      );
    }
  }, [updateState]);

  const handleDelete = async (measurementId: string) => {
    setIsDeleting(true);
    const result = await deleteMeasurement({}, measurementId);
    if (result?.success) {
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
    }
    setIsDeleting(false);
    return result;
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
    isDeleting,
  };
};