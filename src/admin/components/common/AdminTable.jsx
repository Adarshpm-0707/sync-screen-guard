import React from 'react';
import { Database, Inbox } from 'lucide-react';

export default function AdminTable({
  headers = [],
  children,
  isLoading = false,
  emptyMessage = 'No data available',
}) {
  return (
    <div className="w-full border border-slate-800/90 rounded-2xl bg-[#0E1322]/80 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden">
      {/* Mobile Horizontal Scroll Indicator Banner */}
      <div className="sm:hidden px-3.5 py-1.5 bg-[#090D16]/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          Table View
        </span>
        <span className="text-indigo-400 font-mono text-[9px] animate-pulse">← Swipe horizontally →</span>
      </div>

      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
        <table className="w-full border-collapse text-left text-xs min-w-[700px] lg:min-w-full">
          {/* Table Headers */}
          <thead className="bg-[#090D16]/80 border-b border-slate-800/90 text-[10px] uppercase font-black tracking-widest text-slate-300">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative flex h-10 w-10 items-center justify-center">
                      <div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">
                      Fetching records...
                    </span>
                  </div>
                </td>
              </tr>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                      <Inbox className="h-6 w-6" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                      {emptyMessage}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Try adjusting search terms or status filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
