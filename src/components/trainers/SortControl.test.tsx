import { renderWithIntl, screen, fireEvent } from '@/tests/test-utils';
import '@testing-library/jest-dom';
import SortControl from './SortControl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

describe('SortControl', () => {
  it('should render the label and default value', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUsePathname.mockReturnValue('/trainers');
    
    renderWithIntl(<SortControl />);
    
    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('name_asc');
  });

  it('should update URL search params on selection change', () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUsePathname.mockReturnValue('/trainers');

    renderWithIntl(<SortControl />);
    
    const select = screen.getByRole('combobox');
    
    // Simulate user selecting "Newest"
    fireEvent.change(select, { target: { value: 'newest' } });
    
    // Check if the router was pushed with the correct URL
    expect(push).toHaveBeenCalledWith('/trainers?sortBy=newest');

    // Simulate user selecting "Name (Z-A)"
    fireEvent.change(select, { target: { value: 'name_desc' } });
    expect(push).toHaveBeenCalledWith('/trainers?sortBy=name_desc');
  });

  it('should reflect the current sort value from URL params', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseSearchParams.mockReturnValue(new URLSearchParams('sortBy=newest'));
    mockUsePathname.mockReturnValue('/trainers');

    renderWithIntl(<SortControl />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('newest');
  });
});
