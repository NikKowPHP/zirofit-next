// src/components/ui/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
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
      "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ease-in-out duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      secondary:
        "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <Comp
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };
