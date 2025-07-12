// src/components/ui/Input.tsx
import React from "react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "block w-full rounded-md border-0 bg-neutral-500/10 py-2 px-3 text-neutral-900 ring-1 ring-inset ring-black/10 placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-neutral-400 dark:focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-500/5 disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
export { Input };