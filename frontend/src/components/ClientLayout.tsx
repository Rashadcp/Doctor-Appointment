'use client';

import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const RealTimeNotifications = dynamic(
  () => import("@/components/RealTimeNotifications").then((mod) => mod.RealTimeNotifications),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RealTimeNotifications />
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "rounded-none border-2 border-slate-900 font-bold uppercase tracking-widest text-[10px]",
        }}
      />
    </AuthProvider>
  );
}