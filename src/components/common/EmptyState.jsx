import React from 'react';
import { PackageOpen } from 'lucide-react';

/**
 * Reusable EmptyState component for empty catalogs, carts, orders, or search results.
 * 
 * @param {Object} props
 * @param {React.ElementType} [props.icon=PackageOpen]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.actionText]
 * @param {Function} [props.onAction]
 * @param {string} [props.className='']
 */
export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-sm ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 mb-4 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
