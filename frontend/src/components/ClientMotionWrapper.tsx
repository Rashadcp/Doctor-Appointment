"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface ClientMotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export const ClientMotionWrapper = ({ children, ...props }: ClientMotionWrapperProps) => {
  return (
    <motion.div {...props}>
      {children}
    </motion.div>
  );
};
