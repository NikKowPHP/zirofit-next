
// src/components/ui/Input.tsx
import React from "react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      md: "h-10 text-sm px-3",
      lg: "h-12 text-base px-4",
    };
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-full border border-neutral-300 bg-white py-2 text-neutral-900 ring-offset-[var(--background)] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-blue)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-black dark:text-white dark:placeholder:text-neutral-400",
          sizeStyles[size],
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