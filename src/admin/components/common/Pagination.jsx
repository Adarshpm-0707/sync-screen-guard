import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 mt-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
      {/* Items Range Summary */}
      <div className="text-center sm:text-left">
        Showing <span className="text-white font-bold">{startItem}</span> to{' '}
        <span className="text-white font-bold">{endItem}</span> of{' '}
        <span className="text-white font-bold">{totalItems}</span> entries
      </div>

      {/* Button Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-[#0E1322] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#0E1322] text-slate-200 font-bold shadow-sm">
          Page <span className="text-indigo-400">{currentPage}</span> of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-[#0E1322] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
