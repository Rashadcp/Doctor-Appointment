"use client";

import { Stethoscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Stethoscope className="w-12 h-12 text-medical-blue animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Authenticating</span>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};
