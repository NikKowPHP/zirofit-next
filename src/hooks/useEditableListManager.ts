import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";

type Item = { id: string; createdAt: Date; [key: string]: any };

type AddAction<T extends Item> = (
  prevState: any,
  formData: FormData,
) => Promise<any>;
type UpdateAction<T extends Item> = (
  prevState: any,
  formData: FormData,
) => Promise<any>;
type DeleteAction = (
  id: string,
) => Promise<{ success: boolean; deletedId?: string; error?: string }>;

interface UseEditableListProps<T extends Item> {
  initialItems: T[];
  addAction: AddAction<T>;
  updateAction: UpdateAction<T>;
  deleteAction: DeleteAction;
}

/**
 * Manages the state and actions for a list of editable items.
 * Handles adding, updating, and deleting items with optimistic UI updates.
 * @template T The type of items in the list, must extend a base Item type.
 * @param {UseEditableListProps<T>} props - The initial items and server actions.
 * @returns An object containing the list state and handlers.
 */
export function useEditableList<T extends Item>({
  initialItems,
  addAction,
  updateAction,
  deleteAction,
}: UseEditableListProps<T>) {
  const [items, setItems] = useState<T[]>(() =>
    [...initialItems].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, addFormAction] = useFormState(addAction, {});
  const [updateState, updateFormAction] = useFormState(updateAction, {});

  const isEditing = !!editingItemId;
  const currentEditingItem = isEditing
    ? items.find((item) => item.id === editingItemId)
    : null;

  useEffect(() => {
    if (addState.success) {
      const newItemKey = Object.keys(addState).find((k) => k.startsWith("new"));
      if (newItemKey && addState[newItemKey]) {
        const newItem = addState[newItemKey] as T;
        setItems((current) =>
          [...current, newItem].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        );
        formRef.current?.reset();
      }
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success) {
      const updatedItemKey = Object.keys(updateState).find((k) =>
        k.startsWith("updated"),
      );
      if (updatedItemKey && updateState[updatedItemKey]) {
        const updatedItem = updateState[updatedItemKey] as T;
        setItems((current) =>
          current
            .map((item) => (item.id === updatedItem.id ? updatedItem : item))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
        );
        setEditingItemId(null);
      }
    }
  }, [updateState]);

  const handleEdit = (item: T) => setEditingItemId(item.id);
  const handleCancelEdit = () => setEditingItemId(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteAction(id);
    if (result.success && result.deletedId) {
      setItems((current) => current.filter((i) => i.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  return {
    items,
    editingItemId,
    deletingId,
    deleteError,
    formRef,
    addState,
    addFormAction,
    updateState,
    updateFormAction,
    isEditing,
    currentEditingItem,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  };
}