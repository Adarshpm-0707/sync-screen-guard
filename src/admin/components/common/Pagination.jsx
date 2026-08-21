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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500 font-semibold uppercase tracking-wider">
      {/* Items Range Summary */}
      <div>
        Showing <span className="text-slate-350">{startItem}</span> to{' '}
        <span className="text-slate-350">{endItem}</span> of{' '}
        <span className="text-slate-350">{totalItems}</span> entries
      </div>

      {/* Button Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>

        <span className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/20 text-slate-350 font-bold">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400"
          aria-label="Next page"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
