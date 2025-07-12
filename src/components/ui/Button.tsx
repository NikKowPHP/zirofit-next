// src/components/ui/Button.tsx
import React from "react";

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
      "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ease-in-out duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-inner shadow-indigo-900/10 hover:from-indigo-600 hover:to-indigo-600 focus:ring-indigo-500",
      secondary:
        "bg-neutral-200/80 dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-300/80 dark:border-neutral-600/60 shadow-sm hover:bg-neutral-300/80 dark:hover:bg-neutral-700/80 focus:ring-indigo-500",
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
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };