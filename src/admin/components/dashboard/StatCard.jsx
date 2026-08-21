import React from 'react';

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trendColor = 'text-slate-400',
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start justify-between shadow-md">
      <div className="space-y-2.5">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h4 className="text-2xl font-black text-white tracking-tight">
          {value}
        </h4>
        {description && (
          <p className={`text-[10px] font-bold uppercase tracking-wider ${trendColor}`}>
            {description}
          </p>
        )}
      </div>
      
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
