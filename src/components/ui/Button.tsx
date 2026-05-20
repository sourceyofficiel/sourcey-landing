"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white shadow-brand hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:-translate-y-0.5 shadow-sm",
        ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
        enterprise:
          "bg-enterprise-600 text-white shadow-enterprise hover:bg-enterprise-700 hover:-translate-y-0.5 active:translate-y-0",
        dark: "bg-neutral-900 text-white hover:bg-neutral-800 hover:-translate-y-0.5",
        outline:
          "bg-transparent text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-[17px]",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
