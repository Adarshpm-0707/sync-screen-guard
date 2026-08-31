import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#FAFAFA] font-sans">
      <div className="space-y-4 max-w-md bg-white border border-zinc-200 p-10 rounded-3xl shadow-xs">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900">404</h1>
          <h2 className="text-base font-bold text-zinc-800 uppercase tracking-wider mt-1">Page Not Found</h2>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            The page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
