import React from 'react';

export default function AdminButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  className = '',
}) {
  const baseStyle = 'inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 border border-indigo-500/30',
    secondary: 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md shadow-rose-600/20 border border-rose-500/30',
    success: 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
