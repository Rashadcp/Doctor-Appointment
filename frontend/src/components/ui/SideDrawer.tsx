"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string; // Adding subtitle support as well
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SideDrawer = ({ isOpen, onClose, title, subtitle, children, footer }: SideDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-black/30 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 z-[61] flex flex-col shadow-2xl"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
