"use client";

import React from "react";

interface ClientMotionWrapperProps {
  children: React.ReactNode;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  className?: string;
  [key: string]: any;
}

/**
 * Lightweight replacement for framer-motion's motion.div.
 * Uses CSS animations instead of shipping ~60KB of JS.
 */
export const ClientMotionWrapper = ({ children, className = "", ...props }: ClientMotionWrapperProps) => {
  return (
    <div className={`animate-slideUp ${className}`}>
      {children}
    </div>
  );
};
