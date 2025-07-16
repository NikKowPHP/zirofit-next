
// src/hooks/useSessionLogManager.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSessionLogManager } from './useSessionLogManager';
import * as actions from '@/app/[locale]/clients/actions';

jest.mock('@/app/[locale]/clients/actions', () => ({
  addSessionLog: jest.fn(),
  updateSessionLog: jest.fn(),
  deleteSessionLog: jest.fn(),
}));

const mockInitialLogs = [
  { id: '1', sessionDate: new Date('2025-01-01'), activitySummary: 'Log 1' },
  { id: '2', sessionDate: new Date('2025-01-02'), activitySummary: 'Log 2' },
] as any[];

describe('useSessionLogManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with initial logs', () => {
    const { result } = renderHook(() => useSessionLogManager({ initialSessionLogs: mockInitialLogs, clientId: 'c1' }));
    expect(result.current.sessionLogs).toHaveLength(2);
  });

  it('should handle editing state', () => {
    const { result } = renderHook(() => useSessionLogManager({ initialSessionLogs: mockInitialLogs, clientId: 'c1' }));

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingSessionLogId).toBeNull();

    act(() => {
      result.current.handleEdit(mockInitialLogs[0]);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingSessionLogId).toBe('1');

    act(() => {
      result.current.handleCancelEdit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingSessionLogId).toBeNull();
  });

  it('should handle deleting a log', async () => {
    (actions.deleteSessionLog as jest.Mock).mockResolvedValue({ success: true, deletedId: '1' });
    const { result } = renderHook(() => useSessionLogManager({ initialSessionLogs: mockInitialLogs, clientId: 'c1' }));

    global.confirm = () => true;

    await act(async () => {
      await result.current.handleDelete('1');
    });

    expect(actions.deleteSessionLog).toHaveBeenCalledWith('1');
    expect(result.current.sessionLogs.find(log => log.id === '1')).toBeUndefined();
  });
});