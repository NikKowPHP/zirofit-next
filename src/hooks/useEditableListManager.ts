
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
) => Promise<{ success: boolean; deletedId?: string; error?: string; messageKey?: string }>;

interface UseEditableListProps<T extends Item> {
  initialItems: T[];
  addAction: AddAction<T>;
  updateAction: UpdateAction<T>;
  deleteAction: DeleteAction;
}

const initialActionState = { success: false };

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
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, serverAddFormAction] = useFormState(addAction, initialActionState);
  const [updateState, updateFormAction] = useFormState(updateAction, initialActionState);
  const [optimisticTempId, setOptimisticTempId] = useState<string | null>(null);

  const isEditing = !!editingItemId;
  const currentEditingItem = isEditing
    ? items.find((item) => item.id === editingItemId)
    : null;

  // The form's action will call this function.
  const addFormAction = (formData: FormData) => {
    const tempId = `temp-${Date.now()}`;
    setOptimisticTempId(tempId);

    const tempItemData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      // Only include string values to avoid issues with File objects in optimistic state
      if (typeof value === 'string') {
        tempItemData[key] = value;
      }
    }

    const optimisticItem = {
      id: tempId,
      createdAt: new Date(),
      ...tempItemData,
    } as T;
    
    // Optimistically add to the list
    setItems((current) =>
      [...current, optimisticItem].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    
    // Call the server action
    serverAddFormAction(formData);
  };

  useEffect(() => {
    if (addState?.success) {
      const newItemKey = Object.keys(addState).find((k) => k.startsWith("new"));
      if (newItemKey && addState[newItemKey] && optimisticTempId) {
        const newItem = addState[newItemKey] as T;
        // Replace temp item with the one from the server
        setItems((current) =>
          current.map((item) => (item.id === optimisticTempId ? newItem : item))
        );
        setOptimisticTempId(null);
        formRef.current?.reset(); // Reset form on success
      }
    } else if (addState?.error && optimisticTempId) {
      // Server action failed, remove the optimistic item
      setItems((current) => current.filter((item) => item.id !== optimisticTempId));
      setOptimisticTempId(null);
      // The error toast will be shown by useServerActionToast hook in the component
    }
  }, [addState, optimisticTempId]);

  useEffect(() => {
    if (updateState?.success) {
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
    const originalItems = items;
    setDeletingId(id);
    // Optimistically update UI
    setItems((current) => current.filter((i) => i.id !== id));

    const result = await deleteAction(id);
    
    // If server action fails, revert the state
    if (!result.success) {
      setItems(originalItems);
    }
    setDeletingId(null);
    return result;
  };

  return {
    items,
    editingItemId,
    deletingId,
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