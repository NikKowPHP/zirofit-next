
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface FormState {
  success?: boolean;
  error?: string | null;
  messageKey?: string | null;
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
  const t = useTranslations('ServerActions');
  const stateRef = useRef(formState);
  const onSuccessRef = useRef(onSuccess);

  // Keep the onSuccess callback reference updated
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    // Only trigger on actual state change, not on re-renders from the parent
    if (formState !== stateRef.current) {
      if (formState?.error) {
        toast.error(formState.error);
      } else if (formState?.success && formState?.messageKey) {
        toast.success(t(formState.messageKey));
        onSuccessRef.current?.();
      }
      // Update the ref to the new state so it doesn't fire again until the state changes again
      stateRef.current = formState;
    }
  }, [formState, t]);
}