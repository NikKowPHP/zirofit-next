"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface FormState {
  success?: boolean;
  error?: string | null;
  message?: string | null;
  // Allows for Zod-flattened errors, but we don't use them directly in the toast
  errors?: any;
}

interface UseServerActionToastProps {
  formState: FormState;
  onSuccess?: () => void;
}

/**
 * A hook to display toast notifications based on a server action's state from useFormState.
 *
 * @param {UseServerActionToastProps} props - The component props.
 * @param {FormState} props.formState - The state object returned from `useFormState`.
 * @param {() => void} [props.onSuccess] - An optional callback to run on success, e.g., to reset a form.
 */
export function useServerActionToast({
  formState,
  onSuccess,
}: UseServerActionToastProps) {
  useEffect(() => {
    // We check for `error` first. The `message` might be present in both cases.
    if (formState?.error) {
      toast.error(formState.error);
    } else if (formState?.success && formState?.message) {
      toast.success(formState.message);
      onSuccess?.();
    }
  }, [formState, onSuccess]);
}