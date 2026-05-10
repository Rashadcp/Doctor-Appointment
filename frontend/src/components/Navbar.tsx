"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Don't show navbar on auth pages or admin pages
  if (
    !pathname ||
    pathname.includes("/login") || 
    pathname.includes("/register") || 
    pathname.startsWith("/admin")
  ) return null;

  const navLinks = [
    { name: "Find Specialists", href: "/doctors" },
    ...(user ? [
      { name: "Booking History", href: "/dashboard" },
    ] : []),
    ...(user?.role === 'admin' ? [
      { name: "Admin Panel", href: "/admin/dashboard" }
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-8 lg:px-24 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-ink-black flex items-center justify-center">
          <Stethoscope className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tighter uppercase hidden sm:block">
          MedMatch
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
              pathname === link.href ? "text-deep-blue" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {user.name}
            </span>
            <Button 
              variant="ghost" 
              onClick={logout}
              className="h-10 w-10 p-0 flex items-center justify-center text-slate-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Link href="/dashboard">
              <Button variant="black" className="h-10 w-10 p-0 flex items-center justify-center">
                <User className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-[10px] uppercase tracking-widest font-bold">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="black" className="h-10 px-4 text-[10px] uppercase tracking-widest font-bold">Sign Up</Button>
            </Link>
          </>
        )}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center border border-slate-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold uppercase tracking-tighter border-b border-slate-50 pb-4"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Button variant="black" onClick={logout} className="w-full h-14 uppercase tracking-widest">Logout</Button>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="black" className="w-full h-14 uppercase tracking-widest">Sign In</Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
