// Streaming fallback — renders instantly while the doctors page data loads
export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-12 px-8 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 w-72 bg-slate-100 animate-pulse mb-4" />
          <div className="h-5 w-96 bg-slate-100 animate-pulse" />
        </div>
      </section>

      {/* Grid skeleton */}
      <main className="max-w-7xl mx-auto px-8 lg:px-24 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-slate-200 bg-white animate-pulse">
              <div className="aspect-[4/5] bg-slate-100" />
              <div className="p-6 space-y-4">
                <div className="h-3 w-20 bg-slate-100" />
                <div className="h-6 w-full bg-slate-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-slate-50" />
                  <div className="h-8 bg-slate-50" />
                </div>
                <div className="h-12 w-full bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
