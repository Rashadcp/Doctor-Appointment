import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminRoute } from "@/components/AdminRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-slate-50 blueprint-grid">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Administrative Console • Operational</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider">Admin User</span>

            </div>
            <div className="w-10 h-10 border border-slate-200 flex items-center justify-center bg-slate-50">
              <span className="font-bold text-xs">AU</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          {children}
        </main>

        <footer className="h-12 border-t border-slate-200 bg-white px-8 flex items-center justify-between">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
            © 2026 HealthEngine. All Rights Reserved.
          </span>

        </footer>
      </div>
    </div>
  </AdminRoute>
  );
}
