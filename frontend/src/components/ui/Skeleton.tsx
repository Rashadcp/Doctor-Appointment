"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn("bg-slate-100 animate-pulse border border-slate-200", className)} />
  );
};
