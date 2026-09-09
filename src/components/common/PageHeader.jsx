import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable PageHeader component for customer pages.
 * 
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.badge]
 * @param {Array<{label: string, to?: string}>} [props.breadcrumbs]
 * @param {React.ReactNode} [props.actions]
 * @param {string} [props.className='']
 */
export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  actions,
  className = ''
}) {
  return (
    <div className={`border-b border-zinc-200 bg-white/80 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-xs text-zinc-500 mb-3" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" />}
                {item.to ? (
                  <Link to={item.to} className="hover:text-zinc-900 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-zinc-900">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {badge && (
              <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
