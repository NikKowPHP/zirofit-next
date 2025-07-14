// src/components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "tertiary";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? "span" : "button";

    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all ease-in-out duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

    const variantStyles = {
      primary:
        "bg-[var(--primary-blue)] text-white hover:opacity-90 focus:ring-[var(--primary-blue)]",
      secondary:
        "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-[var(--primary-blue)]",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      tertiary:
        "bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 focus:ring-indigo-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <Comp
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };