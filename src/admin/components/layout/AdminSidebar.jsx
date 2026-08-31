import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users,
  Box, 
  Warehouse, 
  FolderTree, 
  Truck, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import useAdminAuth from '../../hooks/useAdminAuth';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout, adminUser } = useAdminAuth();

  const navSections = [
    {
      title: 'Store Operations',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/admin/customers', label: 'Customers', icon: Users },
        { to: '/admin/shipments', label: 'Shipments', icon: Truck },
      ]
    },

    {
      title: 'Catalog & Inventory',
      items: [
        { to: '/admin/products', label: 'Products', icon: Box },
        { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      ]
    },
    {
      title: 'System & Security',
      items: [
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 md:w-72 bg-[#0E1322] border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-16 md:h-18 px-5 md:px-6 border-b border-slate-800/80 bg-[#0B0F19]/50">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0E1322] rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-black tracking-tight text-white uppercase">
                  SYNC<span className="text-indigo-400">.</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Control Center</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400/90">
                {section.title}
              </div>
              
              <div className="space-y-1 pt-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <item.icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                          }`} />
                          <span className="tracking-wide">{item.label}</span>
                        </div>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-slate-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Store Link */}
          <div className="pt-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2.5">
                <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span>Visit Storefront</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Live</span>
            </a>
          </div>
        </nav>

        {/* Footer Admin Snapshot & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0B0F19]/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-black text-xs">
                {(adminUser?.email?.[0] || 'A').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate leading-tight">
                  {adminUser?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
