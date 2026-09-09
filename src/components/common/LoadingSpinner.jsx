import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading Spinner component.
 * 
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.text]
 * @param {boolean} [props.fullPage=false]
 * @param {string} [props.className='']
 */
export default function LoadingSpinner({
  size = 'md',
  text,
  fullPage = false,
  className = '',
}) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`animate-spin text-zinc-900 ${sizeMap[size] || sizeMap.md}`} />
      {text && (
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
