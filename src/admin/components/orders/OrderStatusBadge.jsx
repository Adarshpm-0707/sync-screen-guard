import React from 'react';

export default function OrderStatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    processing: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
      styles[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }`}>
      {status}
    </span>
  );
}
