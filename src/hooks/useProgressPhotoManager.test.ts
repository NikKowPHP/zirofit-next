
import { renderHook, act } from '@testing-library/react';
import { useProgressPhotoManager } from './useProgressPhotoManager';
import * as actions from '@/app/[locale]/clients/actions/photo-actions';

jest.mock('@/app/[locale]/clients/actions/photo-actions', () => ({
  addProgressPhoto: jest.fn(),
  deleteProgressPhoto: jest.fn(),
}));

const mockInitialPhotos = [
  { id: '1', photoDate: new Date('2025-01-01'), imagePath: '/img1.jpg' },
  { id: '2', photoDate: new Date('2025-01-02'), imagePath: '/img2.jpg' },
] as any[];

describe('useProgressPhotoManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with initial photos', () => {
    const { result } = renderHook(() => useProgressPhotoManager({ initialProgressPhotos: mockInitialPhotos }));
    expect(result.current.progressPhotos).toHaveLength(2);
  });

  it('should handle deleting a photo', async () => {
    (actions.deleteProgressPhoto as jest.Mock).mockResolvedValue({ success: true, deletedId: '1' });
    const { result } = renderHook(() => useProgressPhotoManager({ initialProgressPhotos: mockInitialPhotos }));

    global.confirm = () => true;

    await act(async () => {
      await result.current.handleDelete('1');
    });
    
    expect(actions.deleteProgressPhoto).toHaveBeenCalled();
  });
});