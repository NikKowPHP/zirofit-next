// src/hooks/useMeasurementManager.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMeasurementManager } from './useMeasurementManager';
import * as actions from '@/app/clients/actions/measurement-actions';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn((action, initialState) => [initialState, jest.fn()]),
}));
jest.mock('@/app/clients/actions/measurement-actions', () => ({
  addMeasurement: jest.fn(),
  updateMeasurement: jest.fn(),
  deleteMeasurement: jest.fn(),
}));

const mockInitialMeasurements = [
  { id: '1', measurementDate: new Date('2025-01-01'), weightKg: 80 },
  { id: '2', measurementDate: new Date('2025-01-02'), weightKg: 79 },
] as any[];

describe('useMeasurementManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with initial measurements', () => {
    const { result } = renderHook(() => useMeasurementManager({ initialMeasurements: mockInitialMeasurements }));
    expect(result.current.measurements).toHaveLength(2);
  });

  it('should handle editing state', () => {
    const { result } = renderHook(() => useMeasurementManager({ initialMeasurements: mockInitialMeasurements }));
    
    act(() => {
      result.current.handleEdit(mockInitialMeasurements[0]);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingMeasurementId).toBe('1');

    act(() => {
      result.current.handleCancelEdit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingMeasurementId).toBeNull();
  });

  it('should handle deleting a measurement', async () => {
    (actions.deleteMeasurement as jest.Mock).mockResolvedValue({ success: true, deletedId: '1' });
    const { result } = renderHook(() => useMeasurementManager({ initialMeasurements: mockInitialMeasurements }));

    global.confirm = () => true;

    await act(async () => {
      await result.current.handleDelete('1');
    });

    expect(actions.deleteMeasurement).toHaveBeenCalledWith({}, '1');
    expect(result.current.measurements.find(m => m.id === '1')).toBeUndefined();
  });
});