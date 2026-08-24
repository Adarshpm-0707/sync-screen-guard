import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Box, Warehouse, FolderTree, Truck, Settings, LogOut, ShieldAlert, X } from 'lucide-react';
import useAdminAuth from '../../hooks/useAdminAuth';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAdminAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/products', label: 'Products', icon: Box },
    { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/shipments', label: 'Shipments', icon: Truck },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-md">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-black tracking-tight text-white uppercase">
              Admin<span className="text-primary-500">.</span>
            </span>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Control */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
