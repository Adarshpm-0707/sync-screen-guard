import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import AdminButton from '../components/common/AdminButton';

export default function AdminNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center select-none">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <AlertTriangle className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="font-display text-xl font-extrabold text-white">Resource Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm font-semibold uppercase tracking-wider leading-relaxed">
          The requested admin sub-page or resource path is either restricted or does not exist.
        </p>
      </div>

      <AdminButton onClick={() => navigate('/admin')}>
        Return to Control Center
      </AdminButton>
    </div>
  );
}
