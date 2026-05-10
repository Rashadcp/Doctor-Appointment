// Streaming fallback for dashboard
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-slate-200">
          <div className="h-8 w-32 bg-slate-100 animate-pulse" />
        </div>
        <nav className="p-4 flex-grow space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-50 animate-pulse" />
          ))}
        </nav>
      </aside>

      <main className="flex-grow">
        <header className="bg-white border-b border-slate-200 h-24 px-12 flex items-center">
          <div className="h-8 w-48 bg-slate-100 animate-pulse" />
        </header>
        <div className="p-12 max-w-6xl mx-auto">
          {/* Stats bar skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-slate-200 border border-slate-200 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8">
                <div className="h-3 w-28 bg-slate-100 animate-pulse mb-3" />
                <div className="h-10 w-16 bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="bg-white border border-slate-200">
            <div className="border-b border-slate-200 h-16 bg-slate-50 animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-8 py-6 border-b border-slate-100">
                <div className="h-4 w-20 bg-slate-100 animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 animate-pulse" />
                <div className="h-4 w-28 bg-slate-100 animate-pulse" />
                <div className="h-4 w-16 bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
