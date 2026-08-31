import React from 'react';
import { Link } from 'react-router-dom';
import CustomerAuthModal from '../components/layout/CustomerAuthModal';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link 
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Store</span>
        </Link>
        <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secure Registration</span>
        </div>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <CustomerAuthModal isOpen={true} isPage={true} initialMode="signup" />
      </div>
    </div>
  );
}
