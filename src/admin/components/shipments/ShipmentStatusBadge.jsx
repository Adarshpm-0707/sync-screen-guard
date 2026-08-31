import React from 'react';

export default function ShipmentStatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();

  const configs = {
    pending: {
      label: 'Pending Dispatch',
      classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    dispatched: {
      label: 'Dispatched',
      classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    in_transit: {
      label: 'In Transit',
      classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    transit: {
      label: 'In Transit',
      classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    out_for_delivery: {
      label: 'Out For Delivery',
      classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400',
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
  };

  const config = configs[normalized] || {
    label: normalized.replace(/_/g, ' '),
    classes: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-sm ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
