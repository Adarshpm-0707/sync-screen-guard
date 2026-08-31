import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import AdminButton from '../components/common/AdminButton';

export default function AdminNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center select-none max-w-lg mx-auto bg-[#0E1322]/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Admin Route Not Found</h2>
        <p className="text-xs text-slate-400 font-semibold tracking-wider leading-relaxed">
          The requested admin view or resource path does not exist or has been relocated.
        </p>
      </div>

      <AdminButton onClick={() => navigate('/admin')} className="px-6 py-3">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>Return to Dashboard</span>
      </AdminButton>
    </div>
  );
}
