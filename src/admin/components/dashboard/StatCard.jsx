import React from 'react';

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trendColor = 'text-slate-400',
  gradient = 'from-indigo-600 to-blue-600',
  badgeText = null,
}) {
  return (
    <div className="relative group bg-[#0E1322]/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-4.5 sm:p-5 flex items-start justify-between shadow-xl transition-all duration-300 hover:shadow-indigo-500/5 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

      <div className="space-y-2 relative z-10 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          {badgeText && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {badgeText}
            </span>
          )}
        </div>

        <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">
          {value}
        </h4>

        {description && (
          <p className={`text-[10px] font-bold uppercase tracking-wider ${trendColor} truncate`}>
            {description}
          </p>
        )}
      </div>
      
      {Icon && (
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} shadow-lg text-white ring-1 ring-white/20 transition-transform group-hover:scale-105 duration-300 relative z-10`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      )}
    </div>
  );
}
