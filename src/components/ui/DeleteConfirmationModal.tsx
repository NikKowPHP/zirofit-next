
"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * A reusable modal component for confirming actions.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {(isOpen: boolean) => void} props.setIsOpen - Function to set the open state.
 * @param {() => void} props.onConfirm - Function to call when the action is confirmed.
 * @param {string} [props.title="Confirm Action"] - The title of the modal.
 * @param {string} [props.description="This action may have consequences."] - The description text in the modal.
 * @param {boolean} [props.isPending=false] - Whether the confirmation action is pending.
 * @param {string} [props.confirmButtonText="Confirm"] - The text for the confirm button.
 * @param {"primary" | "secondary" | "danger"} [props.confirmButtonVariant="primary"] - The visual style of the confirm button.
 * @returns {JSX.Element} The rendered ConfirmationModal component.
 */
export function DeleteConfirmationModal({ // Note: Keeping the exported name for backward compatibility
  isOpen,
  setIsOpen,
  onConfirm,
  title = "Confirm Action",
  description = "This action may have consequences.",
  isPending = false,
  confirmButtonText = "Delete", // Default to "Delete"
  confirmButtonVariant = "danger", // Default to "danger"
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isPending?: boolean;
  confirmButtonText?: string;
  confirmButtonVariant?: "primary" | "secondary" | "danger";
}) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title={title}>
      <div className="flex items-start space-x-4">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
            confirmButtonVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
          } sm:mx-0 sm:h-10 sm:w-10`}>
          <ExclamationTriangleIcon
            className={`h-6 w-6 ${
              confirmButtonVariant === 'danger' ? 'text-red-600' : 'text-blue-600'
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="mt-0 text-left">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <Button
          variant={confirmButtonVariant}
          onClick={() => {
            onConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? "Processing..." : confirmButtonText}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}