"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 border-dashed text-center space-y-6">
      <div className="w-16 h-16 border border-slate-100 flex items-center justify-center bg-slate-50 text-slate-300">
        <Icon size={32} strokeWidth={1} />
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink-black">{title}</h3>
        <p className="text-xs font-mono text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="h-11 px-8 bg-ink-black text-white uppercase text-[10px] tracking-widest font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
