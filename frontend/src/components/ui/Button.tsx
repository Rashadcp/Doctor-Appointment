"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "black";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-ink-black text-white hover:bg-deep-blue",
      secondary: "bg-emerald-500 text-white hover:bg-emerald-600",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
      ghost: "bg-transparent hover:bg-slate-50 text-slate-900",
      black: "bg-ink-black text-white hover:bg-deep-blue",
    };

    const sizes = {
      sm: "px-4 py-2 text-[10px] font-bold uppercase tracking-widest",
      md: "px-6 py-3 text-xs font-bold uppercase tracking-widest",
      lg: "px-8 py-4 text-sm font-bold uppercase tracking-widest",
      xl: "px-10 py-5 text-base font-bold uppercase tracking-widest",
    };

    return (
      <motion.button
        ref={ref}
        transition={{ type: "tween", ease: "linear", duration: 0.15 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep-blue disabled:opacity-50 disabled:pointer-events-none rounded-none border border-transparent",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-3 w-3 animate-spin border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
