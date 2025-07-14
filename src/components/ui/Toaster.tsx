"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/**
 * A pre-styled Toaster component from `sonner`.
 * It automatically adapts to the current theme (light/dark).
 *
 * @param {object} props - The props for the Sonner component.
 * @returns {JSX.Element} The rendered Toaster component.
 *
 * @example
 * // Add this to your root layout
 * <Toaster />
 *
 * // Call it from a client component or server action
 * import { toast } from "sonner";
 * toast.success("Event has been created.");
 */
const Toaster = (props: React.ComponentProps<typeof Sonner>) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-neutral-900 group-[.toaster]:text-neutral-900 group-[.toaster]:dark:text-neutral-100 group-[.toaster]:border-neutral-200 group-[.toaster]:dark:border-neutral-800 group-[.toaster]:shadow-lg",
          description:
            "group-[.toast]:text-neutral-500 group-[.toast]:dark:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };