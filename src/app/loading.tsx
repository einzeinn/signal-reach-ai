'use client';

import { Zap } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex bg-neo-white font-sans text-neo-black">
      {/* SIDEBAR */}
      <aside className="w-64 border-r-2 border-neo-black bg-neo-white flex flex-col p-6 sticky top-0 h-screen z-20">
        <div className="flex items-center gap-2 mb-10">
          <Zap className="w-8 h-8 fill-neo-teal animate-pulse" />
          <h1 className="text-xl font-black uppercase tracking-tighter">SignalReach</h1>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        <header className="flex justify-between items-center border-2 border-neo-black bg-neo-white p-4 shadow-comic">
          <div className="flex items-center gap-2 w-1/3">
            <div className="h-5 w-full bg-gray-200 border-2 border-neo-black rounded animate-pulse" />
          </div>
          <button className="bg-neo-teal border-2 border-neo-black px-4 py-2 font-bold shadow-comic opacity-50">
            + Add Target
          </button>
        </header>

        <div className="grid grid-cols-3 gap-6 items-start">
          {/* LEFT: Lead list skeleton */}
          <section className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase">🔥 Hot Leads</h2>
              <span className="bg-neo-yellow border-2 border-neo-black px-3 py-1 text-xs font-bold shadow-comic opacity-50">
                ⏳ Loading...
              </span>
            </div>

            {/* Skeleton cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-2 border-neo-black bg-neo-white p-5 shadow-comic flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="h-6 w-40 bg-gray-200 border border-neo-black rounded mb-3 animate-pulse" />
                  <div className="h-4 w-60 bg-gray-100 rounded mb-3 animate-pulse" />
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-20 w-20 bg-gray-200 border-2 border-neo-black rounded-full animate-pulse shrink-0" />
              </div>
            ))}
          </section>

          {/* RIGHT: Outreach panel skeleton */}
          <section className="relative border-2 border-neo-black shadow-comic overflow-hidden h-96">
            <div className="absolute inset-0 bg-neo-teal p-4 border-b-2 border-neo-black opacity-30 animate-pulse" />
          </section>
        </div>
      </main>
    </div>
  );
}
