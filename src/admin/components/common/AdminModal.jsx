import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto">
      {/* Animated Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full ${maxWidth} my-auto bg-[#0E1322] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 z-10`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800/90 bg-[#090D16]/60">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
            <h3 className="font-display text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent text-left">
          {children}
        </div>
      </div>
    </div>
  );
}
