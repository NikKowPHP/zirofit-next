"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, ReactNode } from "react";

/**
 * A reusable Modal component built with Headless UI.
 * It handles opening, closing, animations, and accessibility features like focus trapping.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {(value: boolean) => void} props.setIsOpen - Function to set the open state.
 * @param {ReactNode} props.children - The content to be displayed inside the modal.
 * @param {string} [props.title] - An optional title for the modal.
 * @returns {JSX.Element} The rendered Modal component.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="My Modal">
 *   <p>This is the modal content.</p>
 * </Modal>
 */
export function Modal({
  isOpen,
  setIsOpen,
  children,
  title,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  {title && (
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}