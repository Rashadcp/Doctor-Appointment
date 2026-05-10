"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut,
  ChevronRight,
  ClipboardList,
  Grid,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Doctors", href: "/admin/doctors", icon: Users },
  { name: "Schedule", href: "/admin/schedule", icon: Calendar },
  { name: "Appointments", href: "/admin/appointments", icon: ClipboardList },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Successfully signed out.");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ink-black flex items-center justify-center">
            <span className="text-white font-mono font-bold">H</span>
          </div>
          <span className="font-bold uppercase tracking-tight">HealthEngine</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 border border-slate-200 flex items-center justify-center bg-white"
        >
          {isOpen ? <X size={20} /> : <Grid size={20} />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 hidden lg:flex flex-col",
      )}>
        <div className="h-20 border-b border-slate-200 flex items-center px-8 gap-3">
          <div className="w-8 h-8 bg-ink-black flex items-center justify-center">
            <span className="text-white font-mono font-bold">H</span>
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest leading-none">Admin</h1>

          </div>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 transition-colors duration-200 border border-transparent",
                  isActive 
                    ? "bg-slate-50 border-slate-200 text-deep-blue" 
                    : "text-slate-500 hover:text-ink-black hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-deep-blue" />}
              </Link>
            );
          })}


        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-600 transition-colors duration-200 group"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[51] lg:hidden animate-fadeIn bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={cn(
              "w-4/5 h-full bg-white border-r border-slate-200 flex flex-col p-6 transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ink-black flex items-center justify-center">
                  <span className="text-white font-mono font-bold">H</span>
                </div>
                <span className="font-bold uppercase tracking-tight">HealthEngine</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 border",
                      isActive 
                        ? "bg-slate-50 border-slate-200 text-deep-blue" 
                        : "border-transparent text-slate-600"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-bold uppercase tracking-widest text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-4 text-red-500 w-full"
              >
                <LogOut size={20} />
                <span className="font-bold uppercase tracking-widest text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
