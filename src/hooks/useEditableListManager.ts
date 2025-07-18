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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [addState, serverAddFormAction] = useFormState(addAction, initialActionState);
  const [updateState, updateFormAction] = useFormState(updateAction, initialActionState);
  const [optimisticTempId, setOptimisticTempId] = useState<string | null>(null);

  const isEditing = !!editingItemId;
  const currentEditingItem = isEditing
    ? items.find((item) => item.id === editingItemId)
    : null;

  const addFormAction = (formData: FormData) => {
    const tempId = `temp-${Date.now()}`;
    setOptimisticTempId(tempId);

    const tempItemData: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        tempItemData[key] = value;
      }
    });

    const optimisticItem = {
      id: tempId,
      createdAt: new Date(),
      ...tempItemData,
    } as T;
    
    setItems((current) =>
      [...current, optimisticItem].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    
    serverAddFormAction(formData);
  };

  useEffect(() => {
    if (addState?.success) {
      const newItemKey = Object.keys(addState).find((k) => k.startsWith("new"));
      if (newItemKey && addState[newItemKey] && optimisticTempId) {
        const newItem = addState[newItemKey] as T;
        setItems((current) =>
          current.map((item) => (item.id === optimisticTempId ? newItem : item))
        );
        setOptimisticTempId(null);
        formRef.current?.reset();
      }
    } else if (addState?.error && optimisticTempId) {
      setItems((current) => current.filter((item) => item.id !== optimisticTempId));
      setOptimisticTempId(null);
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
    setItems((current) => current.filter((i) => i.id !== id));

    try {
      const result = await deleteAction(id);
      
      if (!result.success) {
        if (isMounted.current) {
          setItems(originalItems);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete action failed:", error);
      if (isMounted.current) {
        setItems(originalItems);
      }
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
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