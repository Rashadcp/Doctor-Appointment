"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Stethoscope, ShieldAlert } from "lucide-react";
import { Button } from "./ui/Button";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== 'admin') {
        // Not an admin, redirect or show error
        console.warn("Unauthorized access attempt to Admin Engine.");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Stethoscope className="w-12 h-12 text-ink-black animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing_Admin_Console</span>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full text-center border-2 border-slate-900 p-12">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Access Denied</h2>
          <p className="text-xs font-mono text-slate-500 mb-8 uppercase tracking-widest">
            Protocol Violation: Your credentials do not possess administrative clearance for this sector.
          </p>
          <Button variant="black" className="w-full h-14 uppercase font-bold tracking-widest" onClick={() => router.push("/")}>
            Return to Public Sector
          </Button>
        </div>
      </div>
    );
  }

  return user && user.role === 'admin' ? <>{children}</> : null;
};
