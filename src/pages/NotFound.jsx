import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-dark-card border border-dark-border text-red-500 shadow-lg shadow-red-500/5">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white">404</h1>
          <h2 className="text-lg font-bold text-slate-200 mt-2">Page Not Found</h2>
          <p className="text-xs text-slate-400 mt-2">
            The page you are looking for does not exist or has been relocated to another address.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md shadow-primary-500/15"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
