// src/components/ui/Input.tsx
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`block w-full rounded-md border-neutral-300 bg-white/10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800 ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
export { Input };
