import React from 'react';
import { renderWithIntl, screen, waitFor, within } from '../../../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BenefitsEditor from './BenefitsEditor';
import * as benefitActions from '@/app/[locale]/profile/actions/benefit-actions';
import { toast } from 'sonner';
import { useFormStatus } from "react-dom";

// Mock the server actions
jest.mock('@/app/[locale]/profile/actions/benefit-actions', () => ({
  addBenefit: jest.fn(),
  updateBenefit: jest.fn(),
  deleteBenefit: jest.fn(),
  updateBenefitOrder: jest.fn(),
}));

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// DO NOT mock 'react-dom' here. It is handled globally in jest.setup.ts.
jest.mock('sortablejs', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
  })),
}));

const mockInitialBenefits = [
  { id: '1', title: 'Benefit One', description: 'Desc 1', createdAt: new Date('2023-01-01'), updatedAt: new Date('2023-01-01'), orderColumn: 1, profileId: 'p1', iconName: null, iconStyle: 'outline' as const },
  { id: '2', title: 'Benefit Two', description: 'Desc 2', createdAt: new Date('2023-01-02'), updatedAt: new Date('2023-01-02'), orderColumn: 2, profileId: 'p1', iconName: null, iconStyle: 'outline' as const },
];

describe('BenefitsEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useFormStatus for all tests in this suite
    (useFormStatus as jest.Mock).mockReturnValue({ pending: false });
  });

  it('optimistically removes a benefit on delete and reverts on failure', async () => {
    const user = userEvent.setup();
    (benefitActions.deleteBenefit as jest.Mock)
      .mockResolvedValueOnce({ success: false, error: "Deletion failed" });

    renderWithIntl(<BenefitsEditor initialBenefits={mockInitialBenefits} />);

    // Check initial state
    expect(screen.getByText('Benefit One')).toBeInTheDocument();
    
    // Find and click delete button for the first benefit
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    // Confirmation modal appears, scope query to inside the modal
    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: "Delete" });
    await user.click(confirmButton);

    // Assert item is removed optimistically BEFORE action resolves
    await waitFor(() => {
      expect(screen.queryByText('Benefit One')).not.toBeInTheDocument();
    });

    // Wait for the action to complete and UI to revert
    await waitFor(() => {
      expect(screen.getByText('Benefit One')).toBeInTheDocument();
    });

    // Check that an error toast was shown
    expect(toast.error).toHaveBeenCalledWith("Deletion failed");
  });

  it('optimistically removes a benefit on delete and shows success toast', async () => {
    const user = userEvent.setup();
    (benefitActions.deleteBenefit as jest.Mock)
      .mockResolvedValueOnce({ success: true, deletedId: '1', messageKey: 'benefitDeleted' });
    
    renderWithIntl(<BenefitsEditor initialBenefits={mockInitialBenefits} />);

    expect(screen.getByText('Benefit One')).toBeInTheDocument();
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);
    
    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: "Delete" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Benefit One')).not.toBeInTheDocument();
    });

    expect(toast.success).toHaveBeenCalledWith('Benefit deleted.');
  });

  it('shows loading state on submit button when form is pending', () => {
    (useFormStatus as jest.Mock).mockReturnValue({ pending: true });
    
    renderWithIntl(<BenefitsEditor initialBenefits={[]} />);

    const submitButton = screen.getByRole('button', { name: /Saving.../i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});