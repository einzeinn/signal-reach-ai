'use client';

import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex bg-neo-white font-sans text-neo-black items-center justify-center p-6">
      <div className="max-w-md w-full border-2 border-neo-black bg-white shadow-comic p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 border-2 border-neo-black p-3 bg-red-50" />
        </div>

        <h1 className="text-3xl font-black uppercase mb-2">Oops!</h1>
        <p className="text-gray-600 font-bold mb-4">
          Something went wrong loading the dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border border-gray-300 rounded p-3 mb-6 text-left">
            <p className="text-xs font-mono text-red-600 break-words">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 flex-col">
          <button
            onClick={() => reset()}
            className="bg-neo-teal border-2 border-neo-black px-6 py-2 font-bold shadow-comic active:shadow-comic-hover active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            Try again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-neo-white border-2 border-neo-black px-6 py-2 font-bold shadow-comic hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" /> Go home
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, please check your environment variables and try again.
        </p>
      </div>
    </div>
  );
}
