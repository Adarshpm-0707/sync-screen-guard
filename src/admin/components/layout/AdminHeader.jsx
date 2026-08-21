import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import useAdminAuth from '../../hooks/useAdminAuth';

export default function AdminHeader({ onMenuToggle }) {
  const { adminUser, logout } = useAdminAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Mobile Drawer Trigger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacing / Search Placeholder */}
      <div className="hidden sm:block text-xs font-bold text-slate-500 uppercase tracking-widest">
        EZ Fit Screenguard Core Console
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {/* User Card */}
        <div className="flex items-center space-x-2.5 bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <User className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-350 max-w-[150px] truncate">
            {adminUser?.email || 'Administrator'}
          </span>
        </div>

        {/* Quick Sign Out Icon */}
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all duration-200"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
