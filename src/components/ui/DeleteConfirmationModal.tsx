"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * A reusable modal component for confirming delete actions.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {(isOpen: boolean) => void} props.setIsOpen - Function to set the open state.
 * @param {() => void} props.onConfirm - Function to call when the delete button is confirmed.
 * @param {string} [props.title="Confirm Deletion"] - The title of the modal.
 * @param {string} [props.description="This action cannot be undone."] - The description text in the modal.
 * @param {boolean} [props.isPending=false] - Whether the confirmation action is pending.
 * @returns {JSX.Element} The rendered DeleteConfirmationModal component.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [isDeleting, setIsDeleting] = useState(false);
 * const handleDelete = async () => {
 *   setIsDeleting(true);
 *   // ... delete logic
 *   setIsDeleting(false);
 * };
 * <DeleteConfirmationModal
 *   isOpen={isOpen}
 *   setIsOpen={setIsOpen}
 *   onConfirm={handleDelete}
 *   isPending={isDeleting}
 * />
 */
export function DeleteConfirmationModal({
  isOpen,
  setIsOpen,
  onConfirm,
  title = "Confirm Deletion",
  description = "This action cannot be undone.",
  isPending = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isPending?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title={title}>
      <div className="flex items-start space-x-4">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationTriangleIcon
            className="h-6 w-6 text-red-600"
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
          variant="danger"
          onClick={() => {
            onConfirm();
            // Let the parent component close the modal after the action is complete
          }}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
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