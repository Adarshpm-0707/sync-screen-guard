import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data = [] }) {
  // Expected data structure: { date: '2026-07-15', revenue: 2500 }
  
  const formatYAxis = (tick) => {
    return `₹${tick}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {payload[0].payload.date}
          </p>
          <p className="text-xs font-black text-primary-500 mt-1">
            Revenue: ₹{payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-left space-y-4">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Sales Analytics
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
          Past 7 Days Revenue Trend
        </p>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase tracking-widest">
            No chart data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={formatYAxis} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
