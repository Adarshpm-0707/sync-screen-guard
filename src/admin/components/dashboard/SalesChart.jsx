import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function SalesChart({ data = [] }) {
  const formatYAxis = (tick) => {
    if (tick >= 1000) return `₹${(tick / 1000).toFixed(1)}k`;
    return `₹${tick}`;
  };

  const totalPeriodRevenue = data.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E1322] border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-indigo-400" />
            {payload[0].payload.date}
          </p>
          <p className="text-sm font-black text-indigo-400 mt-1">
            ₹{Number(payload[0].value).toLocaleString()}
          </p>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
            Verified Sales
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4.5 sm:p-6 shadow-xl text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Revenue Dynamics
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5 sm:ml-9">
            Past 7 Days Sales Trend (₹{totalPeriodRevenue.toLocaleString()} recorded)
          </p>
        </div>

        <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
          Live Analytics
        </span>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        {data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            No transaction records in this interval
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                dy={6}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={formatYAxis} 
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorRevenueIndigo)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
