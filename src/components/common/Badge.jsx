import React from 'react';

/**
 * Reusable Badge component for status tags, discount pills, and labels.
 * 
 * @param {Object} props
 * @param {'default'|'success'|'warning'|'danger'|'purple'|'neutral'|'gold'} [props.variant='default']
 * @param {'xs'|'sm'|'md'} [props.size='sm']
 * @param {boolean} [props.dot=false]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 */
export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className = '',
  ...rest
}) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold'
  }[size] || 'px-2.5 py-0.5 text-xs';

  const variantClasses = {
    default: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    neutral: 'bg-zinc-900 text-white border-zinc-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gold: 'bg-yellow-50 text-amber-900 border-yellow-200'
  }[variant] || 'bg-zinc-100 text-zinc-800 border-zinc-200';

  const dotColors = {
    default: 'bg-zinc-400',
    neutral: 'bg-white',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    gold: 'bg-amber-500'
  }[variant] || 'bg-zinc-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors}`} />}
      {children}
    </span>
  );
}
