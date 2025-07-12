// src/components/ui/Textarea.tsx
import React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "block w-full rounded-md border-0 bg-neutral-500/10 py-2 px-3 text-neutral-900 ring-1 ring-inset ring-black/10 placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-neutral-400 dark:focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-500/5 disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
export { Textarea };