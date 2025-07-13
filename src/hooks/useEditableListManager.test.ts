// src/hooks/useEditableListManager.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEditableList } from './useEditableListManager';

const mockAddAction = jest.fn(async (prevState, formData) => ({ success: true, newItem: { id: '3', label: formData.get('label'), createdAt: new Date() } }));
const mockUpdateAction = jest.fn(async (prevState, formData) => ({ success: true, updatedItem: { id: formData.get('itemId'), label: formData.get('label'), createdAt: new Date() } }));
const mockDeleteAction = jest.fn(async (id) => ({ success: true, deletedId: id }));

const initialItems = [
  { id: '1', label: 'Item 1', createdAt: new Date('2025-01-01') },
  { id: '2', label: 'Item 2', createdAt: new Date('2025-01-02') },
] as any[];

describe('useEditableList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with items sorted by creation date', () => {
    const { result } = renderHook(() => useEditableList({
      initialItems: initialItems.slice().reverse(), // provide unsorted
      addAction: mockAddAction,
      updateAction: mockUpdateAction,
      deleteAction: mockDeleteAction,
    }));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe('1');
  });

  it('toggles editing mode', () => {
    const { result } = renderHook(() => useEditableList({ initialItems, addAction: mockAddAction, updateAction: mockUpdateAction, deleteAction: mockDeleteAction }));
    
    act(() => {
      result.current.handleEdit(initialItems[0]);
    });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingItemId).toBe('1');

    act(() => {
      result.current.handleCancelEdit();
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingItemId).toBeNull();
  });

  it('handles delete operation and optimistically updates state', async () => {
    global.confirm = () => true;
    const { result } = renderHook(() => useEditableList({ initialItems, addAction: mockAddAction, updateAction: mockUpdateAction, deleteAction: mockDeleteAction }));

    await act(async () => {
      await result.current.handleDelete('1');
    });

    expect(mockDeleteAction).toHaveBeenCalledWith('1');
    expect(result.current.items.find(i => i.id === '1')).toBeUndefined();
  });
});