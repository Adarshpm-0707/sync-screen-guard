import React, { useState } from 'react';
import { Menu, User, LogOut, Shield, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAdminAuth from '../../hooks/useAdminAuth';
import { cleanBloatedStorage, getStorageUsage } from '../../../utils/storageCleaner.js';

export default function AdminHeader({ onMenuToggle }) {
  const { adminUser, logout } = useAdminAuth();
  const [cleaningStatus, setCleaningStatus] = useState(null);

  const handleCleanStorage = () => {
    const res = cleanBloatedStorage({ forceAllCaches: true });
    setCleaningStatus(`Cleaned! Freed ${res.formattedFreed}`);
    setTimeout(() => setCleaningStatus(null), 3500);
  };

  return (
    <header className="h-16 md:h-18 border-b border-slate-800/80 bg-[#0E1322]/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shrink-0 sticky top-0">
      {/* Left: Mobile Drawer Trigger + Breadcrumb/Status */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">Core Online</span>
          </div>

          <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
            SYNC • CORE CONSOLE
          </div>
        </div>
      </div>

      {/* Right: User Actions & Clean Cache Button */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Purge Storage Button */}
        <button
          onClick={handleCleanStorage}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-violet-500/40 hover:bg-violet-500/10 text-slate-400 hover:text-violet-300 transition-all text-xs font-semibold cursor-pointer"
          title="Purge bloated local storage & cached products"
        >
          {cleaningStatus ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[11px]">{cleaningStatus}</span>
            </>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-violet-300" />
              <span className="hidden sm:inline text-[11px]">Clean Storage</span>
            </>
          )}
        </button>

        {/* User Card Link to Settings */}
        <Link 
          to="/admin/settings"
          className="flex items-center space-x-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 transition-all group cursor-pointer"
          title="Account Settings"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors max-w-[130px] truncate leading-tight">
              {adminUser?.email?.split('@')[0] || 'Administrator'}
            </p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-tight">
              Superadmin
            </p>
          </div>
        </Link>

        {/* Quick Sign Out Icon */}
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 transition-all duration-200 cursor-pointer shadow-sm"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
