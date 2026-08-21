import React from 'react';

export default function AdminTable({
  headers,
  children,
  isLoading = false,
  emptyMessage = 'No data available',
}) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-md">
      <table className="w-full border-collapse text-left text-xs min-w-[600px]">
        {/* Table Headers */}
        <thead className="bg-slate-950/40 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4">{h}</th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-800/60 text-slate-350">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Loading details...</span>
                </div>
              </td>
            </tr>
          ) : !children || (Array.isArray(children) && children.length === 0) ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
