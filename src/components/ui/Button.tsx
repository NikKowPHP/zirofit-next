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
      "inline-flex items-center justify-center rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all ease-in-out duration-150 active:scale-[0.97] hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transform";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-primary",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
      tertiary:
        "bg-transparent text-foreground hover:bg-accent focus:ring-ring",
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