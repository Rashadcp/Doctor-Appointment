"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Performant SideDrawer using CSS animations instead of Framer Motion.
 */
export const SideDrawer = ({ isOpen, onClose, title, subtitle, children, footer }: SideDrawerProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      
      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 z-[61] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-24 border-b border-slate-200 px-8 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
            {subtitle && <p className="text-[10px] text-slate-400 font-mono mt-1">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
        
        {footer && (
          <div className="p-8 border-t border-slate-200 bg-white sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
